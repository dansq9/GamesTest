# 01 · Level Tables, Move Budgets & the Assist-Fade Curve

**Owner:** Game Systems Designer · **Scope:** systems / rules / number tables / difficulty ONLY (no UI).
**Baseline:** values lifted from `Rising Tide Prototype v5.dc.html` (`_voyageLevels`, `_placePiece`, `_genTray`, `_resolveVoyageWin`).
**Convention:** every invented number is tagged **[OPEN — product owner]** with my recommended value. These are the QA-sim's calibration inputs; they are meant to be tuned against simulation, not shipped on faith.

Design spine honored throughout: one new concept per level · verbs (goals) in Ch1, nouns (board elements) from Ch2 · introduce each element in isolation on an easy target → practice → combine only at a milestone · **never introduce a new element AND tighten a budget in the same level** · solvability floor = 1.0 forever · no clock in core play · completion advances, stars are a bonus.

---

## 0. `LevelDef` schema the engine consumes

```ts
type Goal = 'lines' | 'multi' | 'combo' | 'survive' | 'score' | 'collect' | 'barnacle';
type Mode = 'guided' | 'fair' | 'seeded';
type Element = 'barnacle' | 'coral' | 'pearl' | 'anchor' | 'current' | 'bonus' | 'storm' | 'deepTide';
type SeedPolicy = 'seeded:level' | 'seeded:level+attempt' | 'seeded:date' | 'unseeded';

interface LevelDef {
  id: number;             // 1..40, the level's canonical order
  name: string;
  chapter: string;        // 'The Shallows' | 'The Reef' | 'The Deep' | 'Open Water'
  goal: Goal;
  target: number;         // lines/multi/combo count · survive rises · score pts · collect count · barnacle cells
  moveLimit: number;      // 0 = unlimited (turn-based, never a clock)
  mode: Mode;             // authored voyage: guided (Ch1) → fair (Ch2-4). 'seeded' is for Daily/leaderboard.
  elements: Element[];    // board nouns seeded into this level ([] = clean board)
  milestone: boolean;     // true → kinder assist floor + chapter-complete resolution
  seedPolicy: SeedPolicy; // how the board RNG is seeded (see §6)
  tideRate?: number;      // survive levels only; multiplier on the prototype rise schedule (default 1.0)
}
```

**`mode` vs `seedPolicy` are orthogonal.** `mode` sets *how much the generator helps* (assist strength). `seedPolicy` sets *how the board RNG is derived* (reproducibility). Ch1 is `guided`; Ch2–4 are `fair`; `seeded` is reserved for the Daily Tide / leaderboards, which are not authored voyage levels.

---

## 1. The complete 40-level table

Legend for the **Type** annotation: `intro` = new element/goal in isolation · `practice` = consolidate the prior lesson · `capstone` = chapter milestone showcase. `tideRate` shown only where relevant.

### Chapter 1 — The Shallows (L1–10) · mode `guided`

| id | name | goal | target | moveLimit | elements | milestone | seedPolicy | Type / teaches |
|---|---|---|---|---|---|---|---|---|
| 1 | First Steps | lines | 1 | 0 | — | — | seeded:level | intro · placement + what a clear is (un-losable) |
| 2 | Find the Line | lines | 3 | 0 | — | — | seeded:level | practice · repeat the loop, no pressure |
| 3 | Keep Going | lines | 5 | 0 | — | — | seeded:level | practice · stamina, board management |
| 4 | Double Up | multi | 2 | 0 | — | — | seeded:level+attempt | intro · the setup move (gap-fill shines) |
| 5 | Combo Starter | combo | 2 | 0 | — | — | seeded:level+attempt | intro · consecutive clears = combo |
| 6 | Tidal Pool | survive | 4 | 0 | — | — | seeded:level+attempt | intro · the tide, gently (tideRate 1.0) |
| 7 | Efficiency | lines | 4 | **8** | — | — | seeded:level+attempt | intro · FIRST move limit — conspicuously generous |
| 8 | Foundations | lines | 8 | 0 | — | — | seeded:level+attempt | practice · longer endurance run |
| 9 | Rising Waters | survive | 6 | 0 | — | — | seeded:level+attempt | practice · sustained tide (tideRate 1.0) |
| 10 | Tight Quarters | lines | 5 | **12** | — | **✓** | seeded:level+attempt | capstone · efficiency showcase, generous budget |

### Chapter 2 — The Reef (L11–20) · mode `fair`

| id | name | goal | target | moveLimit | elements | milestone | seedPolicy | Type / teaches |
|---|---|---|---|---|---|---|---|---|
| 11 | Barnacle Bay | lines | 4 | 0 | barnacle | — | seeded:level+attempt | intro · **barnacles** (fixed blocker), easy target |
| 12 | Scrub the Hull | barnacle | 6 | 0 | barnacle | — | seeded:level+attempt | practice · clear barnacle cells |
| 13 | Triple Crest | multi | 3 | 0 | — | — | seeded:level+attempt | intro · triple clears (achieve a 3-line placement) |
| 14 | Coral Shelf | lines | 5 | 0 | coral | — | seeded:level+attempt | intro · **coral** (2-hit cells), easy target |
| 15 | Coral Garden | collect | 5 | 0 | coral | — | seeded:level+attempt | practice · clear the coral off the board |
| 16 | Reef Rhythm | lines | 6 | **14** | — | — | seeded:level+attempt | practice · first *fair* efficiency (no new element) |
| 17 | Open Shallows | combo | 3 | 0 | — | — | seeded:level+attempt | practice · combo revisited, deeper |
| 18 | Pearl Cove | collect | 4 | 0 | pearl | — | seeded:level+attempt | intro · **pearls** (collection), easy target |
| 19 | Pearl Diver | collect | 6 | 0 | pearl | — | seeded:level+attempt | practice · larger pearl haul |
| 20 | The Reef Guardian | lines | 6 | 0 | barnacle, coral | **✓** | seeded:level+attempt | capstone · barnacle+coral, tide gentle, unlimited |

### Chapter 3 — The Deep (L21–30) · mode `fair`

| id | name | goal | target | moveLimit | elements | milestone | seedPolicy | Type / teaches |
|---|---|---|---|---|---|---|---|---|
| 21 | Into the Deep | survive | 5 | 0 | deepTide | — | seeded:level+attempt | intro · **deep tide** (faster rises), easy count (tideRate 1.35) |
| 22 | Anchor's Hold | lines | 5 | 0 | anchor | — | seeded:level+attempt | intro · **anchors** (locked columns), easy target |
| 23 | Gold Rush | score | 3000 | **18** | — | — | seeded:level+attempt | intro · **score rush** goal, generous budget, clean board |
| 24 | Locked Reef | lines | 6 | 0 | anchor | — | seeded:level+attempt | practice · anchors, no budget pressure |
| 25 | Narrow Passage | lines | 7 | **16** | — | — | seeded:level+attempt | practice · deep efficiency (no new element) |
| 26 | The Current | lines | 5 | 0 | current | — | seeded:level+attempt | intro · **current** (piece drift), easy target |
| 27 | Drift | lines | 6 | 0 | current | — | seeded:level+attempt | practice · current, deeper |
| 28 | Deep Water | survive | 8 | 0 | deepTide | — | seeded:level+attempt | practice · sustained deep tide (tideRate 1.35) |
| 29 | Treasure Hunt | collect | 8 | 0 | pearl | — | seeded:level+attempt | practice · big pearl collection |
| 30 | The Abyss | lines | 8 | 0 | anchor, current | **✓** | seeded:level+attempt | capstone · anchor+current, generously solvable, unlimited |

### Chapter 4 — Open Water (L31–40) · mode `fair`

| id | name | goal | target | moveLimit | elements | milestone | seedPolicy | Type / teaches |
|---|---|---|---|---|---|---|---|---|
| 31 | Bright Shoals | lines | 5 | 0 | bonus | — | seeded:level+attempt | intro · **bonus/multiplier tiles**, easy target |
| 32 | Multiplier Reef | score | 4000 | **20** | bonus | — | seeded:level+attempt | practice · score with bonus tiles helping |
| 33 | Open Passage | lines | 8 | **18** | — | — | seeded:level+attempt | practice · mastery efficiency (no new element) |
| 34 | High Seas | survive | 9 | 0 | deepTide | — | seeded:level+attempt | practice · longest tide survival (tideRate 1.4) |
| 35 | Pearl Fields | collect | 9 | 0 | pearl | — | seeded:level+attempt | practice · large collection, calm |
| 36 | Squall | lines | 5 | 0 | storm | — | seeded:level+attempt | intro · **storms** (turn-timed events), easy target |
| 37 | Weathering | lines | 6 | 0 | storm | — | seeded:level+attempt | practice · storms, deeper |
| 38 | Deep Gold | score | 4500 | **22** | bonus | — | seeded:level+attempt | practice · score rush with multipliers |
| 39 | Cascade | combo | 4 | 0 | — | — | seeded:level+attempt | practice · sustained combo mastery |
| 40 | The Open Sea | lines | 10 | 0 | bonus | **✓** | seeded:level+attempt | finale · calm showcase of everything, unlimited |

**Element-drip verification** (matches doc 03F / 04B exactly): barnacle L11 · coral L14 · pearls L18 · deep tide L21 · anchor L22 · score rush L23 · current L26 · bonus tile L31 · storm L36. Milestones L10/L20/L30/L40. Every intro sits on an unlimited or wide target with no simultaneous budget tightening; every intro is followed by a practice level; new elements only *combine* on milestones (L20 barnacle+coral, L30 anchor+current, L40 the full showcase).

**One deliberate deviation from the doc-03C sketch, flagged for you:** doc 03C illustrates L10 as "5 lines in 8 moves." I set **L10 moveLimit = 12 [OPEN — product owner]** because doc 04D §4 requires milestones to be *extra-generous* ("winnable first or second try," "assist floor at its kindest"). An 8-move budget on 5 lines gives ≈0 slack (see §2) and would make the chapter's celebration a wall — the opposite of the intended beat. The name "Tight Quarters" stays as *board* flavor (crowded), not a punishing budget. If you prefer the literal 8, it must ship with the milestone assist floor cranked and QA must confirm the ≥80% first-try band anyway.

---

## 2. Quantified move budgets (every move-limited level)

**Estimation model** — `expectedMovesToWin` (EMW) for a lines goal of *n*: `EMW = round(costPerLine · n + startup)`, `startup = 1` (initial board build), `costPerLine` by mode/pressure:

| context | costPerLine | why |
|---|---|---|
| Guided (Ch1) | **1.3** [OPEN] | gap-fill assist frequently hands the finisher |
| Fair · Reef (Ch2) | **1.6** [OPEN] | no gap-fill; light board |
| Fair · Deep (Ch3) | **1.8** [OPEN] | obstacles + faster tide crowd the board |
| Fair · Open (Ch4) | **1.9** [OPEN] | densest boards, least bias |

For **score** goals: `EMW = round(target / ptsPerPlacement)`, `ptsPerPlacement ≈ 200` (Ch3) / **≈ 240 with bonus tiles** (Ch4) [OPEN] — derived from the prototype scoring (a single-line clear ≈ 80 pts; frequent 2-line/combo placements pull the average to ~200+).

**`budgetSlack = moveLimit − EMW`.** Positive and visible = generous.

| id | level | goal/target | moveLimit | EMW | **slack** | one-line rationale |
|---|---|---|---|---|---|---|
| 7 | Efficiency | lines 4 | **8** | ≈5 (guided, gap-fill ↓ cost) | **≈+3** | Ch1's only budget; conspicuously forgiving — a median player finishes with ~3 moves spare. |
| 10 | Tight Quarters | lines 5 | **12** | ≈7 (guided + kind milestone assist) | **≈+5** | Capstone must feel like a victory lap; largest slack in Ch1. |
| 16 | Reef Rhythm | lines 6 | **14** | ≈11 (fair) | **≈+3** | First *fair* efficiency; wider slack softens the loss of gap-fill. |
| 23 | Gold Rush | score 3000 | **18** | ≈15 | **≈+3** | Score goal introduced clean (no board element); budget forgiving so the new *verb* lands. |
| 25 | Narrow Passage | lines 7 | **16** | ≈14 (fair deep) | **≈+2** | Real pressure now; slack tightens but never negative. |
| 32 | Multiplier Reef | score 4000 | **20** | ≈16 (bonus tiles ↑ pts) | **≈+4** | Bonus tiles inflate scoring, so effective slack is generous despite the higher target. |
| 33 | Open Passage | lines 8 | **18** | ≈16 (fair open) | **≈+2** | Mastery-chapter efficiency; tightest lines budget in the game, still positive. |
| 38 | Deep Gold | score 4500 | **22** | ≈19 (bonus tiles) | **≈+3** | Late score peak; multipliers keep it fair. |

All eight `moveLimit` values are **[OPEN — product owner]** recommendations; slack is the property to hold when tuning. **Hard rule the tuner must not break:** never let any authored `budgetSlack` go ≤ 0, and never pair a tightened budget with a newly-introduced element (already honored — every intro level above is `moveLimit 0`).

---

## 3. The assist-fade curve (replaces `challengeLevel < 10` + fixed `0.55`)

The prototype has two hard cliffs: assists switch fully **on** below level 10 and fully **off** at/above it, and gap-fill fires at a flat `0.55`. Both become smooth, data-driven functions the generator reads.

**Assist key.** For authored voyage levels the assist strength keys on `level.id` (so calibration is deterministic and reproducible). For endless/Daily replays of early content, key on `assistIndex = max(level.id, min(lifetimeGames, 20))` so a veteran replaying L2 is not over-helped. `[OPEN — product owner]` recommend this blend.

### (a) Gap-fill probability `p_gap(L)`

Strong in Ch1, tapering smoothly to **0 by early Chapter 2**:

```
p_base(L)  = clamp( 0.60 − 0.05 · (L − 1), 0, 0.60 )      // linear; hits 0 at L = 13
p_gap(L)   = clamp( p_base(L) + teachBonus(L) + milestoneBonus(L), 0, 0.60 )

teachBonus(L)     = +0.10 on the element/verb *intro* levels where the assist is the lesson
                    (recommended: L4 Double Up, L5 Combo Starter)   [OPEN]
milestoneBonus(L) = +0.20 on milestone levels (kinder floor per doc 04D §4)   [OPEN]
```

Resulting lookup table (engine may consume this directly instead of the formula):

| L | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13+ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **p_gap** | .60 | .55 | .50 | **.55** | **.50** | .35 | .30 | .25 | .20 | **.35** | .05 | .00 | **.00** |

(L4/L5 carry the `teachBonus`; L10 carries the `milestoneBonus`.) From L13 on, `p_gap = 0` forever — the Reef and beyond earn their wins with no manufactured finishers. All coefficients **[OPEN — product owner]**.

### (b) Pressure-dial strength `s_p(chapter)` — relaxes over chapters, never 0

The prototype's crowded/very-crowded reweighting (big pieces ×0.22, small ×2.4) is the anti-flood "pressure dial." Scale its *magnitude* by `s_p ∈ (0, 1]` so it eases as players improve but never disappears (a live fairness aid, distinct from the solvability floor):

```
bigMult(s_p)   = 1 − s_p · (1 − 0.22) = 1 − 0.78 · s_p     // → 0.22 at s_p=1 (prototype), 0.688 at s_p=0.40
smallMult(s_p) = 1 + s_p · (2.4 − 1)  = 1 + 1.40 · s_p     // → 2.40 at s_p=1,          1.560 at s_p=0.40
```

| chapter | Shallows | Reef | Deep | Open Water | Endless/Daily |
|---|---|---|---|---|---|
| **s_p** [OPEN] | **1.00** | **0.75** | **0.55** | **0.40** (floor) | **0.40** |

`s_p` never reaches 0 — the "don't flood a crowded board with big pieces" instinct stays on for the 45–65 player forever. Only the *gap-fill gift* fades to 0; the *anti-flood pressure* only relaxes to a floor.

### (c) Solvability floor = 1.0 (constant, forever)

Unchanged and non-negotiable across **every** mode and chapter: every generated hand must contain a legal placement, and after building a tray, if none of the three pieces fits, force a `dot` into slot 0 (prototype step 7, hardened into a proven invariant per README §4.1). This is fairness, not assistance — it does not fade. Milestones additionally raise the *effective* kindness via the `milestoneBonus` on `p_gap`, but the floor itself is a flat 1.0.

### (d) Gap-fill **detectability suppression** (so wins still feel earned)

Un-suppressed, a 0.55 finisher every hand makes wins feel handed-out — poison for an audience whose reward *is* the pride of "I did that." Rules the generator applies before offering a gap-fill finisher:

1. **Skip if a finisher already exists.** If any piece already in the current tray can complete a line, do **not** inject a gap-fill piece. Assists then only ever appear when genuinely needed → invisible.
2. **One-hand cooldown.** Never offer a gap-fill finisher on two consecutive hands. After firing, suppress for the next hand regardless of `p_gap`. `[OPEN]` recommend cooldown = 1 hand.
3. **Per-level cap.** At most **40%** of hands in a level may contain an injected finisher; once hit, `p_gap = 0` for the rest of that level. `[OPEN]` recommend 40%.
4. **First-slot only** (unchanged from prototype) — the assist never floods the whole tray.

Net effect: the "it gave me exactly what I needed" moment still lands early and often, but it is rationed and masked, so the player reads it as their own skill.

---

## 4. Per-chapter difficulty bands (QA-sim calibration targets)

First-try win-rate targets the headless play-bot must confirm per level (median-heuristic bot; a random-legal baseline is the floor check). A "loss" only counts when the bot genuinely had legal outs (zero unavoidable deaths is a separate hard gate).

| Chapter | Levels | mode | **first-try win-rate band** [OPEN] | notes |
|---|---|---|---|---|
| The Shallows | 1–10 | guided | **≥ 92%** (target 95%) | the retention funnel; L1–3 effectively 100%. |
| The Reef | 11–20 | fair | **≥ 85%** (target 88%) | assists fade; variance widens. |
| The Deep | 21–30 | fair | **≥ 76%** (target 80%) | real pressure; stars start to mean something. |
| Open Water | 31–40 | fair | **≥ 68%** (target 72%) | mastery; near-pure generation. |

**Milestone override** (L10/20/30/40): first-try **≥ 80%** and **two-try ≥ 95%** [OPEN] — a milestone may sit slightly below its chapter's per-level band on first try, but must be near-certain within two attempts (doc 04D "winnable on the first or second try"). This is what the `milestoneBonus` assist and the kinder solvability posture buy.

These bands are the assertions the E5 simulation harness runs in CI: every authored level's simulated first-try win-rate must land in its chapter band ± tolerance before any UI exists.

---

## 5. Scoring & tide math (keep prototype; per-level tide tuning added)

**Scoring — unchanged, keep as-is:**

```
if (N > 0) {
  pts  = N * N * cellsCleared * 10;   // N = lines cleared this placement, quadratic
  pts += combo * 50;                  // combo = consecutive-clearing streak
}
```

No time/speed bonus anywhere. I found no reason to change it; the quadratic-in-lines shape is exactly what rewards the "aha" multi-clears that Precision/Combo/Score levels are built around. **Keep.**

**Tide — keep the rise schedule and the survive semantics, add a per-level `tideRate` multiplier** so "deep tide" is expressible as data rather than a code fork:

```
baseRise = turns <= 10 ? 0.25 : turns <= 30 ? 0.5 : turns <= 60 ? 0.75 : 1.0;   // prototype, unchanged
rise     = baseRise * (level.tideRate ?? 1.0);                                   // NEW: per-level multiplier
tide    += rise;
if (N > 0) tide -= N * 1.5;                                                       // clears push tide down, unchanged
tide     = max(0, tide);
// survive progress = real upward integer crossings, accrued across the run, never lost (unchanged — preserve exactly)
// loss: tide >= 8 (unchanged)
```

Per-level `tideRate` for survive levels (**all [OPEN — product owner]**):

| levels | element | tideRate | intended effect |
|---|---|---|---|
| L6, L9 | standard tide | **1.0** | gentle onboarding; prototype behavior. |
| L21, L28 | deep tide | **1.35** | tide climbs toward the 8-cap faster → the *safe-to-drown* window narrows, so the player must clear more decisively. Difficulty rides on rate **and** a raised survive count, not on any RNG meanness. |
| L34 | deep tide (peak) | **1.40** | longest, tensest survival; still fully winnable (solvability floor + clear-pushback intact). |

**Fairness note on survive difficulty:** because a "rise" accrues toward the target *and* clears push the tide down, a higher `tideRate` alone would just end the level sooner. Deep-tide levels therefore pair the faster rate with a **higher survive target** (L21 = 5, L28 = 8, L34 = 9) so the genuine challenge is *sustaining clears under a shrinking safety margin* — never reflex, always turn-based. QA must confirm the bot can always keep tide < 8 with legal play.

---

## 6. Seed policy (determinism contract, for reference)

- **`seeded:level`** (L1–3): board seed derived from `level.id` only → identical board every attempt. Maximally predictable onboarding; lets us hand-verify un-losability of the first three.
- **`seeded:level+attempt`** (L4–40): seed = `hash(level.id, attemptCounter)` → deterministic *within* an attempt (resume-safe, QA-reproducible) but a fresh board on each retry, so "so close — retry?" feels new rather than punishing. Recommended default for all non-tutorial voyage levels. **[OPEN — product owner]**
- **`seeded:date`**: reserved for the Daily Tide / leaderboards (mode `seeded`), outside the authored voyage.
- Resume determinism: keep the prototype's `mulberry32(seedFromDate ^ (turns+1))` contract, generalized to `mulberry32(levelSeed ^ (turns+1))` for voyage resumes. **Confirm this XOR-on-resume is intended (README §6).** [OPEN]

---

## 7. ~150-word summary

**Philosophy.** Difficulty rises only through the soft dials — target size, budget slack, obstacle count, element interaction, and mode — never through meaner RNG or a clock. Ch1 is effectively un-losable and teaches one verb per level; nouns drip in from Ch2, each introduced alone on an easy target, practiced, then combined only at a milestone. Budgets are always visibly generous (slack +2 to +5).

**Assist curve.** Gap-fill starts at 0.60 and decays linearly to 0 by L13 (with teaching bumps at L4/L5 and a milestone bump), then off forever; the anti-flood pressure dial relaxes across chapters to a 0.40 floor but never reaches 0; the solvability floor is a flat 1.0 always. A cooldown + 40% cap + "skip if a finisher already exists" keeps assists invisible so wins feel earned.

**Riskiest invented numbers:** the three **score targets/budgets (L23/32/38)** — sensitive to the ~200–240 pts/placement assumption — and **L10's move budget (12 vs the doc's 8)**; all flagged [OPEN] and meant for sim calibration.
