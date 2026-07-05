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

## Status — E0–E2 + E3a/E3b complete (60 tests green)

**E0 ship criterion** (spec `13`): *seed ⇒ byte-identical game, proven by test.* ✅
**E1 ship criterion** (spec `13`): *the safety floor — no unavoidable deaths.* ✅
**E2 ship criterion** (spec `13`): *three fairness modes; Guided globally un-losable; seeded daily replay.* ✅
**E3a** (slice of E3): *40-level table + all 7 goal types + core elements, all playable headless.* ✅
**E3b** (slice of E3): *combo one-move grace + combo-earned specials + the two special blocks.* ✅

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
- **Assist** (`assist.ts`) — the data-driven assist-fade curve (spec `01 §3`): gap-fill `p_gap(L)`
  fading to 0 by L13 with teach/milestone bonuses; pressure `s_p` per chapter (1.0→0.4, never 0).
  **Zen = genuinely calmer** (kindest pressure + light non-fading gap-fill, no goal/tide), not
  inflated targets.
- **Generator** (`generator.ts`) — additionally enforces the **Guided rescue rule + fill ceiling**
  (spec `03 §4.3`): at/above `F_rescue`=0.72 the served hand must be *clearing* and within
  `F_cap`=0.80, so the board can never ratchet into a dead state.
- **Daily** (`daily.ts`) — date-based Daily Tide seed (spec `03 §1.3`); one board worldwide.
- **Levels** (`levels.ts`) — the full **40-level voyage** (spec `01 §1`): 4 chapters, element drip,
  milestones, move budgets, per-level tide rates.
- **Elements** (`elements.ts`) — deterministic seeding (drawn before the first tray, spread so no
  line is pre-loaded) + element-aware clear resolution for the Tier-A cell/collectible elements:
  **barnacle** (blocker→removed), **coral** (2-hit strike), **pearl** (collect), **bonus** (score
  multiplier). Anchor + Tier-B `current`/`storm` are authored in the levels but their behavior is a
  later E3 slice; those levels currently play as clean boards.
- **Combos & specials** (E3b, spec `05`) — the **one-move grace** (a streak survives a single quiet
  setup move; `comboHeld`), **combo-earned specials** (×3 → Line-Blaster, ×6 → Bomb, ×10 → repeat,
  granted into a `satchel`; disabled in Seeded so shared boards stay identical), and the two
  **special blocks**: Line-Blaster (clears its row+column, N=2) and Bomb (clears a 3×3, flat score),
  both routed through element resolution and deployed via `deploySpecial`.
- **Engine** (`engine.ts`) — the turn loop with canonical event ordering, **all 7 goal types**
  (`lines`/`multi`/`combo`/`survive`/`score`/`collect`/`barnacle`), element-aware clearing with
  bonus multipliers, win-before-loss terminals, snapshot/restore, and the hooks
  (`grantMoves`/`pushTide`/`continueAfterLoss`/`rerollTray`/`deploySpecial`).

**Proven by the suite:** same seed ⇒ identical event stream (golden-master); seeds diverge;
restore-then-play == continuous play; snapshots are detached captures; **every served hand is safe
across 1,600 random-legal games** (guided/fair/zen) with no-flood holding (T3/T4/T5); the assist
curve matches spec; **a Guided hand at/above F_rescue can always clear**; **a competent player suffers
zero no-moves losses in Guided**; and the daily seed replays identically for all players. Fast CI
scale — the full N ≥ 1e6 CasualBot certification is E7.

## Roadmap (spec `13`, phases E0–E7)

| Phase | Scope | State |
|---|---|---|
| **E0** | Determinism skeleton + golden-master | ✅ done |
| **E1** | Solvability floor (`handIsSafe` DFS), `ContextualGenerator`, no-flood, gap-fill | ✅ done |
| **E2** | Fairness modes (guided/fair/seeded), assist-fade curve, **Guided rescue rule + fill ceiling**, daily seed | ✅ done |
| **E3a** | 40-level table, 7 goal types, core elements (barnacle/coral/pearl/bonus) | ✅ done |
| **E3b** | Combo one-move grace, special blocks (Line-Blaster, Bomb), combo-earned specials | ✅ done |
| E3c | Anchor lock + Tier-B elements (current/storm), power-up satchel | next |
| E3d | DDA system (player-adaptive difficulty), reconciled with determinism | |
| E4 | Economy, star-band resolution, streaks, monetization wiring | |
| E5 | Canvas 2D UI (Claude Design) | |
| E6 | Capacitor shell + AdMob | |
| E7 | Simulation harness (CasualBot), CI gates G1–G16, difficulty calibration | |

> E1 delivered **per-hand** safety (every hand has an out); E2 adds the Guided **global** un-losable
> promise (rescue rule + fill ceiling). The full N ≥ 1e6 CasualBot zero-death certification and the
> level goal-achievability solver (spec `07`, `03 §5`) land in E7.

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
4. **Assist curve — table vs formula (E2).** Spec `01 §3a` gives both a formula
   (`p_base = clamp(0.60 − 0.05·(L−1))`) and a lookup table; they disagree at L11/L12 (table .05/.00,
   formula .10/.05). We follow the **formula** (matches the prose "hits 0 at L=13"). → reconcile the
   spec table to the formula.
5. **L15 collect-over-coral (audit B4).** The spec authored L15 `collect 5` over coral with no pearl,
   and the only collect counter was `pearlsCollected` — unwinnable as authored. Resolved: the collect
   goal now counts `pearlsCollected + coralsCleared`, so coral-collect levels work. → note in spec.
6. **E-phase placeholders still open**, marked inline: `stars = 3` (real star-bands are E4/spec
   `09`); anchor lock + `current`/`storm` behavior (E3c) — those levels currently play as clean
   boards; combo one-move grace + specials (E3b); `continueAfterLoss` on no-moves regenerates a normal
   tray (should be guaranteed-safe — cheap follow-up).

Deferred audit blockers not touched by E0, for later phases: DDA↔determinism reconciliation (B2 — DDA
inputs must live in serialized state or be off in seeded/ranked, per spec `11`); the ~10 E3 state fields
for specials/satchel/elements (B3); and the L15 `collect`-over-coral content bug (B4).
