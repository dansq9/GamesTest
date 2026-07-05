# Rising Tide — Engine & Gameplay Spec

Implementation-ready specification for the **Rising Tide** game engine, modes, and gameplay — produced by
the six-role agent process the design handoff asked for (`05_working_with_agents.md`), then reviewed by a
seventh (Persona Advocate) and synthesized. **Scope: engine / logic / fairness / progression / modes —
no front end.** The UI is a thin renderer over this engine, handed off separately.

## Start here

**[`00-engine-gameplay-spec.md`](00-engine-gameplay-spec.md)** — the master synthesis. Integrates all
seven specialist docs, resolves cross-references, applies the persona-required revisions, folds in the
HUD objective/constraint model, and gives the build order. Read this first.

**[`08-decisions-and-open-questions.md`](08-decisions-and-open-questions.md)** — every open threshold and
every design change needing a call, grouped, with a recommended answer and owner. This is the list to rule on.

## The specialist deliverables (detail)

| Doc | Role | Covers |
|---|---|---|
| [`01-level-tables.md`](01-level-tables.md) | Game Systems Designer | The 40-level table, quantified move budgets, the assist-fade curve, per-chapter difficulty bands |
| [`02-engine-architecture.md`](02-engine-architecture.md) | Engine Engineer | Module layout, public API, `GameState`/`GameEvent` + ordering, injected-RNG plumbing, snapshot/restore, monetization hooks |
| [`03-fairness-solvability.md`](03-fairness-solvability.md) | Fairness/Math & RNG | Determinism contract, the `handIsSafe` guarantee, local-vs-global + goal-achievability, property tests |
| [`04-progression-economy.md`](04-progression-economy.md) | Live-Ops/Progression | Element roster rules, the 5-chapter arc, milestones, the post-70 renewable economy, monetization posture |
| [`05-special-mechanics.md`](05-special-mechanics.md) | Special Mechanics/Combo | Combo upgrade, the two special blocks, the power-up satchel, the combined novelty schedule |
| [`06-persona-review.md`](06-persona-review.md) | Casual-Player UX Advocate | Veto-power review for the 45–65 player: required changes + what to keep |
| [`07-simulation-qa.md`](07-simulation-qa.md) | QA/Simulation | The casual play-bot, property/regression suite, difficulty calibration, CI gates |

## The non-negotiables (the product's spine)

1. **No unavoidable deaths, ever** — proven per-hand safety + Guided rescue, certified by simulation.
2. **Deterministic when seeded** — same seed ⇒ byte-identical game; state-based resume.
3. **Never a clock in core play** — turn-based budgets and tide only.
4. **Completion advances; stars never gate.**
5. **One new concept at a time.**
6. **Engine is UI-agnostic and test-first** — if a rule can't be proven by a headless sim, it isn't done.

## Status

- Seven specialist specs complete and cross-reconciled.
- Persona Advocate verdict: **conditional GO** — required cuts applied in the master baseline (`00 §11`).
- One content pass outstanding: the Chapter-3 re-order (`08 D6`).
- Next: product owner resolves `08`, Systems Designer runs the D6 pass → the engine phase is fully specified,
  ready to hand to build (E0 can start immediately on the determinism skeleton in parallel).

## Standing caveat

Behavior is grounded in the v5 prototype (`Rising Tide Prototype v5.dc.html`) and the design handoff docs.
Every invented number is tagged `[OPEN — product owner]` and is meant to be calibrated against the
simulation harness (`07`), not shipped on faith.
