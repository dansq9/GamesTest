# Rising Tide — Engine & Gameplay Spec

Implementation-ready specification for the **Rising Tide** game engine, modes, and gameplay — produced by
the six-role agent process the design handoff asked for (`05_working_with_agents.md`), then reviewed by a
seventh (Persona Advocate) and synthesized, then extended with star-bands, economy, DDA, and ad strategy
by additional specialist + review agents. **Scope: engine / logic / fairness / progression / modes / economy /
monetization — no front end.** The UI is a thin renderer over this engine, handed off separately.

## Start here

**[`00-engine-gameplay-spec.md`](00-engine-gameplay-spec.md)** — the master synthesis. Integrates all
seven specialist docs, resolves cross-references, applies the persona-required revisions, folds in the
HUD objective/constraint model, and gives the build order. Read this first.

**[`08-decisions-and-open-questions.md`](08-decisions-and-open-questions.md)** — every open threshold and
every design change needing a call, grouped, with a recommended answer and owner. Updated with star-band,
economy, DDA, and ad decisions (section H). This is the list to rule on.

## The specialist deliverables (detail)

| Doc | Role | Covers |
|---|---|---|
| [`01-level-tables.md`](01-level-tables.md) | Game Systems Designer | The 40-level table, quantified move budgets, the assist-fade curve, per-chapter difficulty bands |
| [`02-engine-architecture.md`](02-engine-architecture.md) | Engine Engineer | Module layout, public API, `GameState`/`GameEvent` + ordering, injected-RNG plumbing, snapshot/restore, monetization hooks (including `pushTide`) |
| [`03-fairness-solvability.md`](03-fairness-solvability.md) | Fairness/Math & RNG | Determinism contract, the `handIsSafe` guarantee, local-vs-global + goal-achievability, property tests |
| [`04-progression-economy.md`](04-progression-economy.md) | Live-Ops/Progression | Element roster rules, the 5-chapter arc, milestones, the post-70 renewable economy, monetization posture |
| [`05-special-mechanics.md`](05-special-mechanics.md) | Special Mechanics/Combo | Combo upgrade, the two special blocks, the power-up satchel, the combined novelty schedule |
| [`06-persona-review.md`](06-persona-review.md) | Casual-Player UX Advocate | Veto-power review for the 45–65 player: required changes + what to keep |
| [`07-simulation-qa.md`](07-simulation-qa.md) | QA/Simulation | The casual play-bot, property/regression suite, difficulty calibration, CI gates |

## Extended deliverables (star-bands, economy, DDA, ads)

| Doc | Role | Covers |
|---|---|---|
| [`09-star-bands.md`](09-star-bands.md) | Game Systems Designer | 3/2/1 star metric per goal type, cozy-generous distribution targets, sim-calibration method, G15 gate |
| [`10-economy-resources.md`](10-economy-resources.md) | Economy Designer | Full catalog cards for every resource/consumable/collectible, earn→sink balance, economy event catalog, master resource table |
| [`11-dda-system.md`](11-dda-system.md) | Engine Engineer + Systems | Dynamic Difficulty Adjustment — player-adaptive gap-fill, pressure dial, comfort mode; preserves determinism |
| [`12-ad-strategy.md`](12-ad-strategy.md) | Monetization Designer | Ad placement strategy, format mix (RV/interstitial/banner), first-session policy, remove-ads IAP, feedback hooks |

## The non-negotiables (the product's spine)

1. **No unavoidable deaths, ever** — proven per-hand safety + Guided rescue, certified by simulation.
2. **Deterministic when seeded** — same seed ⇒ byte-identical game; state-based resume.
3. **Never a clock in core play** — turn-based budgets and tide only.
4. **Completion advances; stars never gate.**
5. **One new concept at a time.**
6. **Engine is UI-agnostic and test-first** — if a rule can't be proven by a headless sim, it isn't done.

## Status

- Seven core specialist specs complete and cross-reconciled.
- Four extended specs (star-bands, economy, DDA, ad strategy) complete and cross-reviewed.
- Persona Advocate second review: **conditional GO** on star-bands + economy (3 adjustments applied).
- Cross-spec consistency review: **CONSISTENT** across all 12 docs (9 minor adjustments applied).
- One content pass outstanding: the Chapter-3 re-order (`08 D6`).
- Next: product owner resolves `08` (now including section H), Systems Designer runs the D6 pass →
  the engine phase is fully specified, ready to hand to build.

## Standing caveat

Behavior is grounded in the v5 prototype (`Rising Tide Prototype v5.dc.html`) and the design handoff docs.
Every invented number is tagged `[OPEN — product owner]` and is meant to be calibrated against the
simulation harness (`07`), not shipped on faith.
