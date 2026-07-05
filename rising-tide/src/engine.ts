/**
 * engine.ts — RisingTideEngine, the only stateful object (spec 02 §2, §4).
 *
 * Pure state machine: (state, command) → (state', events[]). No DOM, no timers, no persistence,
 * no Math.random. `placePiece` is the single turn command; events are emitted in the canonical
 * order (spec 02 §3). Determinism: every draw flows through the one injected Rng in a frozen order.
 *
 * E0 SCOPE (spec 13): determinism skeleton — board, clearing, scoring, tide, goals (lines/score/
 * survive), refill, terminals, snapshot/restore. Elements, specials, DDA, star-band resolution,
 * gap-fill and the solvability floor arrive in later phases and are marked inline.
 */

import { autoSeed, createRng, rngFromState, type Rng } from './rng.ts';
import {
  absoluteCells,
  clearLines,
  findFullLines,
  hasAnyMove,
  legalMoves as legalMovesFor,
  placeCells,
} from './board.ts';
import { generateTray } from './generator.ts';
import { scorePlacement } from './scoring.ts';
import { applyTide, TIDE_CAP } from './tide.ts';
import { levelById } from './levels.ts';
import {
  blankState,
  type Fairness,
  type GameEvent,
  type GameState,
  type LevelDef,
  type NewGameConfig,
  type Reward,
  type SerializedGame,
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

    if (config.surface === 'voyage') {
      if (!level) throw new Error("newGame: surface 'voyage' requires a level");
      s.level = level;
      s.goal = level.goal;
      s.goalTarget = level.target;
      s.moveLimit = level.moveLimit ?? 0;
      // E3: obstacle/element seeding draws from the rng HERE, before the first tray (spec 03 §1.2).
    }

    // Opening tray (the first hand).
    s.tray = generateTray(this.#rng);
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

    const events: GameEvent[] = [];

    // 1. Stamp piece; count the turn.
    const abs = absoluteCells(piece.cells, r, c);
    s.board = placeCells(s.board, piece.cells, r, c, piece.color);
    piece.placed = true;
    s.turns++;
    s.movesUsed++;
    events.push({ type: 'placed', pieceIdx, color: piece.color, cells: abs });

    // 2. Find + clear full lines simultaneously.
    const { rows, cols } = findFullLines(s.board);
    const N = rows.length + cols.length;
    let clearedCount = 0;
    if (N > 0) {
      const res = clearLines(s.board, rows, cols);
      s.board = res.board;
      clearedCount = res.cleared.length;

      // 3. Combo up; 4. score.
      s.combo += 1;
      const pts = scorePlacement(N, clearedCount, s.combo);
      s.score += pts;
      s.totalLines += N;
      events.push({ type: 'linesCleared', rows, cols, cells: res.cleared, points: pts });
      events.push({ type: 'combo', value: s.combo });
    } else if (s.combo > 0) {
      // 3. Combo broken (E5-combo grace lands later; E0 breaks immediately).
      events.push({ type: 'comboBroken', was: s.combo });
      s.combo = 0;
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
      events.push({ type: 'tideRise', tide: s.tide, phase: s.tidePhase, rises: s.tideRises });
    }

    // 6–7. Element resolution (barnacle/coral/pearl/anchor/current/bonus/storm) — E3.

    // 8. Goal progress.
    if (s.goal) {
      s.goalProgress = this.#goalProgressValue();
      events.push({ type: 'goalProgress', goal: s.goal, progress: s.goalProgress, target: s.goalTarget });
    }

    // 9. Refill only when all three are placed — new tray from the post-clear board.
    if (s.tray.every((p) => p.placed)) {
      s.tray = generateTray(this.#rng);
      s.hands++;
      events.push({ type: 'trayRefilled', tray: cloneTray(s.tray), deterministic: s.deterministic });
    }
    s.rngCalls = this.#rng.calls;

    // 10. Terminals — WIN is checked before loss (spec 02 §3 terminal rule).
    if (this.#goalMet()) {
      s.status = 'won';
      s.stars = 3; // PLACEHOLDER — star-band resolution is E4 (spec 09). Default cozy 3★ for now.
      const rewards: Reward[] = [];
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

  // ── goal helpers (E0 subset: lines / score / survive) ───────────────────────
  #goalProgressValue(): number {
    switch (this.#state.goal) {
      case 'lines':
        return this.#state.totalLines;
      case 'score':
        return this.#state.score;
      case 'survive':
        return this.#state.tideRises;
      default:
        return this.#state.goalProgress; // multi/combo/collect/barnacle → E3
    }
  }

  #goalMet(): boolean {
    const s = this.#state;
    if (!s.goal) return false;
    switch (s.goal) {
      case 'lines':
        return s.totalLines >= s.goalTarget;
      case 'score':
        return s.score >= s.goalTarget;
      case 'survive':
        return s.tideRises >= s.goalTarget;
      default:
        return false; // E3 goals
    }
  }

  #tideActive(): boolean {
    return this.#state.surface === 'tide' || this.#state.goal === 'survive';
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
      s.tray = generateTray(this.#rng);
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
    s.tray = generateTray(this.#rng);
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
