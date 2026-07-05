# Rising Tide — Engine

The pure, deterministic, UI-agnostic game engine for **Rising Tide**, a calm nautical 8×8
block-puzzle for a 45–65 cozy-casual audience. This is a **standalone product** — separate from the
Kotlin daily-games app elsewhere in this repo.

The engine is a state machine: `(state, command) → (state', events[])`. No DOM, no framework, no
timers, no `Math.random`. The UI (Canvas 2D) and native shell (Capacitor + AdMob) are separate layers
that render this engine's state and forward commands — they are **not** in this package.

Specification: [`../research/engine-spec/`](../research/engine-spec) (read `00` first, then `13` for the
build plan). This package implements that spec, phase by phase.

## Stack

- **TypeScript** engine, zero runtime dependencies (the recommended stack from spec `13`, chosen over
  Unity/Godot for a web/app dev team building a 2D puzzle).
- **Node 22 type-stripping** for dev/test (`node --experimental-strip-types`) — no build step to run tests.
- **`tsc`** for the production build (`dist/`, ES2022 + NodeNext, `.d.ts` included).
- **`node:test`** for the suite. Dev-only deps: `typescript`, `@types/node`.
- Later phases add the **Canvas 2D** renderer, **Capacitor** shell, and **AdMob** plugin (spec `13` E5–E6).

## Commands

```bash
npm run typecheck   # tsc --noEmit (source + tests)
npm test            # node:test over the type-stripped .ts suite
npm run build       # tsc -> dist/ (compiled JS + declarations)
```

## Status — E0 + E1 complete (29 tests green)

**E0 ship criterion** (spec `13`): *seed ⇒ byte-identical game, proven by test.* ✅
**E1 ship criterion** (spec `13`): *the safety floor — no unavoidable deaths.* ✅

Implemented and tested:
- **RNG** (`rng.ts`) — mulberry32 + FNV-1a, integer-exact, the single randomness source. State-based
  resume: the 32-bit accumulator is persisted and rehydrated exactly (spec `03 §1.4`).
- **State** (`state.ts`) — the full `GameState` / `GameEvent` / `LevelDef` / `SerializedGame` shapes.
- **Board** (`board.ts`) — place, find full rows+cols, simultaneous clear with intersection dedup,
  `hasAnyMove`, `legalMoves`, `fillPct`.
- **Scoring** (`scoring.ts`) — `N*N*cells*10 + combo*50` (spec `01 §5`).
- **Tide** (`tide.ts`) — rise schedule, per-level `tideRate`, `tideRises` accrual, phase.
- **Solvability** (`solvability.ts`) — the `handIsSafe` depth-≤3 DFS with simulated clears, plus the
  guaranteed-terminating constructive `safeFallback` (spec `03 §2`).
- **Generator** (`generator.ts`) — the `ContextualGenerator`: weighted roulette + pressure dial +
  no-flood + gap-fill, in the frozen draw order (spec `03 §1.2`), validated by the safety floor so it
  serves a safe hand whenever one exists (spec `03 §2.6`).
- **Assist** (`assist.ts`) — E1 per-surface/fairness posture. **Zen = genuinely calmer** (kindest
  pressure dial + light gap-fill, no goal/tide), not inflated targets.
- **Engine** (`engine.ts`) — the turn loop with canonical event ordering, goals (`lines`/`score`/
  `survive`), win-before-loss terminals, snapshot/restore, and the monetization hooks
  (`grantMoves`/`pushTide`/`continueAfterLoss`/`rerollTray`).

**Proven by the suite:** same seed ⇒ identical event stream (golden-master); seeds diverge;
restore-then-play == continuous play; snapshots are detached captures; and **every served hand is safe
across 1,600 random-legal games** (guided/fair/zen) with no-flood holding throughout — the T3/T4/T5
invariants (spec `03 §7`) at a fast CI scale.

## Roadmap (spec `13`, phases E0–E7)

| Phase | Scope | State |
|---|---|---|
| **E0** | Determinism skeleton + golden-master | ✅ done |
| **E1** | Solvability floor (`handIsSafe` DFS), `ContextualGenerator`, no-flood, gap-fill | ✅ done |
| E2 | Fairness modes (guided/fair/seeded), assist-fade curve, **Guided rescue rule + fill ceiling**, daily seed | next |
| E3 | 40-level content, board elements, combo/specials, satchel, DDA | |
| E4 | Economy, star-band resolution, streaks, monetization wiring | |
| E5 | Canvas 2D UI (Claude Design) | |
| E6 | Capacitor shell + AdMob | |
| E7 | Simulation harness (CasualBot), CI gates G1–G16, difficulty calibration | |

> E1 delivers **per-hand** safety (every hand has an out). The Guided **global** "un-losable" promise
> (rescue rule + fill ceiling, spec `03 §4.3`) and the full N ≥ 1e6 zero-death certification (spec `07`)
> land in E2/E7.

## Spec-reconciliation notes (from the build-readiness + decision audits)

These are places where the implementation makes a deliberate call the spec docs should be updated to
match. Tracked so the spec and code stay in sync:

1. **RNG draw order (audit BLOCKER B1).** Spec `02 §5` draws each piece's color *inline within its
   slot*; spec `03 §1.2` draws all three shapes first, then colors in a *separate trailing pass*. These
   produce different streams. We follow **`03`** (the determinism authority; matches the prototype).
   → `02 §5` should be reconciled to the trailing-color-pass order.
2. **Resume mechanism (audit S5).** We persist the RNG's 32-bit accumulator (`rngState`) and rehydrate
   exactly (`03 §1.4`), rather than fast-forwarding `rngCalls` draws (`02 §7`). `rngCalls` is kept as a
   debug cursor only. → `02 §7` should adopt the state-based contract.
3. **Piece library.** The canonical 18-shape set + weights live in the prototype `_genTray`, which is
   not in this repo. `pieces.ts` ships the standard genre set as a swappable placeholder tagged
   `[OPEN — reconcile against prototype]`. Does not affect engine logic.
4. **E-phase placeholders in E0 code**, all marked inline: `stars = 3` (real star-bands are E4/spec
   `09`); no board elements (E3); no solvability floor or gap-fill (E1); `continueAfterLoss` on no-moves
   regenerates a normal tray (E1 makes it guaranteed-safe).

Deferred audit blockers not touched by E0, for later phases: DDA↔determinism reconciliation (B2 — DDA
inputs must live in serialized state or be off in seeded/ranked, per spec `11`); the ~10 E3 state fields
for specials/satchel/elements (B3); and the L15 `collect`-over-coral content bug (B4).
