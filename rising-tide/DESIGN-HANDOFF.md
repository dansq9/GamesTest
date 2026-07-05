# Rising Tide — Handoff to Claude Design (the UI layer, E5)

The **engine is complete** (phases E0–E4, 93 tests green). It's a pure, headless, deterministic state
machine. Your job (E5) is the **Canvas 2D renderer + touch layer** on top of it. You render the
engine's state and forward the player's actions — you never implement game rules, scoring,
solvability, or economy. Those are done, proven, and immutable from your side.

This note orients you fast. The full design intent is in `research/engine-spec/` (read `00` first, then
`06` persona, `14` UX reference). This file is about the **concrete API you build against.**

---

## The one mental model

```
        user drags a piece                     engine returns
   ┌──────────────────────┐            ┌────────────────────────────┐
   │  your Canvas UI (E5)  │ ─ command ▶│  RisingTideEngine (done)   │
   │  renders GameState    │◀ state + ──│  (state, cmd) → (state',    │
   │  animates GameEvents  │   events   │              events[])     │
   └──────────────────────┘            └────────────────────────────┘
```

Every command returns `{ state, events }`. You **render `state`** (the current truth) and **animate
`events`** (what just happened). That's the whole contract.

---

## 1. What you render — `GameState` (see `src/state.ts`)

| Field | Render as |
|---|---|
| `board: (Cell\|null)[][]` | the 8×8 grid. `Cell.color` is a player color or an element id. `Cell.element` = barnacle/coral2/pearl-marker etc.; `Cell.hits` = coral strikes left; `Cell.locked` = an anchor (draw as chained/locked, unplaceable). |
| `elements: (ElementId\|null)[][]` | the parallel layer — pearl/bonus markers sit here over empty cells (draw the gem/star under the board fill). |
| `tray: TrayPiece[]` | the 3 draggable pieces (a 4th appears when a special is deployed — `piece.special`). `cells` are the piece's offsets; `color` its color; `placed` hides it once used. |
| `tide`, `tidePhase` | the tide meter. `tidePhase` ∈ calm/rising/critical/drowning — colour the water, **never a red countdown** (`06`). |
| `score`, `combo` | HUD counters. `combo` is the streak the player "owns" — celebrate it. |
| `goal`, `goalProgress`, `goalTarget` | the **Objective chip** (e.g. "Clear 5 lines — 3/5"). |
| `movesUsed`, `moveLimit` | the **Constraint chip**, only when `moveLimit > 0`. Reads as calm capacity ("7 moves left"), never a threat. |
| `status` | 'playing' / 'won' / 'lost' → drive the end screens. |
| `stars` | set on win (1–3) — the celebration. Stars **never gate** the next level. |
| `satchel` | earned specials (Line-Blaster / Bomb counts) — the deploy buttons. |
| `powerups` | Undo / +Moves / Tide-Push counts — the satchel buttons. |

HUD rule (`00 §4.3`): **Objective chip always; Constraint chip only when a `moveLimit` or tide is
live; never both as countdowns.** The moves chip is calm capacity, not a red timer.

---

## 2. What you animate — the `GameEvent` stream (`src/state.ts`, `GameEvent`)

Events arrive **in canonical order** per command. Map them to feel (the feedback layer, `12 §7`):

| Event | Feedback |
|---|---|
| `placed` | piece snaps into the grid |
| `linesCleared { rows, cols, cells, points }` | the clear animation + score popup; "Nice!/Great!/Amazing!" by line count |
| `combo { value }` / `comboHeld` / `comboBroken` | streak counter grows / a gentle "held!" reassurance / streak fades |
| `comboReward { special }` | "You earned a Line-Blaster!" — the earn-don't-buy moment |
| `coralHit { remaining }` | coral cracks (2→1→gone) |
| `tideRise { tide, phase, rises }` | the water rises/falls; recolour by phase |
| `pearlCollected` / `barnacleRemoved` | collectible fly-to-counter; barnacle scrub |
| `elementEvent { element:'anchor', detail:{unlocked} }` | anchors unlock (unchain) |
| `elementEvent { element:'bonus', detail:{mult} }` | bonus tile pops, ×2 flourish |
| `won { stars, rewards, nextName }` | the celebration — stars, pearls, "Next: ___" |
| `lost { reason }` | gentle game-over; offer continue/retry |
| `tidePushed`, `movesGranted`, `trayRefilled`, `specialDeployed`, `undone`, `powerUpUsed` | the helper/UX affordances firing |

The engine owns the **trigger**; you own the **feel** (haptics, particles, sound, timing). Rising Tide's
identity is *calmer* than Block Blast — ripples/foam, ocean tones, larger type (45–65 audience). Read
`14` for the adopt/diverge guidance.

---

## 3. What you call — the commands (`src/engine.ts`)

```ts
const engine = new RisingTideEngine();
engine.newGame({ surface, level?, seed?, gamesPlayed?, profile? }); // start
engine.canPlace(pieceIdx, r, c);        // is this drop legal? (for drag preview)
engine.legalMoves(pieceIdx);            // all valid origins (for snap targets/hints)
engine.placePiece(pieceIdx, r, c);      // THE turn — returns {state, events}
engine.deploySpecial('lineBlaster'|'bomb');   // move a satchel special into the tray
engine.usePowerUp('undo'|'addMoves'|'tidePush');
engine.grantMoves(n); engine.continueAfterLoss(); engine.pushTide(p); engine.rerollTray(); // ad/IAP hooks
engine.snapshot(); engine.restore(snap); // save / resume (exact)
```

You mostly call `placePiece` and render the result. Everything else is buttons (specials, power-ups)
and lifecycle (new game, save/resume).

---

## 4. Where things live in the box

- **`rising-tide/`** — the engine. Read `README.md` (status + module map), then `src/state.ts` (all the
  types you render), `src/engine.ts` (the API). `npm install && npm test` runs the 93 tests.
- **`research/engine-spec/`** — the design contract. `00` master spec, `06` persona (your veto rules),
  `12` ad/feedback UX, `13` build plan + stack (TypeScript + Canvas + Capacitor), `14` Block Blast UX
  reference (adopt/diverge).

## 5. The non-negotiables you must honour in the UI

1. **Never a clock in core play.** No countdowns, no timers — tide and moves are turn-based capacity.
2. **Stars celebrate, never gate.** Completion always advances.
3. **Calm over urgency.** No red alarm states, no flashing, no "you're losing!" pressure.
4. **The ad banner is a fixed bottom strip** the layout reserves from the start (`12 §1.3`); the board,
   tray, and tide meter lay out *above* it, never clipped.

Build the *feel*. The engine guarantees the game is always fair, always solvable, and always calm —
your job is to make it *look and feel* like a quiet tide coming in.
