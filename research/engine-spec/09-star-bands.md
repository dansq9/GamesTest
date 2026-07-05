# 09 · Star Bands — 3/2/1 Star Resolution & Sim-Calibration

> **Owner:** Game Systems Designer · **Scope:** star resolution / reward bands / the sim-calibration
> method that sets them. **No UI, no rendering.** This quantifies the star metric the prototype
> carried by reference (`04 §2.1` "star resolution stays exactly as prototype `_resolveVoyageWin`")
> and never tuned for the 45–65 audience.
> **Reads against:** `00 §2` (non-negotiable #4 "completion advances; stars never gate"),
> `01 §2` (EMW / `budgetSlack` model), `01 §4` (win-rate bands), `01 §5` (scoring + tide math),
> `04 §2.1` (current star metric + pearl 30/20/10 + milestone flat bonus), `07 §1` (CasualBot(0.55)),
> `07 §3` + `07 §4` gate list (where G15 slots in).
> **Convention:** every invented number is tagged **[OPEN — product owner]** with a recommendation.
> These are the QA sim's calibration inputs — the bands ship *fitted*, never on faith.

---

## 0. TL;DR

- Stars are **encouragement, not a skill filter.** For 45–65 cozy-casual the design target is that
  the **large majority of completions earn 2–3 stars, 3★ is genuinely reachable by a *median* casual
  (not a mastery wall), and 1★ is rare** — only a sloppy clear (won on the last move, nearly drowned,
  or left a cluttered board).
- **One metric per goal, dispatched by goal-type then move-limit** (§1). The prototype gives the
  *metric family* for four cases; this doc quantifies the cutoffs and defines the metric for the four
  the prototype leaves as "else" (`collect`, `multi`, `combo`, `barnacle`).
- **Cutoffs are not guessed — they are fitted by the sim** (§4): CasualBot(0.55) plays N≥5,000 first-try
  games/level, and the 3★/2★/1★ cutoffs are read off **percentiles of the winning-run metric** so the
  realized star distribution matches the per-chapter cozy target. Frozen into `LevelDef.starBands` and
  asserted by a new **G15 (WARN-tier)** gate.
- **Pearls stay 30/20/10** for 3/2/1★; milestone flat chapter bonus (30/40/50/75) is **additive**.
  **Stars never block the next level** (`00 §2` #4).
- **The star metric is computed at win-time only.** No in-play HUD element displays the metric or
  the player's current star band. Stars are a post-level celebration, not a mid-level tracking target.
  This aligns with the cozy posture: no mid-level anxiety about performance.

---

## 1. The star metric + 3/2/1 bands, per goal type

### 1.1 Metric dispatch (precedence, covers all 7 goals)

The prototype `_resolveVoyageWin` (845) branches on the win condition. Formalized as an explicit
precedence so every one of the 7 goal types (`00 §4.2`) resolves unambiguously:

```
starMetric(level, result):
  1. if goal == 'survive'                         → SURVIVE-MARGIN band  (§1.4)
  2. else if goal == 'score'                      → SCORE-RATE band      (§1.6)   // score/turn
  3. else if moveLimit > 0                         → MOVES-USED band     (§1.2)   // move-limited lines
  4. else if goal in {multi,combo,collect,barnacle}→ MOVES-TO-WIN band  (§1.3/§1.5/§1.7)
  5. else  /* unlimited-move lines */              → END-FILL band       (§1.2b)
```

This precedence is chosen so the goal's *own* signal wins where it is meaningful (a score level is
scored by rate even though it also carries a move limit; a survive level by tide headroom), then
falls back to move economy, then to board cleanliness. Verified against the `01 §1` table: no
authored `multi`/`combo`/`collect`/`barnacle` level carries a move limit, and every `score`/`survive`
level is caught by branches 1–2, so branches never collide.

**Common anchor — EMW.** All efficiency-family bands (branches 3, 4, and 6-as-rate) reference
**EMW = expected-moves-to-win**. Design-time seed from `01 §2` (`EMW = round(costPerLine·n + startup)`
for lines; `round(target/ptsPerPlacement)` for score). **At ship, EMW per level is replaced by the
CasualBot(0.55) median moves-to-win measured in §4** — so the bands are anchored on the real target
player, not a formula. Design-time formulas only seed the first calibration pass.

**Combo interaction note (cross-ref `05 §1.2`, `02 §4` step 3):** combo always increments by **+1 per
clearing placement** regardless of how many lines that placement clears. A single placement clearing
3 lines gives combo +1 (not +3). The multi-line payoff is in the N² score term, not in the combo
counter. Two independent reward axes: N² for depth (one big move), combo for breadth (chain of
clearing moves).

### 1.2 Move-limited lines (branch 3) — metric = `movesUsed` (lower is better)

Levels: L7, L10, L16, L25, L33 (the move-limited `lines` levels; the score levels L23/32/38 use §1.6).

| Stars | Cutoff | Rationale |
|---|---|---|
| **3★** | `movesUsed ≤ EMW + b3` | Median casual finishes near EMW → lands in 3★. `b3` = small chapter cushion. |
| **2★** | `movesUsed ≤ moveLimit − 1` | Finished with **at least one move to spare**. |
| **1★** | otherwise (`movesUsed == moveLimit`) | Won on the **very last move** — a squeaker. |

`b3` chapter cushion **[OPEN — product owner]** (the sim overrides with the §4 percentile fit):
Ch1 **+1**, Ch2 **+1**, Ch3 **+0**, Ch4 **+0**. Because authored `budgetSlack` is **+2 to +5**
(`01 §2`), the 2★ band spans EMW+cushion…moveLimit−1 and **1★ collapses to only the last-move win**,
which is exactly the "rare, sloppy-clear" outcome the cozy posture wants.
*Worked example (L10, milestone, `moveLimit 12`, `EMW ≈ 7`, Ch1 cushion +1):* 3★ if `movesUsed ≤ 8`,
2★ if `9…11`, 1★ if `12`.

### 1.2b Unlimited-move lines (branch 5) — metric = `endFillPct` (lower is better)

The prototype "else → remaining board fill." Applies to every `lines` level with `moveLimit == 0`
(most of Ch1–Ch4). Metric = board fill % at the instant the Nth line clears (you win the moment the
goal is met, so the board state then reflects how cleanly you played).

| Stars | Cutoff **[OPEN]** | Meaning |
|---|---|---|
| **3★** | `endFillPct ≤ 25%` | Tidy finish — board stayed open. |
| **2★** | `endFillPct ≤ 45%` | Workable but cluttered. |
| **1★** | otherwise | Won on a nearly-full board. |

Thresholds are seeds; §4 fits them to the per-level end-fill distribution.

### 1.3 `multi` (branch 4) — N lines in one placement — metric = `movesUsed` to the qualifying drop

A one-shot achievement (win fires on the placement that clears N lines at once). The performance
signal is **how efficiently you built and triggered the multi** → `movesUsed` (total placements to
the winning drop), banded against EMW_multi.

| Stars | Cutoff | 
|---|---|
| **3★** | `movesUsed ≤ ⌈EMW_multi · c3⌉` |
| **2★** | `movesUsed ≤ ⌈EMW_multi · c2⌉` |
| **1★** | otherwise |

EMW_multi seed **[OPEN]** `= round(setupCost·N + startup)`, `setupCost ≈ 2.0`, `startup = 1`
(building a full row/col to set up an N-clear costs ~2 placements/line). Chapter factors `c3/c2` in §1.8.

### 1.4 `survive` (branch 1) — metric = tide safety margin `M = 8 − maxTide` (higher is better)

The prototype's "margin over target" is **not** rises-beyond-target — a survive level ends the instant
`tideRises == target` (`01 §5`), so there is never an overshoot to measure. The real performance signal
is **how much headroom you kept below the drown cap (8)**: `M = 8 − maxTide`, where `maxTide` is the
run's peak tide. Big margin = you cleared decisively and never got scary; small margin = you barely
scraped a rise in before drowning.

| Stars | Cutoff **[OPEN]** | Meaning |
|---|---|---|
| **3★** | `M ≥ 3.0` (`maxTide ≤ 5.0`) | Calm survival, never near the cap. |
| **2★** | `M ≥ 1.5` (`maxTide ≤ 6.5`) | Kept control with a real buffer. |
| **1★** | otherwise (`maxTide > 6.5`) | Won but flirted with drowning. |

**Deep-tide caveat:** `tideRate` 1.20–1.40 levels (L21/28/34) naturally compress margin, so a flat
absolute threshold would make them stingier. The §4 calibration **sets survive cutoffs per level from
that level's `maxTide` distribution**, which absorbs the deep-tide compression automatically — the
`M ≥ 3.0 / 1.5` numbers above are the standard-tide seed only.
**[OPEN — product owner]:** primary metric `maxTide` (run-worst headroom, rewards sustained calm — recommended)
vs. the gentler `tideAtWin` (headroom at the winning rise, forgives one unlucky mid-run spike).

**Note:** the star metric (`maxTide`) is distinct from the HUD objective (`tideRises` progress toward
goal). The HUD never shows `maxTide` or the player's current star band — stars are resolved post-win only.

### 1.5 `combo` (branch 4) — reach ×N — metric = `movesUsed` to first reach ×N (lower is better)

You win when `combo` first reaches the target ×N. The signal is **how quickly/cleanly you chained**
there → `movesUsed`.

| Stars | Cutoff |
|---|---|
| **3★** | `movesUsed ≤ ⌈EMW_combo · c3⌉` |
| **2★** | `movesUsed ≤ ⌈EMW_combo · c2⌉` |
| **1★** | otherwise |

EMW_combo seed **[OPEN]** `= round(1.5·N + 1)` (each combo step needs a clear; the one-move grace
`05 §1` means a setup move between clears doesn't reset, so ~1.5 placements per combo step). Factors §1.8.

### 1.6 `score` (branch 2) — metric = `score/turn` rate `R = finalScore / turns` (higher is better)

Prototype "score → score/turn." Since the level ends the instant `score ≥ target`, `finalScore ≈ target`
and `R ≈ target/turns` — i.e. `R` is monotone in **turns-to-target**, so the score bands are the
move-limited bands (§1.2) expressed as a rate.

| Stars | Cutoff (rate form) | Equivalent (turns form) |
|---|---|---|
| **3★** | `R ≥ target / (EMW + b3)` | reached target in `≤ EMW + b3` turns |
| **2★** | `R ≥ target / (moveLimit − 1)` | reached with ≥1 move to spare |
| **1★** | otherwise | needed the whole budget |

Same `b3` cushion as §1.2. *Note:* bonus tiles (L32/38) inflate `finalScore` per placement, raising `R`
naturally — that is intended (multipliers are a reward, `04 §1.5`), and the §4 fit keeps the cutoffs
honest by reading the *measured* rate distribution on those exact levels.

### 1.7 `barnacle` & `collect` (branch 4) — clear/gather N — metric = `movesUsed` to the Nth clear/collect

The prototype lumps these in "else → fill", but board fill is a weak signal for a collection goal
(a pearl or barnacle can sit collected on an otherwise-tidy board). **Recommend upgrading both to
`movesUsed`** (placements to clear/collect the Nth item) — it directly rewards *efficient gathering*,
which is the skill these levels teach. End-fill is retained only as the **1★→2★ tiebreak** on exact
move ties.

| Stars | Cutoff |
|---|---|
| **3★** | `movesUsed ≤ ⌈EMW_collect · c3⌉` |
| **2★** | `movesUsed ≤ ⌈EMW_collect · c2⌉` |
| **1★** | otherwise |

EMW seeds **[OPEN]**: `collect` `= round(1.6·N + 1)` (cover the cell, then complete its line);
`barnacle` `= round(1.5·N + 1)` (a barnacle clears with its line, slightly cheaper than a covered pearl).
Factors §1.8.

### 1.8 Chapter cushion factors (the taper) `[OPEN — product owner]`

`c3`/`c2` scale the moves-to-win cutoffs (§1.3/1.5/1.7); they loosen early (more 3★ in onboarding)
and tighten late (stars start to mean more). The §4 fit is authoritative; these seed pass 1.

| Chapter | c3 (3★ ≤ ⌈EMW·c3⌉) | c2 (2★ ≤ ⌈EMW·c2⌉) | move-limited `b3` |
|---|---|---|---|
| Ch1 Shallows | **1.15** | **1.60** | +1 |
| Ch2 Reef | **1.10** | **1.50** | +1 |
| Ch3 Deep | **1.05** | **1.45** | +0 |
| Ch4 Open Water | **1.00** | **1.40** | +0 |

---

## 2. The cozy-generous posture (the key design call)

**Design call: for 45–65 cozy-casual, stars are a warm pat on the back, not a grade.** A player who
finishes a level should feel celebrated; a 3★ should read as "you played that beautifully," reachable
by a *median* casual on a good-but-not-perfect run — **never a mastery wall that only an optimizer
clears.** 1★ must be genuinely rare and legibly earned (last-move squeaker / near-drown / cluttered
board), so it lands as "phew, made it" — not "you're bad at this."

**Target first-try star distribution among *completions*** (a win; separate from the *win-rate* bands
of `01 §4`). `[OPEN — product owner]`:

| Chapter | 3★ | 2★ | 1★ | 2–3★ combined |
|---|---|---|---|---|
| Ch1 Shallows | **~65%** | ~28% | ~7% | ~93% |
| Ch2 Reef | **~55%** | ~35% | ~10% | ~90% |
| Ch3 Deep | **~48%** | ~40% | ~12% | ~88% |
| Ch4 Open Water | **~42%** | ~43% | ~15% | ~85% |
| **Milestones** (L10/20/30/40) | **~75%** | ~22% | ~3% | ~97% |

Properties this encodes (all asserted in §4/G15):
- **2–3★ is the large majority everywhere** (≥85%, ≥93% in Ch1). 1★ tops out at ~15% even in the
  hardest chapter and is ~7% or less in onboarding.
- **3★ is median-reachable in Ch1–Ch2** (the median casual's metric lands in the 3★ band); it tapers
  to "very good run" by Ch4 but is *never* an optimizer-only outcome.
- **Milestones skew the most generous** (victory-lap ceremonies, `04 §2.1` / `00 §6`), matching the
  kinder assist floor they already carry.
- **Gentle taper by chapter** mirrors the win-rate taper (`01 §4`, 92%→68%): as real skill demands
  rise, 3★ shifts from "most players" to "a clean run," but 1★ never becomes the norm.

**Reconciliation with "stars never gate" (`00 §2` #4).** These distributions are strictly a **bonus +
retention hook**, never a progression valve. The next level unlocks on *completion*, regardless of star
count (`04 §2.1`, `03 §D.3` `won` carries `nextName` on any win). A 1★ clear advances identically to a
3★ clear. Stars drive only (a) the pearl payout (§3), (b) the replay-to-improve loop (the "games 41–70"
re-plays of `04 §2`), and (c) chapter star-totals for cosmetic milestones. **Win-rate** (how often you
complete) and **star distribution** (given completion, the star split) are two independent measurements
on the same sim run — G9 owns the former, G15 the latter.

---

## 3. Pearl payout mapping

- **Keep 30 / 20 / 10 pearls for 3★ / 2★ / 1★** (prototype `_resolveVoyageWin` 875) — **recommend no
  change.** The 3:1 ratio makes 3★ feel worth chasing without making 1★ feel worthless, which fits the
  audience's "reward the effort" expectation. Confirm as the shipped values **[OPEN — product owner:
  keep 30/20/10]**.
- **Milestone flat chapter bonus is additive**, on top of the star pearls (`04 §2.1`): L10 **+30**,
  L20 **+40**, L30 **+50**, L40 **+75** `[OPEN]`. e.g. a 2★ clear of L20 pays `20 (star) + 40 (milestone)
  = 60` pearls. The milestone bonus is **not star-gated** — you get the full flat bonus at any star count.
- **In-level collectible pearls** (`04 §5.1`, +1 wallet each `[OPEN]`) are a separate additive stream and
  do not interact with star payout.
- **Stars never block the next level** (restated for the economy layer): pearls are the only thing star
  count changes. Progression is gated on `won`, full stop.

---

## 4. The sim-calibration method — how the bands are *set* (the test, not a guess)

The bands above are **seeds**. The shipped cutoffs are **fitted by the frozen CasualBot(0.55)** so the
realized star distribution matches the §2 targets for the actual target player — the same anti-circularity
discipline the win-rate bands use (`07 §1.6`: fit on a frozen bot, then assert).

### 4.1 What the bot measures

Reuse the **G9 / T-BAND** simulation run (`07 §2`, `07 §3`) — no new games needed, only extra logging.
Per authored level `L`, frozen **CasualBot(0.55)**, first-try (no continues/rerolls), **N ≥ 5,000 games**
(milestones ≥ 10,000, per `07 T-BAND`). Over the **winning runs only**, record the empirical distribution
of the branch-relevant metric:

| Goal branch | Logged metric | 
|---|---|
| move-limited lines / score | `movesUsed` (score also logs `score/turn`) |
| unlimited lines | `endFillPct` at win |
| multi / combo / collect / barnacle | `movesToWin` (`movesUsed`) |
| survive | `maxTide` (and `tideAtWin`) |

Also log the **median casual's** metric value per level (for the median-reachability assertion below).

### 4.2 Deriving cutoffs from percentiles

For a metric where **lower is better** (moves, fill, maxTide), let `P(x)` = fraction of winning runs
with metric ≤ `x`. Choose cutoffs so the star *shares* hit the chapter target `(t3, t2, t1)` from §2:

```
cutoff_3★ = smallest x with P(x) ≥ t3            // best t3 fraction of wins get 3★
cutoff_2★ = smallest x with P(x) ≥ t3 + t2       // next t2 fraction get 2★; remainder (bottom t1) = 1★
```

For **survive** and **score/turn** (higher is better) apply the mirror on `1 − P`. The §1 seed cutoffs
(EMW·c3, `moveLimit−1`, 25%/45% fill, `M ≥ 3.0/1.5`) initialize the search; the percentile fit adjusts
them until the distribution lands. Deep-tide and bonus-tile levels are auto-corrected because the fit
reads *that level's* metric distribution.

**Freeze & store.** The fitted `{cutoff_3★, cutoff_2★}` per level are written into **`LevelDef.starBands`**
and shipped as static data — stars are then computed live by a pure comparison against frozen cutoffs
(deterministic, reproducible for a seeded run, consistent with the leaderboard-reproducibility posture
`07 SP5`). Bands are **re-fit only when the level or assist curve changes**, and re-frozen — never
recomputed on the device.

### 4.3 New gate — **G15 · Star-band calibration** (WARN-tier)

Slots into `07 §3` (the nightly difficulty loop, as a step 6) and `07 §4` heavy-tier gate list, beside
**G12–G14** (the other WARN-tier calibration gates). **WARN, not HARD, because stars never gate
progression** (`00 §2` #4) — a miss is a *tuning ticket to the Systems Designer*, not a ship blocker.

**G15 asserts, with the frozen `starBands` and a re-simulated N≥5,000 first-try run:**
1. **Distribution match:** per chapter, realized `(3★, 2★, 1★)` shares are within tolerance of the §2
   target — `3★ share within ±8pp`, **`1★ share ≤ target + 5pp`** (the load-bearing cozy guarantee:
   1★ stays rare). `[OPEN]` ε = 8pp / 5pp.
2. **Median-reachability (the "not a mastery wall" check):** on every **Ch1 and Ch2** level, the
   *median* casual's metric falls in the **3★** band (`metric(median) ≤ cutoff_3★`); on Ch3/Ch4, the
   median falls in **≥ 2★**. This is the concrete assertion that 3★ is achievable by a median casual,
   not an optimizer.
3. **Monotonic sanity:** 3★-share is **non-increasing across chapters** (Ch1 ≥ Ch2 ≥ Ch3 ≥ Ch4), and
   milestone 3★-share ≥ its chapter's per-level 3★-share (victory-lap generosity holds).
4. **Never-degenerate:** every level's three bands are non-empty in the casual distribution
   (`0 < cutoff_3★ < cutoff_2★ <` worst observed) — guards against a band no casual run can land in,
   e.g. a 3★ cutoff tighter than the StrongBot's metric (which would make 3★ an optimizer-only wall).

**Fail action:** emit a retune ticket naming the level, its measured vs. target star split, and the
offending cutoff — the Systems Designer adjusts `c3/c2/b3` or the seed threshold and re-fits. Because
G15 rides the existing G9 run, it adds logging + assertions, **no extra simulation cost.**
