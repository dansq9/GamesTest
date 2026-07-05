/**
 * engine.ts — RisingTideEngine, the only stateful object (spec 02 §2, §4).
 *
 * Pure state machine: (state, command) → (state', events[]). No DOM, no timers, no persistence,
 * no Math.random. `placePiece` is the single turn command; events are emitted in the canonical
 * order (spec 02 §3). Determinism: every draw flows through the one injected Rng in a frozen order.
 *
 * SCOPE (spec 13): E0 determinism skeleton — board, clearing, scoring, tide, goals (lines/score/
 * survive), refill, terminals, snapshot/restore. E1 adds the ContextualGenerator: per-hand safety
 * floor, pressure dial, no-flood, gap-fill. Elements, specials, DDA, star-band resolution, and the
 * Guided global rescue rule + fill ceiling arrive in later phases and are marked inline.
 */

import { autoSeed, createRng, rngFromState, type Rng } from './rng.ts';
import {
  absoluteCells,
  boxCells,
  findFullLines,
  hasAnyMove,
  legalMoves as legalMovesFor,
  placeCells,
  rowColCells,
} from './board.ts';
import { COLORS } from './pieces.ts';
import { computeDDA, NEUTRAL_PROFILE } from './dda.ts';
import { contextFor, generateTray, type GenContext } from './generator.ts';
import { resolveClearedCells, resolveClears, seedElements, type ClearResolution } from './elements.ts';
import { fillPct } from './board.ts';
import { resolveStars } from './starbands.ts';
import { milestoneBonus, starPearls } from './economy.ts';
import { applyTide, TIDE_CAP } from './tide.ts';
import { levelById } from './levels.ts';
import {
  blankState,
  type Fairness,
  type GameEvent,
  type GameState,
  type LevelDef,
  type NewGameConfig,
  type PowerUpId,
  type Reward,
  type SerializedGame,
  type SpecialId,
  type TrayPiece,
} from './state.ts';

const SNAPSHOT_VERSION = 1;

function cloneTray(tray: TrayPiece[]): TrayPiece[] {
  return tray.map((p) => ({ ...p, cells: p.cells.map(([r, c]) => [r, c] as [number, number]) }));
}

type Command = { state: Readonly<GameState>; events: GameEvent[] };

export class RisingTideEngine {
  #rng: Rng;
  #state: GameState;
  #undoSnapshot: SerializedGame | null = null; // pre-last-placement capture for the Undo-Last power-up

  constructor() {
    // Placeholder rng/state until newGame; never used before newGame is called.
    this.#rng = createRng('uninitialized');
    this.#state = blankState('zen', 'fair', 'uninitialized', 0);
  }

  // ── construction ──────────────────────────────────────────────────────────
  newGame(config: NewGameConfig): Command {
    const seed = config.seed ?? autoSeed();
    this.#rng = createRng(seed);

    const level = config.level;
    const fairness: Fairness = level?.fairness ?? 'fair';
    const s = blankState(config.surface, fairness, seed, config.gamesPlayed ?? 0);
    // Freeze the DDA deltas for this game (neutral in Seeded). Part of the reproducibility contract:
    // same seed + same profile ⇒ same board (spec 11 §4).
    s.dda = computeDDA(config.profile ?? NEUTRAL_PROFILE, level?.chapter, fairness);

    if (config.surface === 'voyage') {
      if (!level) throw new Error("newGame: surface 'voyage' requires a level");
      s.level = level;
      s.goal = level.goal;
      s.goalTarget = level.target;
      s.moveLimit = level.moveLimit ?? 0;
      // Element seeding draws from the rng HERE, before the first tray (spec 03 §1.2, spec 04 §1.0).
      if (level.elements && level.elements.length > 0) {
        seedElements(s.board, s.elements, level.elements, this.#rng);
      }
    }

    // Opening tray (the first hand).
    s.tray = generateTray(this.#rng, s.board, this.#genCtx(s));
    s.hands = 1;
    s.rngCalls = this.#rng.calls;

    this.#state = s;
    return { state: s, events: [{ type: 'trayRefilled', tray: cloneTray(s.tray), deterministic: s.deterministic }] };
  }

  getState(): Readonly<GameState> {
    return this.#state;
  }

  // ── queries (pure, no state change) ────────────────────────────────────────
  canPlace(pieceIdx: number, r: number, c: number): boolean {
    const piece = this.#state.tray[pieceIdx];
    if (!piece || piece.placed) return false;
    return this.#canPlacePiece(piece, r, c);
  }

  legalMoves(pieceIdx: number): Array<[number, number]> {
    const piece = this.#state.tray[pieceIdx];
    if (!piece || piece.placed) return [];
    return legalMovesFor(this.#state.board, piece.cells);
  }

  hasAnyMove(): boolean {
    return hasAnyMove(this.#state.board, this.#state.tray);
  }

  #canPlacePiece(piece: TrayPiece, r: number, c: number): boolean {
    // Delegate to board.canPlace via a shape check.
    for (const [dr, dc] of piece.cells) {
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || rr >= 8 || cc < 0 || cc >= 8) return false;
      if (this.#state.board[rr]![cc] !== null) return false;
    }
    return true;
  }

  // ── the one turn command ────────────────────────────────────────────────────
  placePiece(pieceIdx: number, r: number, c: number): Command {
    const s = this.#state;

    // Validity — rejected calls return unchanged state + no events (no throw), spec 02 §4.
    if (s.status !== 'playing') return { state: s, events: [] };
    const piece = s.tray[pieceIdx];
    if (!piece || piece.placed || !this.#canPlacePiece(piece, r, c)) return { state: s, events: [] };

    // Capture a one-deep undo point only when an Undo-Last is available (avoids per-move overhead).
    this.#undoSnapshot = s.powerups.undo > 0 ? this.snapshot() : null;

    const events: GameEvent[] = [];

    // 1. Stamp piece; count the turn.
    const abs = absoluteCells(piece.cells, r, c);
    s.board = placeCells(s.board, piece.cells, r, c, piece.color);
    piece.placed = true;
    s.turns++;
    s.movesUsed++;
    events.push({ type: 'placed', pieceIdx, color: piece.color, cells: abs });

    // 2. Resolve the clear — a normal line clear, or a special-block blast (spec 05 §2).
    const special = piece.special;
    let rows: number[] = [];
    let cols: number[] = [];
    let N = 0;
    let resolved: ClearResolution | null = null;
    if (special === 'lineBlaster') {
      resolved = resolveClearedCells(s.board, s.elements, rowColCells(r, c));
      N = 2; // row + column counted as two lines (spec 05 §2.1)
    } else if (special === 'bomb') {
      resolved = resolveClearedCells(s.board, s.elements, boxCells(r, c));
      N = 0; // area blast scores flat unless it happens to complete lines (spec 05 §2.2)
    } else {
      const full = findFullLines(s.board);
      rows = full.rows;
      cols = full.cols;
      N = rows.length + cols.length;
      if (N > 0) resolved = resolveClears(s.board, s.elements, rows, cols);
    }

    // 3. Apply the clear, or run the one-move grace on a non-clearing placement (spec 05 §1.2).
    const clearedCount = resolved ? resolved.cleared.length : 0;
    if (resolved && clearedCount > 0) {
      s.board = resolved.board;
      s.elements = resolved.elements;

      s.combo += 1;
      s.comboGrace = true; // any clear refreshes the grace
      if (s.combo > s.comboBest) s.comboBest = s.combo;
      if (N > s.bestMulti) s.bestMulti = N;

      // 4. Score: bomb blasts score flat (cells×10); line clears / line-blaster use N²·cells·10.
      const base = special === 'bomb' ? clearedCount * 10 : N * N * clearedCount * 10;
      const pts = base * resolved.bonusMult + s.combo * 50;
      s.score += pts;
      s.totalLines += N;
      s.pearlsCollected += resolved.pearls.length;
      s.barnaclesRemoved += resolved.barnacles.length;
      s.coralsCleared += resolved.corals.length;

      events.push({ type: 'linesCleared', rows, cols, cells: resolved.cleared, points: pts });
      events.push({ type: 'combo', value: s.combo });
      for (const h of resolved.coralHits) {
        events.push({ type: 'coralHit', cells: [h.cell], remaining: h.remaining });
      }
      // Combo-earned specials — disabled in Seeded so the shared board stays identical (spec 05 §1.4).
      if (s.fairness !== 'seeded') this.#grantComboRewards(events);
    } else if (s.combo > 0) {
      if (s.comboGrace) {
        s.comboGrace = false; // spend the one forgiven move — streak survives
        events.push({ type: 'comboHeld', value: s.combo });
      } else {
        events.push({ type: 'comboBroken', was: s.combo });
        s.combo = 0;
        s.comboRewardAt = 0; // a fresh streak can earn specials again
      }
    }

    // 5. Tide (emit even when tide falls; carries phase + rises).
    if (this.#tideActive()) {
      const next = applyTide(
        { tide: s.tide, tidePhase: s.tidePhase, tideRises: s.tideRises, prevTideFloor: s.prevTideFloor },
        s.turns,
        N,
        s.level?.tideRate ?? 1.0,
      );
      s.tide = next.tide;
      s.tidePhase = next.tidePhase;
      s.tideRises = next.tideRises;
      s.prevTideFloor = next.prevTideFloor;
      if (s.tide > s.maxTide) s.maxTide = s.tide; // run-peak, for the survive star metric
      events.push({ type: 'tideRise', tide: s.tide, phase: s.tidePhase, rises: s.tideRises });
    }

    // 6–8. Collectible / reward events (after tide, per canonical order).
    if (resolved) {
      if (resolved.pearls.length > 0) {
        events.push({ type: 'pearlCollected', cells: resolved.pearls, count: resolved.pearls.length, total: s.pearlsCollected });
      }
      if (resolved.barnacles.length > 0) {
        events.push({ type: 'barnacleRemoved', cells: resolved.barnacles, count: resolved.barnacles.length, total: s.barnaclesRemoved });
      }
      if (resolved.bonusMult > 1) {
        events.push({ type: 'elementEvent', element: 'bonus', detail: { mult: resolved.bonusMult } });
      }
    }

    // 8b. Anchor unlocks (turn-based; a lock expires K turns after seeding).
    this.#unlockAnchors(events);

    // 9. Goal progress.
    if (s.goal) {
      s.goalProgress = this.#goalProgressValue();
      events.push({ type: 'goalProgress', goal: s.goal, progress: s.goalProgress, target: s.goalTarget });
    }

    // 9. Refill only when all three are placed — new tray from the post-clear board.
    if (s.tray.every((p) => p.placed)) {
      s.tray = generateTray(this.#rng, s.board, this.#genCtx(s));
      s.hands++;
      events.push({ type: 'trayRefilled', tray: cloneTray(s.tray), deterministic: s.deterministic });
    }
    s.rngCalls = this.#rng.calls;

    // 10. Terminals — WIN is checked before loss (spec 02 §3 terminal rule).
    if (this.#goalMet()) {
      s.status = 'won';
      s.stars = this.#resolveStars();
      const pearls = starPearls(s.stars) + milestoneBonus(s.level?.n, s.level?.milestone);
      const rewards: Reward[] = [{ kind: 'pearls', amount: pearls }];
      if (s.level?.milestone) rewards.push({ kind: 'chapterUnlock' });
      events.push({ type: 'won', stars: s.stars, rewards, nextName: s.level?.nextName });
    } else {
      const drowned = this.#tideActive() && s.tide >= TIDE_CAP;
      const noMoves = !hasAnyMove(s.board, s.tray);
      const outOfMoves = s.moveLimit > 0 && s.movesUsed >= s.moveLimit;
      if (drowned) {
        s.status = 'lost';
        s.lossReason = 'drowned';
        events.push({ type: 'lost', reason: 'drowned' });
      } else if (noMoves) {
        s.status = 'lost';
        s.lossReason = 'no-moves';
        events.push({ type: 'lost', reason: 'no-moves' });
      } else if (outOfMoves) {
        s.status = 'lost';
        s.lossReason = 'out-of-moves';
        events.push({ type: 'lost', reason: 'out-of-moves' });
      }
      // narrowMiss (spec 02 §3 11c) is an E2 host-retry affordance; deferred.
    }

    return { state: s, events };
  }

  // ── goal helpers (all 7 goal types) ─────────────────────────────────────────
  #goalProgressValue(): number {
    const s = this.#state;
    switch (s.goal) {
      case 'lines':
        return s.totalLines;
      case 'score':
        return s.score;
      case 'survive':
        return s.tideRises;
      case 'multi':
        return s.bestMulti; // most lines cleared in one placement
      case 'combo':
        return s.comboBest; // best combo streak reached
      case 'collect':
        return s.pearlsCollected + s.coralsCleared; // level seeds one collectible type
      case 'barnacle':
        return s.barnaclesRemoved;
      default:
        return s.goalProgress;
    }
  }

  #goalMet(): boolean {
    return this.#state.goal ? this.#goalProgressValue() >= this.#state.goalTarget : false;
  }

  /** Resolve 3/2/1 stars for a just-won level (spec 09). Endless/no-level wins default to 3★. */
  #resolveStars(): number {
    const s = this.#state;
    if (!s.level || !s.goal) return 3;
    return resolveStars(s.level, {
      goal: s.goal,
      chapter: s.level.chapter,
      target: s.goalTarget,
      moveLimit: s.moveLimit,
      movesUsed: s.movesUsed,
      maxTide: s.maxTide,
      endFillPct: fillPct(s.board),
      score: s.score,
      turns: s.turns,
      hasBonus: (s.level.elements ?? []).some((e) => e.kind === 'bonus'),
    }).stars;
  }

  #tideActive(): boolean {
    return this.#state.surface === 'tide' || this.#state.goal === 'survive';
  }

  #genCtx(s: GameState): GenContext {
    return contextFor({
      surface: s.surface,
      fairness: s.fairness,
      chapter: s.level?.chapter,
      levelNumber: s.level?.n,
      milestone: s.level?.milestone,
      teach: s.level?.teachAssist,
      gamesPlayed: s.gamesPlayed,
      dda: s.dda,
      rng: this.#rng,
    });
  }

  /** Unlock anchor cells whose lock has expired (turn-based, spec 04 §1.4). */
  #unlockAnchors(events: GameEvent[]): void {
    const s = this.#state;
    const unlocked: [number, number][] = [];
    for (let r = 0; r < s.board.length; r++) {
      for (let c = 0; c < s.board.length; c++) {
        const cell = s.board[r]![c];
        if (cell?.locked && (cell.unlockTurn ?? Infinity) <= s.turns) {
          s.board[r]![c] = null;
          s.elements[r]![c] = null;
          unlocked.push([r, c]);
        }
      }
    }
    if (unlocked.length > 0) events.push({ type: 'elementEvent', element: 'anchor', detail: { unlocked } });
  }

  /** Grant combo-milestone specials into the satchel (spec 05 §1.4 ladder: ×3 LB, ×6 Bomb, ×10 LB). */
  #grantComboRewards(events: GameEvent[]): void {
    const s = this.#state;
    const ladder: Array<[number, SpecialId]> = [
      [3, 'lineBlaster'],
      [6, 'bomb'],
      [10, 'lineBlaster'],
    ];
    for (const [milestone, special] of ladder) {
      if (s.combo >= milestone && milestone > s.comboRewardAt) {
        s.satchel[special] += 1;
        s.comboRewardAt = milestone;
        events.push({ type: 'comboReward', special, combo: s.combo });
      }
    }
  }

  // ── monetization hooks (spec 02 §8) ─────────────────────────────────────────
  grantMoves(n: number): Command {
    const s = this.#state;
    s.moveLimit += n;
    s.grantedMoves += n;
    if (s.status === 'lost' && s.lossReason === 'out-of-moves') {
      s.status = 'playing';
      s.lossReason = undefined;
    }
    return { state: s, events: [{ type: 'movesGranted', added: n, movesUsed: s.movesUsed, moveLimit: s.moveLimit }] };
  }

  /**
   * Deploy an earned special from the satchel — appends a 1×1 special block to the current tray for
   * the player to place. Draws one color from the stream (recorded; snapshot-safe). Disabled in
   * Seeded so the shared board is never perturbed (spec 05 §1.4, §2.4).
   */
  deploySpecial(special: SpecialId): Command {
    const s = this.#state;
    if (s.status !== 'playing' || s.fairness === 'seeded' || s.satchel[special] <= 0) {
      return { state: s, events: [] };
    }
    s.satchel[special] -= 1;
    const color = COLORS[Math.floor(this.#rng.next() * COLORS.length)]!;
    const pieceIdx = s.tray.length;
    s.tray.push({ pieceId: special, cells: [[0, 0]], color, special, placed: false });
    s.rngCalls = this.#rng.calls;
    return { state: s, events: [{ type: 'specialDeployed', special, pieceIdx }] };
  }

  /**
   * Use a satchel power-up (spec 10 §3): Undo-Last (rewind the last placement), +Moves (grant 5),
   * Tide-Push (lower tide by 2). Consumes one from inventory. Undo is disabled in Seeded (rewinding
   * the RNG would desync the shared board) and needs a captured undo point.
   */
  usePowerUp(kind: PowerUpId): Command {
    const s = this.#state;
    if (s.powerups[kind] <= 0) return { state: s, events: [] };

    if (kind === 'undo') {
      const snap = this.#undoSnapshot;
      if (s.fairness === 'seeded' || !snap) return { state: s, events: [] };
      const remainingUndo = s.powerups.undo - 1; // consume one (survives the restore below)
      this.#undoSnapshot = null; // one-deep
      this.restore(snap); // reverts board/score/rng to the pre-placement point
      this.#state.powerups.undo = remainingUndo;
      return { state: this.#state, events: [{ type: 'undone', turns: this.#state.turns }, { type: 'powerUpUsed', powerUp: 'undo' }] };
    }

    if (kind === 'addMoves') {
      const revivable = s.status === 'lost' && s.lossReason === 'out-of-moves';
      if (s.status !== 'playing' && !revivable) return { state: s, events: [] };
      s.powerups.addMoves -= 1;
      const cmd = this.grantMoves(5);
      return { state: cmd.state, events: [{ type: 'powerUpUsed', powerUp: 'addMoves' }, ...cmd.events] };
    }

    // tidePush
    if (s.status !== 'playing') return { state: s, events: [] };
    s.powerups.tidePush -= 1;
    const cmd = this.pushTide(2);
    return { state: cmd.state, events: [{ type: 'powerUpUsed', powerUp: 'tidePush' }, ...cmd.events] };
  }

  pushTide(p: number): Command {
    const s = this.#state;
    const newTide = Math.max(0, s.tide - p);
    s.tide = newTide;
    s.prevTideFloor = Math.floor(newTide);
    // Never touches tideRises — survive progress is never rectified downward (spec 02 §8, 08 D9).
    return { state: s, events: [{ type: 'tidePushed', amount: p, newTide }] };
  }

  continueAfterLoss(opts?: { rewarded?: boolean }): Command {
    const s = this.#state;
    void opts;
    if (s.status !== 'lost') return { state: s, events: [] };
    const events: GameEvent[] = [];
    if (s.lossReason === 'drowned') {
      s.tide = Math.max(0, s.tide - 3); // prototype "sandbag"
      s.prevTideFloor = Math.floor(s.tide);
      s.status = 'playing';
      s.continues++;
      events.push({ type: 'continued', tideAfter: s.tide, reason: 'drowned' });
    } else if (s.lossReason === 'no-moves') {
      // E1 will force a GUARANTEED-SAFE tray here; E0 regenerates a normal tray.
      s.tray = generateTray(this.#rng, s.board, this.#genCtx(s));
      s.hands++;
      s.rngCalls = this.#rng.calls;
      s.status = 'playing';
      s.continues++;
      events.push({ type: 'continued', reason: 'no-moves' });
      events.push({ type: 'trayRefilled', tray: cloneTray(s.tray), deterministic: s.deterministic });
    }
    s.lossReason = undefined;
    return { state: s, events };
  }

  rerollTray(opts?: { rewarded?: boolean }): Command {
    const s = this.#state;
    void opts;
    if (s.status !== 'playing') return { state: s, events: [] };
    s.tray = generateTray(this.#rng, s.board, this.#genCtx(s));
    s.rerolls++;
    s.rngCalls = this.#rng.calls;
    return { state: s, events: [{ type: 'trayRerolled', tray: cloneTray(s.tray), deterministic: s.deterministic }] };
  }

  // ── persistence (spec 02 §7, spec 03 §1.4) ──────────────────────────────────
  snapshot(): SerializedGame {
    const { level, ...rest } = this.#state;
    // Deep-copy so the snapshot is a DETACHED point-in-time capture — continued play on this
    // engine must never mutate a snapshot already taken (board/tray/elements are nested arrays).
    const state = structuredClone({ ...rest, levelId: level?.id });
    return {
      version: SNAPSHOT_VERSION,
      seed: this.#state.seed,
      rngState: this.#rng.getState(), // the exact resume cursor (spec 03 §1.4)
      rngCalls: this.#rng.calls,
      levelId: level?.id,
      state,
    };
  }

  restore(s: SerializedGame): Command {
    if (s.version !== SNAPSHOT_VERSION) throw new Error(`Unsupported snapshot version ${s.version}`);
    // Exact rehydration: rebuild the rng directly at the persisted 32-bit accumulator.
    this.#rng = rngFromState(s.rngState, s.rngCalls);

    const level: LevelDef | undefined = s.levelId ? levelById(s.levelId) : undefined;
    // Deep-copy IN so the restored engine is independent of the snapshot (and of any sibling
    // engine restored from the same snapshot).
    const { levelId: _drop, ...core } = structuredClone(s.state);
    void _drop;
    this.#state = { ...(core as GameState), level };
    return { state: this.#state, events: [] };
  }
}
