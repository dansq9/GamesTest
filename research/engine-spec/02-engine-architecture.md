# 02 · Engine Architecture

Implementation-ready contract for the UI-agnostic **Rising Tide** engine. Pure TypeScript: no DOM, no framework, no globals, no `Math.random`. Every claim is grounded in the v5 prototype (`class Component extends DCLogic`) or design docs 01–04. Invented values are tagged **[OPEN — product owner]**.

The engine is a **pure state machine**: `(state, command) → (state', events[])`. It never mutates in place-visibly (returns readonly state), never schedules timers, never touches persistence. The prototype interleaves logic with `setState`, `setTimeout(clearDur)`, `localStorage`, and `_sfx`; **all of that is UI/host and is stripped.** Clear animations, autosave, sound, and RV countdowns are host concerns — the engine resolves a placement synchronously and emits an ordered event list the host renders at its own pace.

---

## 1. Module / file layout

A single package `@risingtide/engine`, no runtime deps.

```
src/
  index.ts              Public barrel. Exports RisingTideEngine, all types, createRng, PIECES, LEVELS.
  engine.ts             RisingTideEngine class — the only stateful object. Owns GameState + rng.
                        Orchestrates commands, produces event lists. Thin; delegates to pure modules.
  state.ts              GameState, TrayPiece, GameEvent, SerializedGame, Reward types + factory
                        (blankState). No logic, just shapes + defaults.
  board.ts              Board ops (all pure, board-in → board-out):
                        canPlace, hasAnyMove, legalMoves, placeCells, findFullLines,
                        clearCells (returns removed cells), fillPct.
  scoring.ts            scorePlacement(N, cellsCleared, combo) → pts. Pure. The N*N*cells*10 + combo*50 formula.
  tide.ts               Tide model: riseFor(turns), applyTide(state, N), phaseFor(t),
                        accrueTideRises(prevFloor, tide). Pure.
  pieces.ts             PIECES: the 18-shape library with weights (doc 01). COLORS: 5 color ids.
                        Frozen data, no rotation. Piece lookup by id.
  generator/
    index.ts            TrayGenerator interface + GenContext.
    contextual.ts       ContextualGenerator — the production generator (pressure dial, gap-fill,
                        no-flood, solvability floor). The default. Lifts _genTray.
  solvability.ts        Bounded-lookahead check: canClearHand(board, pieces) — can the 3 pieces be
                        played in SOME order without force-death. Used by generator + tests.
  elements.ts           ElementSpec system + per-element resolvers (barnacle, coral, pearl, anchor,
                        current, bonus, storm). Data-driven cell modifiers. Seeding + on-clear/on-turn hooks.
  goals.ts              Goal evaluation: evalGoal(goalType, state, placementCtx) → { progress, won }.
                        The 8 goal types. Lifts _checkVoyageGoal.
  levels.ts             LevelDef type + LEVELS: LevelDef[] (40-map voyage, doc 03/04). Chapter grouping.
  assist.ts             The assist-fade curve: assistLevelFor(ctx) → { gapFill, pressure, solvability }.
                        Data-driven tunables, not code branches. Replaces `challengeLevel < 10`.
  rng.ts                mulberry32, fnv1a (seedFromDate), createRng(seed). The ONLY randomness source.
  resolve.ts            resolveWin(state, level) → { stars, rewards, nextLevel }. Lifts _resolveVoyageWin.
  monetization.ts       grantMoves / continueAfterLoss / rerollTray helpers (pure transforms + flags).
```

Everything under `board/scoring/tide/goals/solvability/generator` is **pure and independently unit-testable**. `engine.ts` is the only place state lives.

---

## 2. Public API — final contract

```ts
class RisingTideEngine {
  // ── construction ──
  // rng is injected. If seed omitted, host passes a random 32-bit seed; the engine NEVER
  // calls Math.random itself. This is the fix for the prototype's null→Math.random fallback:
  // there is always a concrete seeded rng, so casual play is as deterministic as Seeded play
  // given its (recorded) seed.
  constructor();

  newGame(config: NewGameConfig): { state: Readonly<GameState>; events: GameEvent[] };
  getState(): Readonly<GameState>;

  // ── queries (pure, no state change, no events) ──
  canPlace(pieceIdx: number, r: number, c: number): boolean;
  legalMoves(pieceIdx: number): Array<[number, number]>;   // all (r,c) origins where piece fits
  hasAnyMove(): boolean;                                    // any unplaced tray piece placeable anywhere

  // ── mutation (the one turn command) ──
  placePiece(pieceIdx: number, r: number, c: number): { state: Readonly<GameState>; events: GameEvent[] };

  // ── monetization hooks (logic-only; UI decides WHEN to call) — see §8 ──
  grantMoves(n: number): { state: Readonly<GameState>; events: GameEvent[] };
  continueAfterLoss(opts?: ContinueOpts): { state: Readonly<GameState>; events: GameEvent[] };
  rerollTray(opts?: RerollOpts): { state: Readonly<GameState>; events: GameEvent[] };

  // ── persistence ──
  snapshot(): SerializedGame;                               // fully serializable, deterministic to restore
  restore(s: SerializedGame): { state: Readonly<GameState>; events: GameEvent[] };
}

interface NewGameConfig {
  mode: Mode;                 // 'zen' | 'tide' | 'blitz' | 'voyage'
  level?: LevelDef;           // required for mode 'voyage'; ignored otherwise
  seed?: string;              // e.g. UTC date for daily. If omitted, engine generates+records a random seed.
  gamesPlayed?: number;       // lifetime count, drives the assist-fade curve (§ assist.ts). Default 0.
}

interface ContinueOpts { rewarded?: boolean; }             // metadata only, for host analytics
interface RerollOpts    { rewarded?: boolean; }
```

**Additions justified beyond the doc-02 sketch:**
- `constructor()` + explicit `seed` recording — needed so *casual* seeds are reproducible for bug reports and so there is no `Math.random` path (§7).
- `gamesPlayed` on `NewGameConfig` — the assist-fade curve is driven by lifetime games, not the removed `challengeLevel < 10` (doc 02 §C, doc 03 §G).
- `grantMoves / continueAfterLoss / rerollTray` promoted to **first-class API** (§8) so the deterministic engine never needs a later refactor for hybrid monetization.
- `newGame` and `restore` return `events` (`[trayRefilled, ...]`) so the host renders the opening tray through the same pipeline as any refill.
- **`undo()` is dropped from the public core.** The prototype's `undoGrid/undoTray` is a single-level UI convenience (`freeUndoUsed`), and an undo that rewinds RNG breaks determinism guarantees. If the design keeps a limited undo it is a host feature layered on `snapshot()/restore()` (take a snapshot before each `placePiece`), **[OPEN — product owner]** whether undo ships at all.

---

## 3. `GameState`, `GameEvent`, and event ordering

### GameState

```ts
type ColorId   = 'coral' | 'teal' | 'amber' | 'violet' | 'lime';
type ElementId = 'barnacle' | 'coral2' | 'pearl' | 'anchor' | 'current' | 'bonus' | 'storm';
type Mode      = 'zen' | 'tide' | 'blitz' | 'voyage';
type GoalType  = 'lines' | 'multi' | 'combo' | 'survive' | 'score' | 'collect' | 'barnacle';
type Status    = 'playing' | 'won' | 'lost';
type TidePhase = 'calm' | 'rising' | 'critical' | 'drowning';

interface Cell { color: ColorId | ElementId; element?: ElementId; }
// A placed player block: { color }. A barnacle: { color:'barnacle', element:'barnacle' }.
// Coral: { element:'coral2', hits:2 }. Board cell is Cell | null (null = empty).
type Board = (Cell | null)[][];               // 8×8, row-major

interface TrayPiece {
  pieceId: string;                            // library id (doc 01), no rotation
  cells: [number, number][];                  // resolved offsets (denormalized for host convenience)
  color: ColorId;
  placed: boolean;
}

interface GameState {
  // identity / determinism
  mode: Mode;
  seed: string;                               // the seed this game was created from (always present)
  gamesPlayed: number;                        // lifetime, feeds assist curve
  rngCalls: number;                           // # of rng draws consumed — the resume cursor (§7)

  // board & hand
  board: Board;
  tray: TrayPiece[];                          // exactly 3
  turns: number;                              // +1 per PLACEMENT (not per hand) — prototype semantics
  hands: number;                              // +1 per full tray refill (derived; convenience)

  // scoring
  score: number;
  combo: number;                              // consecutive clearing placements
  totalLines: number;

  // tide (mode 'tide' or any level with a survive/tide element)
  tide: number;                               // float water level
  tidePhase: TidePhase;
  tideRises: number;                          // accumulated integer upward crossings (never decreases)
  prevTideFloor: number;                      // internal accrual cursor (floor(tide) last seen)

  // level / goal (voyage; undefined-ish for endless)
  level?: LevelDef;
  goal?: GoalType;
  goalProgress: number;
  goalTarget: number;
  movesUsed: number;                          // placements counted toward a moveLimit
  moveLimit: number;                          // 0 = unlimited (turn-based only; NEVER a clock)

  // elements / collection
  elements: (ElementId | null)[][];           // parallel 8×8 modifier layer (pearl marks empty cells here)
  pearlsCollected: number;
  barnaclesRemoved: number;

  // outcome
  status: Status;
  lossReason?: 'no-moves' | 'drowned' | 'out-of-moves';
  stars?: number;                             // set on status 'won'
  continues: number;                          // # of continueAfterLoss used this game (§8)
  rerolls: number;                            // # of rerollTray used this game (§8)
  grantedMoves: number;                       // extra moves added via grantMoves (§8)
  deterministic: boolean;                     // false once a NON-seeded reroll/continue occurred (§8)
}
```

Notes grounded in prototype: `turns++` per placement (line 1229); tray regenerates only when `allPlaced` (1283, 1359, 1401); barnacle is a board cell AND element-layer marker, pearl is element-layer only over an empty cell (`_seedObstacles` 798–828); `tideRises` accrues integer floor crossings and never decreases (1273–1276).

### LevelDef (from docs 02/03/04)

```ts
interface LevelDef {
  id: string; name: string; nextName?: string;   // nextName → the 'won' event ("Next: ___", doc 03 §D)
  chapter: string;                                // 'shallows' | 'reef' | 'deep' | 'openwater' | 'endless'
  goal: GoalType; target: number;
  moveLimit?: number;                             // 0/undefined = unlimited
  mode: Mode;                                     // engine fairness mode for the level
  elements?: ElementSpec[];                       // obstacles/collectibles to seed
  milestone?: boolean;                            // chapter capstone → kinder assist floor + ceremony (doc 04 §D)
  seedPolicy?: 'none' | 'date' | 'date+level';    // §7 — 'date+level' is the recommended default [OPEN]
}

interface ElementSpec { kind: ElementId; count: number; params?: Record<string, number>; }
```

`Mode` here is the **fairness** dial (Guided/Fair/Seeded per doc 02 §A). Since the prototype conflates fairness with `zen/tide`, we split: `NewGameConfig.mode` is the *play surface* (zen/tide/blitz/voyage) and the assist curve derives the *fairness posture* from `level.mode` + `gamesPlayed` (assist.ts). A voyage level literally names its fairness via `LevelDef.mode: 'guided'|'fair'|'seeded'` — treat `LevelDef.mode` as the fairness enum and `NewGameConfig.mode` as the surface. **[OPEN — product owner]**: confirm this two-axis split vs. a single enum.

### GameEvent

```ts
type GameEvent =
  | { type: 'placed'; pieceIdx: number; color: ColorId; cells: [number,number][] }
  | { type: 'linesCleared'; rows: number[]; cols: number[]; cells: [number,number][]; points: number }
  | { type: 'combo'; value: number }
  | { type: 'comboBroken'; was: number }
  | { type: 'tideRise'; tide: number; phase: TidePhase; rises: number }
  | { type: 'pearlCollected'; cells: [number,number][]; count: number; total: number }
  | { type: 'barnacleRemoved'; cells: [number,number][]; count: number; total: number }
  | { type: 'coralHit'; cells: [number,number][]; remaining: number }          // coral2 downgraded, not yet cleared
  | { type: 'elementEvent'; element: ElementId; detail: Record<string, unknown> } // anchor unlock, current drift, storm fire
  | { type: 'goalProgress'; goal: GoalType; progress: number; target: number }
  | { type: 'trayRefilled'; tray: TrayPiece[]; deterministic: boolean }
  | { type: 'narrowMiss'; goal: GoalType; progress: number; target: number }   // move-limit hit, 1–2 short (doc 03 §D lever 2)
  | { type: 'movesGranted'; added: number; movesUsed: number; moveLimit: number }
  | { type: 'continued'; tideAfter?: number; reason: 'drowned' | 'no-moves' }
  | { type: 'trayRerolled'; tray: TrayPiece[]; deterministic: boolean }
  | { type: 'won'; stars: number; rewards: Reward[]; nextName?: string }
  | { type: 'lost'; reason: 'no-moves' | 'drowned' | 'out-of-moves' };

interface Reward { kind: 'pearls' | 'palette' | 'backdrop' | 'title' | 'chapterUnlock'; amount?: number; id?: string; }
```

### Canonical event ordering for one `placePiece`

The host renders in exactly this order; ordering is the contract (doc 02 §D). Events for a step are omitted when that step is a no-op (e.g. no clear → no `linesCleared`).

```
1. placed                       always
2. linesCleared                 if N > 0  (rows+cols simultaneous, prototype 1234–1248)
3. combo | comboBroken          combo if N>0; comboBroken if N==0 and prior combo>0 (1250–1251)
4. coralHit                     if a cleared line downgraded a 2-hit coral (before its cells free)
5. tideRise                     if mode has tide (emit even when tide falls; carries phase + rises) (1264–1277)
6. pearlCollected               if cleared cells covered pearls (1343–1350)
7. barnacleRemoved              if cleared cells covered barnacles (1346)
8. elementEvent                 anchor tick-down/unlock, current drift, storm fire (turn-based, telegraphed)
9. goalProgress                 always when a goal is active (recomputed post-clear) (_checkVoyageGoal)
10. trayRefilled                only if all 3 were placed → new tray from post-clear board (1359, 1401)
11a. won                        if goal met → status 'won', resolveWin runs (1374–1377)
11b. lost                       else if game-over → status 'lost' (1361, 1402)
11c. narrowMiss                 else if move-limit reached and goal 1–2 short (host offers instant retry)
```

Terminal rule: `won` / `lost` are mutually exclusive and always last. **Win is checked before loss** (prototype resolves voyage win before the game-over branch, 1372–1381) — a placement that both meets the goal and fills the board counts as a **win**.

---

## 4. Turn / hand lifecycle (precise, matched to prototype)

- **Turn = one placement.** `placePiece` is the only turn command. `turns++` on every placement (1229).
- **Validity:** reject if `pieceIdx` invalid, already `placed`, or `!canPlace` (1215–1216). Rejected calls return unchanged state + empty events (no throw).
- **Placement resolution (synchronous, one call):**
  1. Stamp piece cells into board with the piece color (1224–1225); mark tray slot `placed` (1228).
  2. Find full rows + cols → clear **simultaneously** (1234–1248). Distinct cleared cells deduped.
  3. `combo = N>0 ? combo+1 : 0`; capture `comboBroken` length (1250–1251).
  4. Score `N*N*cells*10 + combo*50` when `N>0` (1256–1258).
  5. Tide (if applicable): `rise = turns≤10?0.25 : turns≤30?0.5 : turns≤60?0.75 : 1.0`; `tide += rise`; `if N>0 tide -= N*1.5`; clamp ≥0; recompute phase; accrue `tideRises` on integer floor crossings (1264–1277).
  6. Resolve cleared cells: null them out; collect pearls / remove barnacles / downgrade-or-clear coral on those cells (1343–1350; coral extends this).
  7. Advance elements (anchor timers, current drift, storm triggers) — turn-based only, never clock.
  8. Recompute goal progress (goals.ts / `_checkVoyageGoal` 830–843).
  9. **`allPlaced = tray.every(placed)`** → if true, generate a **new tray from the post-clear board** (1283, 1359). Else keep remaining tray. `hands++` on refill.
  10. Evaluate terminals (see below).
- **New tray generates only when all 3 are placed** (doc 01, prototype 1359/1401). A partially-placed tray persists across turns.

### Game-over conditions per mode (prototype 1361, 1402, 1404, 1421, 1439)

| Condition | Applies to | Source |
|---|---|---|
| `!hasAnyMove(board, activeTray)` after placement (uses the **new** tray if just refilled, else remaining tray) | all modes | 1361, 1402 |
| `tide >= 8` | tide surface / survive-goal levels | 1361, 1402 |
| `movesUsed >= moveLimit` and goal not met | levels with `moveLimit>0` | 1439–1440 |
| goal met | voyage levels | win, checked first, 1374 |

**Deviations from prototype (noted, with reason):**
- Prototype checks game-over *inside* a `setTimeout(clearDur)` after the clear animation. **We resolve synchronously** and let the host animate; determinism and testability require no timers. Same logic, no delay.
- Prototype's `challenge` mode ("board empty within move budget", 1368/1404) is **dropped** — doc 01 says voyage supersedes it.
- Prototype exposes `tide>=8` drown as an RV "continue" offer *before* declaring loss (1421). We keep this as an explicit host decision: engine emits `lost`, host may call `continueAfterLoss()` (§8) — engine does not embed the RV availability check (that's host/economy).
- `blitz` (120s timer) is the sole clock and is **host-owned**: the engine plays blitz identically to zen; the countdown and its game-over live entirely in the host (doc 01, non-negotiable §3). Engine never reads wall-clock time.

---

## 5. Injected-RNG design (determinism plumbing)

**Single source.** `rng.ts` exports `createRng(seed: string): Rng` where `Rng` wraps `mulberry32(fnv1a(seed))` and **counts its draws**:

```ts
interface Rng { next(): number; calls: number; clone(): Rng; }
```

- `mulberry32` and `fnv1a` are lifted byte-exact from the prototype (`_mulberry32` 578–585, `_seedFromDate` 586–590) — integer-exact, cross-platform identical.
- The engine holds exactly one `Rng`. **There is no `Math.random` anywhere in the package** (ESLint-ban it). This is the fix doc 02 §E and doc 01 demand: the prototype's `_rand()` falls back to `Math.random` when `_rng` is null (591), so casual color/obstacle rolls are non-deterministic. Here, `newGame` **always** builds a concrete `Rng` — from `config.seed` if given, else from a random 32-bit seed the engine generates once and **records in `state.seed`**. Casual play is therefore reproducible from its recorded seed, and Seeded mode is byte-identical for everyone.

**Every draw routes through the one `Rng`, in a fixed order** so the seed fully determines the game:
1. **Tray generation** (per hand): for each of 3 slots — piece pick (roulette over weights, prototype 1132), then color pick (`COLORS[floor(rng.next()*5)]`, 1185). Gap-fill probability roll (`rng.next() < gapFillP`, 1167) and any re-roll on unfitness (1171) also draw from it, in slot order.
2. **Colors** — routed through the same `Rng` (prototype used `_rand()` here already, but only seeded when `_rng` set; now always seeded).
3. **Obstacle / element seeding** — `_seedObstacles` cell picks (804) and any element placement draws route through the same `Rng`. Prototype seeded these via `Math.random` in voyage (`_rng=null`, 770); now they always draw from the seed.

**Draw-order invariant:** generator and seeder must draw in a **fixed, documented sequence** (slots 0→1→2; within a slot: gap-fill roll → piece pick → fitness re-rolls → color). `state.rngCalls = rng.calls` is persisted as the **resume cursor** (§7). Changing draw order is a breaking change to all recorded seeds — lock it with a golden-master test (`seed X ⇒ identical event stream`, doc 02 §E).

---

## 6. Generator interface

```ts
interface TrayGenerator {
  generate(board: Board, ctx: GenContext): TrayPiece[];   // returns exactly 3, all placeable-safe per §solvability
}

interface GenContext {
  fairness: 'guided' | 'fair' | 'seeded';   // from LevelDef.mode (doc 02 §A)
  fillPct: number;                          // filled/64 (prototype 1109)
  assist: AssistLevel;                      // from assist.ts — { gapFill:0..1, pressure:0..1, solvabilityFloor:true }
  rng: Rng;                                 // the ONE injected rng (§5); ALL randomness flows through this
  guardrails: { noFlood: boolean; maxBigPerHand: number };  // noFlood off only in 'seeded'? [OPEN]
  library: readonly Piece[];                // pieces.ts PIECES
}
```

`ContextualGenerator` (default) lifts `_genTray` (1095–1189) with these formalizations:
- **Pressure dial** by `assist.pressure` scaling the prototype multipliers (crowded ≥4-cell ×0.22, veryCrowded ≥3-cell ×0.35, crowded ≤2-cell ×2.4; thresholds 0.60 / 0.78) — strength curved, never fully off (doc 02 §C).
- **Gap-fill assist** only when `assist.gapFill > 0` (Guided): first slot, prob `assist.gapFill` (replaces fixed 0.55), offer a ≤2-cell piece that completes a line now (`gapFillPiece`, 1137–1154). Tapers to 0 by end of Chapter 1 (doc 02 §C).
- **No-flood:** never three ≥4-cell pieces in guided/fair (`bigCount>=2 → cap 3`, 1163).
- **Solvability floor:** always on. **Upgrade** the prototype's per-piece `fitsAnywhere` + `dot` fallback (1171–1180) to a real bounded lookahead: `solvability.ts::canClearHand(board, [p0,p1,p2])` verifies the three can be played in *some* order without a force-dead end; if it fails, re-roll the offending slot (cap N re-rolls, then fall back to a guaranteed-safe small-piece hand so generation always terminates — doc 02 §E). Milestone levels get the kindest floor (doc 04 §D).

The generator is swappable so QA can inject a deterministic stub and the difficulty harness can A/B tunings (doc 04 §E).

---

## 7. Snapshot / restore contract

```ts
interface SerializedGame {
  version: number;              // schema version for migrations
  seed: string;                 // original game seed
  rngCalls: number;             // draw cursor — how many times rng.next() has been consumed
  mode: Mode;
  levelId?: string;             // rehydrate LevelDef from LEVELS by id (defs are static data, not serialized)
  state: Omit<GameState, 'level'> & { levelId?: string };   // full state minus the fat LevelDef
  // monetization determinism flags travel with state: deterministic, rerolls, continues, grantedMoves
}
```

**What serializes:** everything needed to reproduce the run — `seed`, `rngCalls`, board, elements layer, tray, all counters (score/combo/turns/hands/tide/tideRises/prevTideFloor/goalProgress/movesUsed), status, and the monetization flags. `LevelDef` is **not** serialized (it's static content); only `levelId` is stored and rehydrated from `LEVELS`.

**Deterministic restore (the contract):** `restore` rebuilds the `Rng` from `seed`, then **fast-forwards it `rngCalls` draws** (`for(i<rngCalls) rng.next()`) so the next generation continues the *exact* sequence. This is the clean replacement for the prototype's `mulberry32(seedFromDate ^ (turns+1))` XOR hack (955) — that hack only approximates the stream position and breaks once colors/obstacles also draw from the seed. **Advancing by recorded draw-count is exact.** Test: `restore(snapshot(g))` then play → identical event stream to playing `g` straight through (doc 02 §E "resume == fresh play").

**Non-deterministic games** (a game where `state.deterministic` went false via a non-seeded reroll/continue, §8) still snapshot/restore correctly for *save-and-continue*, but are flagged so they are excluded from leaderboard/daily verification.

---

## 8. Monetization-adjacent engine hooks (logic-only, designed now)

The 45–65 hybrid model (rewarded video + IAP: "continue", "+N moves", "reroll tray") is wired in **now** as first-class API so a deterministic engine never needs a later refactor. The engine implements the *effect*; the **host decides when to call and owns the RV/IAP flow** (the prototype's `_offerRV`, `_resolveDrown`, `rt_rvCount` are host, 651–710). Each hook returns `{state, events}` like any command.

| Hook | Effect | State/events | Grounded in |
|---|---|---|---|
| `grantMoves(n)` | Raise `moveLimit += n`, `grantedMoves += n`; if game was `lost` with `out-of-moves`, set `status:'playing'`. | `movesGranted`; state `moveLimit/movesUsed/grantedMoves`. **Deterministic** (no draw). | doc 02 §8; new — supports "+N moves" |
| `continueAfterLoss(opts)` | Revive from a loss. Tide-drown → `tide = max(0, tide-3)` (the prototype "sandbag", 694), `status:'playing'`, `continues++`. No-moves → force a **guaranteed-safe tray** (small pieces) so play resumes. | `continued`; `trayRefilled` if a tray was regenerated. | `_resolveDrown` 689–710 |
| `rerollTray(opts)` | Replace the current (unplaced) tray with a fresh generated one. | `trayRerolled`; `deterministic` flag on the event. | new — "reroll tray" |
| `pushTide(p)` | Push tide down by `p` units: `tide = max(0, tide - p)`, recompute phase. **Never touches `tideRises`** — survive progress is never rectified downward. | `tidePushed { amount, newTide }`; no RNG drawn. | `05 §3.1`, `08 D9` — so an in-play tide-push reads as a helper, not a revive |

**Determinism implication (the important rule):**
- A reroll/continue that draws new pieces **must still route through the seed** to stay deterministic — but doing so *diverges the seed stream from a clean playthrough*, which is illegal for **Seeded/ranked** contexts. Therefore:
  - In **Seeded** games (daily/blitz/leaderboard): monetization hooks that would draw RNG are **disabled by the host** (grantMoves, which draws nothing, is still fine; a tide-sandbag that draws nothing is fine). Any hook that regenerates a tray is refused or, if allowed, **sets `state.deterministic = false`** and stamps `deterministic:false` on the emitted `trayRefilled/trayRerolled` event — the run is then excluded from leaderboard verification.
  - In **casual/voyage** games: hooks draw from the same single `Rng` in-sequence (so the save still restores exactly via `rngCalls`), and the game **stays deterministic-from-its-own-seed**. `state.deterministic` stays true; the extra draws are simply part of that game's recorded stream.
- `grantMoves` is **always deterministic** (pure counter change, zero draws) — the safest hook, usable even in ranked play if product allows paid move budgets.

**[OPEN — product owner]:** (a) which hooks are permitted in Seeded/daily at all; (b) reroll cost/caps and whether a reroll draws fresh RNG vs. re-permutes existing tray (a pure permutation would keep even Seeded deterministic — recommended); (c) continue count cap per game.

---

## Open questions surfaced (for product owner)

1. **Two-axis mode** (surface zen/tide/blitz/voyage × fairness guided/fair/seeded) vs. one enum — §3.
2. **Seed scope** — recommend `seedPolicy:'date+level'` as default; confirm daily is date-only (§7, README §6).
3. **Undo** — drop from core, layer on snapshot/restore, or ship a limited host undo? (§2)
4. **Reroll semantics** — fresh RNG draw vs. pure permutation of the existing tray (permutation keeps Seeded deterministic) — §8.
5. **Monetization in ranked** — which hooks allowed in daily/leaderboard; caps on continues/rerolls/granted moves — §8.
6. **Element rule locks** — coral 2-hit clear semantics, anchor unlock condition, current drift direction, storm payload (elements.ts stubs them; doc 04 §B needs final rules).
7. **Assist-fade curve numbers** — gap-fill prob and pressure strength as functions of `gamesPlayed` (assist.ts is data; Systems/Fairness agents own the values — doc 02 §C).
```