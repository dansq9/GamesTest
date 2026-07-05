# 00 · Rising Tide — Engine & Gameplay Master Spec

> **The primary handoff.** This integrates seven specialist deliverables into one implementation-ready
> picture of the **engine, modes, and gameplay** for Rising Tide — a calm nautical 8×8 block-puzzle
> for a **45–65 cozy-casual audience** (the players who make Wordscapes / Fishdom / Solitaire Grand
> Harvest top-grossing).
>
> **Scope: engine / logic / fairness / progression / modes / gameplay ONLY. No front end.**
> The visual layer is prototyped separately; the UI will be a thin renderer over this engine.
>
> **How to read this:** §1–§12 are the integrated design. Each section points to the detail doc that
> owns it (`01`–`07`). Every unresolved choice is consolidated in **`08-decisions-and-open-questions.md`**.

---

## 1. How this spec was produced

Per the handoff's `05_working_with_agents.md`, six role-specialized agents interrogated the design docs
and the v5 prototype engine, then a seventh (Persona Advocate) reviewed the whole. Each produced one
implementation-ready document:

| Doc | Owner role | Owns |
|---|---|---|
| `01-level-tables.md` | Game Systems Designer | The 40-level table, move budgets, the assist-fade curve, difficulty bands |
| `02-engine-architecture.md` | Gameplay/Engine Engineer | Module layout, public API, `GameState`/events, RNG plumbing, snapshot/restore, monetization hooks |
| `03-fairness-solvability.md` | Fairness/Math & RNG | Determinism contract, the solvability guarantee, no-unavoidable-death, goal-achievability |
| `04-progression-economy.md` | Live-Ops/Progression | Element roster (rules), the 5-chapter arc, milestones, the post-70 renewable economy, monetization posture |
| `05-special-mechanics.md` | Special Mechanics/Combo | Combo upgrade, the 2 special blocks, the power-up satchel, the combined novelty schedule |
| `06-persona-review.md` | Casual-Player UX Advocate | Veto-power review of every rule for the 45–65 player |
| `07-simulation-qa.md` | QA/Simulation | The headless play-bot, property tests, difficulty calibration, CI gates |

**Convention across all docs:** every invented value is tagged **[OPEN — product owner]** with a
recommendation. Nothing here is shipped on faith; the numbers are the QA sim's calibration inputs.

---

## 2. The non-negotiables (the spine) — now with the mechanism that enforces each

The handoff's six non-negotiables, each now backed by a concrete engine mechanism:

| # | Non-negotiable | Enforcing mechanism |
|---|---|---|
| 1 | **No unavoidable deaths, ever** | 3-piece `handIsSafe` DFS (not the prototype's per-piece heuristic) + Guided rescue rule + fill ceiling, **certified by the sim at zero unavoidable deaths over ≥1e6 Guided games** — `03 §2,§4`, `07 T3` |
| 2 | **Deterministic when seeded** | One injected `mulberry32` stream, fixed draw order, **state-based resume** (persist the RNG accumulator, not `turns`) — `03 §1`, `02 §5,§7` |
| 3 | **Never a clock in core play** | All budgets are turn-based (`moveLimit`); tide is turn-based; Blitz's timer is host-owned and opt-in — `02 §4`, `01` |
| 4 | **Completion advances; stars never gate** | `resolveWin` grants stars by performance; milestone rewards are additive, not star-gated — `04 §2.1` |
| 5 | **One new concept at a time** | The combined novelty schedule across elements + specials + power-ups — `05 §4` (revised per persona, §6 below) |
| 6 | **Engine is UI-agnostic & test-first** | Pure state machine `(state, command) → (state', events[])`; the CI gates prove fairness before any UI — `02`, `07 §4` |

---

## 3. Architecture at a glance

**A pure state machine.** `placePiece(idx, r, c) → { state, events[] }`. The engine never touches the DOM,
never schedules a timer, never persists. The prototype's `setState`/`setTimeout`/`localStorage`/`_sfx`
are all host concerns and stripped. Clear animations, autosave, sound, and RV countdowns render at the
host's pace off the ordered event list. Full module map in `02 §1`.

**Three orthogonal axes** (the mental model that resolves the prototype's "tide-or-zen" conflation):

1. **Play surface** — `zen` · `tide` · `blitz` · `voyage` (what screen you're on).
2. **Fairness mode** — `guided` · `fair` · `seeded` (how much the generator helps; set per voyage level, derived for endless). `02 §3`, `03 §4`.
3. **Goal type** — `lines` · `multi` · `combo` · `survive` · `score` · `collect` · `barnacle` (what you're trying to do).

These are independent. A voyage level is `{surface: voyage, fairness: guided|fair, goal: <any>}`.
The Daily is `{surface: tide, fairness: seeded, goal: survive}`. This separation is what fixes the
affordance bug in §4.4.

---

## 4. The mode & gameplay model

### 4.1 The three fairness modes + the assist-fade curve

One generator; the assists differ by mode and fade with progress (`01 §3`, `03 §4`):

| Mode | Used for | Solvability floor | Pressure dial | Gap-fill assist | Deterministic |
|---|---|---|---|---|---|
| **Guided** | Chapter 1 (~games 1–20) | ✓ forever | ✓ strong | ✓ **ON** (offers the finishing piece), rationed & masked | no |
| **Fair** | Chapters 2–4 | ✓ forever | ✓ relaxes to a 0.40 floor | ✗ off (by L13) | no |
| **Seeded** | Daily, ranked/leaderboard | ✓ forever | ✓ light | ✗ off | **✓ same board for everyone** |

- **Gap-fill** starts at 0.60, decays to 0 by L13, then off forever — with a **detectability-suppression**
  rule set (skip if a finisher already exists · one-hand cooldown · 40% per-level cap) so wins still feel
  earned. This "invisible help" is the single best-rated design decision in the persona review (`01 §3`, `06 §6`).
- **Solvability floor never fades** — it is fairness, not hand-holding.

### 4.2 The seven goal types

`lines` (clear N) · `multi` (N lines in one placement) · `combo` (reach ×N) · `survive` (outlast N tide rises)
· `score` (N points within a move budget) · `collect` (gather N pearls / clear coral) · `barnacle` (clear N
barnacle cells). All turn-based or self-paced — never a reaction test. Definitions in `04 §1`, evaluation in `02 goals.ts`.

### 4.3 The HUD Objective + Constraint model — **RESOLVED** (answers the affordance question)

**The bug:** the status affordance was keyed *"tide present → tide meter, else → Zen,"* which treats **Zen
as the fallback for "no tide."** That is wrong the moment voyage levels exist — a "clear 8 lines" level has
no tide but is not Zen.

**The model:** the slot is the **Objective readout**, keyed on the level's `goal`. Zen and tide become two
of *N* variants, not the only two. Render Zen **only** when `surface === 'zen'`; otherwise render the objective:

| Goal / surface | Objective readout | Source state |
|---|---|---|
| `survive` / tide | Tide meter — water height + phase + "rises survived X / N" | `tide`, `tidePhase`, `tideRises` |
| `zen` | Calm "Zen · free play" (soft lines-cleared counter) | `surface==='zen'` |
| `lines` | "Lines X / N" | `goalProgress / goalTarget` |
| `multi` | "Clear N in one drop" → best drop this run | `goalTarget` |
| `combo` | "Combo ×X / ×N" | `combo`, `goalTarget` |
| `collect` | Pearl "X / N" | `pearlsCollected / goalTarget` |
| `barnacle` | Barnacle "X / N" | `barnaclesRemoved / goalTarget` |
| `score` | "X / N pts" | `score / goalTarget` |

**Two readouts, not one** (the design decision): the objective and the *active constraint* are orthogonal
and must not be conflated (conflating them is what caused the bug).
- **Primary Objective chip** — always present, driven by `goal` (Zen is its calm variant).
- **Secondary Constraint chip** — appears only when a constraint is live: **moves-remaining** (`moveLimit>0`)
  *or* the **tide** — never both at once, absent on Zen/untimed levels.

An efficiency level ("6 lines in 10 moves") shows both: "Lines 4 / 6" + "Moves 5". A plain "clear 8 lines"
level shows only the objective. **No new engine work** — every field already exists in `GameState` (`02 §3`).
**Persona constraint (`06 §5.8`):** the moves chip must read as calm capacity ("moves left"), never an urgent
red countdown. `[OPEN — product owner]`: confirm split (recommended) vs. a single combined slot — register item D1.

### 4.4 Turn/hand lifecycle & event ordering

Turn = one placement; a new tray generates only when all 3 are placed; win is checked before loss.
The canonical 11-step event order for a placement (`placed → linesCleared → combo → coralHit → tideRise →
pearlCollected → barnacleRemoved → elementEvent → goalProgress → trayRefilled → won/lost`) is the render
contract — full detail in `02 §3–§4`.

---

## 5. The dynamism layer — combos, specials, power-ups (restrained by design)

The governing principle (`05`): block-puzzle leaders win on **clarity**; every special mechanic here is
**helpful and telegraphed (a reward, never a threat), introduced one at a time, never a reflex or planning
test.** Three clean buckets, kept separate so the player is never overloaded:

- **Combos (upgraded).** Same `N*N*cells*10 + combo*50` score formula; only the **reset softens**: a
  **one-move grace** means a single deliberate setup move no longer zeroes the streak (it breaks only on the
  *second* consecutive non-clear). Combo is now legible, celebratable state (`combo`, `comboGrace`,
  `comboBest`). **Combos grant specials** (×3 → Line-Blaster, ×6 → Bomb) — an earn-don't-buy loop. `05 §1`.
- **Special blocks — exactly two, both pure clears** (they only *remove* cells, so they can never worsen
  solvability): **Line-Blaster** (1×1 → clears its row+column) and **Bomb** (1×1 → clears a 3×3, an
  *anti-countdown gift*, the deliberate inversion of Woodoku's game-ending bomb). Cut on principle: rainbow
  (color is cosmetic here → meaningless), multiplier piece (dupes the bonus tile), chain reactions, steep
  streak multipliers. `05 §2, §6`.
- **Power-up satchel** — player-triggered, optional safety nets, wired to the engine's
  `grantMoves`/`continueAfterLoss`/`rerollTray` hooks + the pearl economy. **Trimmed per persona from 4 to 2
  core** (see §6/§11): ship **Undo-Last + +Moves**; **Tide-Push** surfaces only on survive levels;
  **Reroll-Tray** held/cut. `05 §3`, `06 §5.7`.

**Determinism rule for the whole layer** (the important part): combo-earned specials are **disabled in
Seeded/Daily** (which combos a player hits is player-dependent → would break Daily sameness); deterministic
helpers (+moves, tide-push) are leaderboard-neutral except as a revive; anything that regenerates a tray or
rewinds RNG (reroll, undo) is casual-only / leaderboard-disqualifying. A granted special is appended as a
**trailing 4th draw** so it never shifts the base tray stream (golden-master stays valid). `05 §1.4, §2.4, §3.3`.

---

## 6. Progression — the reconciled 40-level voyage

The authored voyage is **40 levels across 4 chapters**, then a renewable Endless/Daily band (the handoff's
"100 games" = 40 authored maps + replays + Dailies, reconciled in `04 §2`). The base table is `01 §1`; the
element roster and rules are `04 §1`. **The Persona Advocate required revisions (`06 §4–§5`); the reconciled
baseline below applies them.** Changes are marked ⟵; items needing a product-owner call are in `08`.

**Chapters & modes:** The Shallows (L1–10, `guided`) → The Reef (L11–20, `fair`) → The Deep (L21–30, `fair`)
→ Open Water (L31–40, `fair`) → Endless + Daily (`seeded`/mixed). Milestones at L10/20/30/40 are *showcases*
(winnable 1st–2nd try), never bosses.

**Element roster (`04 §1`):**
- **Tier A — locked as final content:** `barnacle` (L11), `coral2` 2-hit (L14), `pearl` (L18), `anchor`
  locked-column (L22), `bonus` multiplier tile (L31).
- **Tier B — interface locked, content gated behind a sim pass** (`FEATURES.*Live` stays dark until `07 T-TIERB`
  proves zero unavoidable deaths): `current` (drift) and `storm`.

**Reconciled changes applied (persona `06`):**

| Change | What | Why | Status |
|---|---|---|---|
| ⟵ **`current` drift VETOED** | Do not ship drift-placed-pieces. Recommend **cutting `current` as a taught element**; if kept, tray-bias only, behind the Tier-B flag. Rework L30 milestone → **anchor + pearl** showcase (both taught, calm). L26/L27 become practice/consolidation levels (no new noun). | Moving a piece after she places it is the biggest "the game screwed me" risk in the design. | **Applied; product-owner confirm cut-vs-tray-bias — `08 D2`** |
| ⟵ **Storm de-fanged** | Remove the board-littering `fillCells` effect; storm becomes a telegraphed **gentle tide-bump only** on survive levels, or cut entirely (it's the last element, L36). | A recurring event that litters her tidy board violates "tidy board" + "a reward, never a threat." | **Applied; product-owner confirm de-fang-vs-cut — `08 D3`** |
| ⟵ **Power-up satchel trimmed 4→2** | Launch **Undo-Last + +Moves**; **Tide-Push** only on survive levels; **Reroll-Tray** held/cut. Introduce one at a time as the economy affords, never four at once. | Four helper tools is inventory cognition she didn't sign up for. | **Applied — `08 D4`** |
| ⟵ **Deep-tide eased in** | L21 deep tide at **1.20×** (not 1.35×); reserve 1.35/1.40 for L28/L34 after practice. | A 1.35× jump at chapter-open reads as "this got hard," not "I'm getting good." | **Applied — `08 D5`** |
| ⟵ **Power-up debut moved off the L17–19 stack** | The satchel introduction moves to **contextual / no earlier than L24** so L17(special)/L18(pearl)/L19 no longer stack three new concepts in three levels. | Persona caught the spec's "≥2 levels apart" claim was false here. | **Applied — see note below** |
| ⟵ **coral2 legibility** | Logic-behavior requirement: a `hits:1` coral must carry a strong "needs one more pass" state so a full-looking-but-un-clearing line never reads as a bug. | "My line was full and nothing happened — feels broken." | **Applied as a requirement on `04 §1.2`** |
| ⟵ **L21→L22 breath** | Insert a practice beat between deep-tide (L21) and anchor so two "board works against me" nouns don't open the chapter back-to-back. Requires a light Ch3 re-order (Systems Designer). | Two menacing ideas with no practice breath, at a chapter open. | **Flagged for Systems-Designer re-author — `08 D6`** |

**Honest note on novelty spacing (a cross-spec finding).** Chapter 2 is inherently dense — barnacle,
triple-clear, coral, fair-efficiency, and pearl across ten levels means *every* quiet slot is adjacent to a
new concept. Perfect "≥2 levels apart" spacing is not achievable there without lengthening the chapter or
cutting an element. The pragmatic resolution adopted: (a) treat **optional pure-gift specials** (Line-Blaster,
Bomb) as *low* novelty-weight so a special adjacent to one element is acceptable — the persona agreed these
"don't count against her ceiling the way an obstacle she must plan around does" (`06 §4`); and (b) move the
**power-up satchel** out of the L17–19 window so no *three* concepts ever stack. Whether to lengthen Chapter 2
or cut a board element for true ≥2 spacing is a product-owner call — `08 D7`.

The full reconciled 40-level table (with the above applied) is maintained in `01 §1` as the base plus these
deltas; the Systems Designer produces the final re-authored Ch3 ordering (D6) in the next pass.

---

## 7. Fairness, determinism & solvability (the contract)

The load-bearing guarantees (full detail + proofs in `03`):

- **Determinism:** one injected `mulberry32`, fixed draw order, `seed ⇒ byte-identical event stream`
  (integer-exact, cross-platform). **Resume is state-based** — persist the RNG accumulator (+`tideRises`/
  `prevTideFloor`, a prototype save-bug), *not* `turns`. This **replaces the prototype's
  `mulberry32(seed ^ (turns+1))` XOR**, which silently breaks Daily sameness for anyone who resumed. `03 §1`.
- **Solvability (per-hand safety):** a served tray is *safe* iff the 3 pieces can be placed in *some* order
  (clears simulated between) without force-death. Proven by a bounded DFS with a constructive fallback that
  always terminates (`O(E³)` worst case, cheap when it matters). `03 §2`.
- **Two hard problems the handoff under-specified, now resolved (`03 §4, §5`):**
  - **Local vs global.** Per-hand safety ≠ the game stays winnable. Each mode makes a *different* promise:
    Seeded = per-hand only (sameness); Fair = per-hand + statistical pressure dial; **Guided = per-hand +
    rescue rule (a clearing hand is guaranteed above `F_rescue`) + fill ceiling `F_cap`**, certified empirically
    by the sim (zero Guided no-moves losses over ≥1e6 games), not claimed as a proof.
  - **Non-death ≠ goal-achievable.** Solvability lets you place a piece; it doesn't guarantee the *goal* is
    reachable within budget. This is a **separate property**, certified at content-authoring (feasibility solver
    + attainability bot within the chapter band) and, for the Daily, by a **deterministic seed-vetting loop**
    that picks the first salted seed the reference bot can win — preserving sameness *and* winnability. `03 §5`.

---

## 8. Economy & monetization hooks (engine state only, no UI)

The 45–65 audience is **hybrid** — few, non-intrusive ads; higher IAP tolerance than hyper-casual. Design
(`04 §4–§5`):

- **One soft currency: pearls.** Earned from stars, streak chests, in-level collectibles, milestones; spent on
  cosmetics and (optionally) power-ups.
- **Three shared effect hooks** for both RV and IAP: `grantMoves` · `continueAfterLoss` · `rerollTray` (+ a small
  `pushTide` proposed by `05`). RV is opt-in, **≤3/day**, **no mid-board interstitials ever**.
- **Post-70 renewable economy** (the real long-tail retention, `04 §4`): Daily Tide **streaks** (date-only seed,
  one-day freeze forgiveness, 3/7/14/30-day chests) · per-seed **leaderboards** (reproducible score; any
  non-deterministic reroll/continue disqualifies) · rotating **weekly** seeded scenarios from a static pool ·
  a pearl-funded **cosmetic chase** (palettes/backdrops/titles). Each specified as engine state + events + hooks
  — no new subsystem, only new fields.

---

## 9. QA / simulation — what "engine done" means

Difficulty and fairness are **CI tests, not judgment calls** (`07`). The linchpin is a **deliberately
mediocre casual bot** — `CasualBot(s=0.55)`: 1-placement lookahead, greedy-ish, with blunder + missed-finisher
noise, calibrated to a median 45–65 player and *frozen* — bracketed by a random-legal floor and a strong-bot
feasibility ceiling. An optimal solver would rate every level trivial and ship brutal levels that pass CI;
the casual bot reproduces human failure modes.

**"Engine done" = these HARD gates green** (`07 §4`): G1 golden-master · G2 resume-equivalence · G3
solvability-floor/no-flood · G4 special/power-up determinism · G6 zero unavoidable deaths (≥1e6 Guided) ·
G7 goal-achievability · G8 daily-seed vetting · G9 win-rate bands (Ch1 ≥92% … Ch4 ≥68%; milestones ≥80%
first-try/≥95% two-try) · G10 Tier-B element gate (gates `current`/`storm` going live) · G11 survival
monotonicity. Difficulty-model fit and bot-signature are warn-tier.

---

## 10. Cross-spec reconciliations (conflicts the specialists surfaced & resolved)

| Conflict | Resolution |
|---|---|
| Resume: `02 §7` fast-forwards `rngCalls` draws vs. `03 §1.4` rehydrates `getState()` | Both deterministic; **ship `03`'s O(1) `getState()` rehydration**; `07 T2` bridge-tests either. |
| `05` softens the combo *reset* vs. `01 §5` "keep combo unchanged" | The **score formula is unchanged**; only the reset trajectory softens (one-move grace). `01`'s owner confirms — `08 D8`. |
| `05` proposes a new `pushTide()` hook beyond `02 §8`'s three | Adopt as a small deterministic hook so an in-play tide-push reads as a helper, not a revive — `08 D9`. |
| `04 §2` reconciles "40 maps" (`03 §F`) vs "100 games" (`03 §E`) | Engine ships **40 `LevelDef`s + renewable systems**; games 41–70 are replays/stars/Dailies, not new authored content. |
| Novelty "≥2 apart" ideal vs. Ch2 authored density | Optional pure-gift specials are low-weight; power-ups moved out of the stack; true ≥2 spacing needs a chapter-length/element call — `08 D7`. |

---

## 11. Persona-required revisions — status summary

**Applied in this baseline** (§6): `current` drift vetoed · storm de-fanged · satchel trimmed 4→2 ·
deep-tide eased · power-up debut moved off the L17–19 stack · coral2 legibility requirement · HUD
constraint-not-a-clock.
**Flagged for the Systems Designer's next pass:** the Ch3 re-order that inserts an L21→L22 breath (D6).
**Kept untouched (persona affirmed):** the un-losable Shallows, invisible assists, the one-move combo grace,
both pure-clear specials, the every-10 milestone ceremonies, positive-slack budgets, no-clock core,
never-decreasing survive progress. **Overall persona verdict: conditional GO** once the cuts land (`06 §7`).

---

## 12. Build order (engine only — mirrors the handoff's E0–E5)

- **E0 — Skeleton & determinism.** Board model, piece library, injected seeded RNG, `newGame/placePiece/
  getState`, event emitter, snapshot/restore. Gate: G1 golden-master, G2 resume. (`02`)
- **E1 — Fairness floor.** `handIsSafe` + no-flood in all modes; Guided rescue + fill ceiling. Gate: G3, then G6. (`03`)
- **E2 — Contextual generation + modes.** Pressure dial, gap-fill, the assist-fade curve as data, the
  Guided/Fair/Seeded switch. (`01 §3`, `02 §6`)
- **E3 — Scoring, tide, combo, elements.** Lock scoring/tide math; combo grace + earn-don't-buy specials;
  Tier-A elements as data-driven modifiers. Gate: G4. (`04 §1`, `05`)
- **E4 — Level & voyage system.** The 40 `LevelDef`s, chapters, milestones, star/reward resolution, the
  post-70 economy hooks, the HUD objective/constraint state. (`01`, `04`)
- **E5 — Difficulty model & sim harness.** The casual bot + property tests + the difficulty calibration loop;
  wire the CI gates; run the Tier-B gate to unlock `current`/`storm`. Gates: G7–G14. (`07`)

---

## 13. Open decisions

Every `[OPEN — product owner]` threshold and every persona change needing confirmation is consolidated,
grouped, and given a recommended answer in **`08-decisions-and-open-questions.md`**. Resolve those, run the
Systems-Designer re-author pass for D6, and the engine phase is fully specified for build.
