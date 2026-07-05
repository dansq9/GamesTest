# 08 · Decisions & Open Questions — the one list to rule on

> Every `[OPEN — product owner]` threshold and every persona-required change, consolidated from `01`–`07`,
> grouped, with a **recommended answer** and the owner. Resolve these + run the D6 re-author pass and the
> engine phase is fully specified. Nothing here blocks starting E0 (determinism/skeleton) — most items are
> tuning the sim will help lock. IDs are stable references.

**Legend:** ★ = decide before the relevant build phase · ○ = tunable, sim will calibrate · $ = business call.

---

## A. Difficulty & tuning numbers  *(owners: Game Systems Designer + Fairness; sim calibrates)*

| ID | Question | Recommendation | Src |
|---|---|---|---|
| A1 ○ | `costPerLine` per context (EMW model) | Guided 1.3 · Reef 1.6 · Deep 1.8 · Open 1.9 — calibrate via `07 §3` | `01 §2` |
| A2 ○ | `ptsPerPlacement` for score-goal budgets | ~200 (Ch3) / ~240 with bonus tiles (Ch4) — **replace with the bot's measured rate** | `01 §2` |
| A3 ★ | The 8 move-budget values | Hold **budgetSlack +2…+5**, never ≤0; the eight `moveLimit`s in `01 §2` are the recommendation | `01 §2` |
| A4 ★ | L10 milestone budget: 12 (Systems) vs 8 (doc-03C sketch) | **12** — a milestone must be a victory lap (slack ≈+5); if 8, crank milestone assist + confirm ≥80% first-try | `01 §1` |
| A5 ○ | Riskiest score targets/budgets: L23=3000/18, L32=4000/20, L38=4500/22 | Ship as recommended; **the difficulty loop validates them against measured pts/placement** before lock | `01 §2`, `07 §3` |
| A6 ○ | Gap-fill curve: base 0.60 decaying to 0 at L13; teachBonus +0.10 (L4/L5); milestoneBonus +0.20 | Adopt the lookup table in `01 §3a` | `01 §3` |
| A7 ○ | Gap-fill suppression: cooldown = 1 hand; per-level cap = 40%; skip-if-finisher-exists | Adopt all three (this is what keeps assists invisible) | `01 §3d` |
| A8 ○ | Pressure-dial `s_p` per chapter: 1.00 / 0.75 / 0.55 / 0.40-floor | Adopt; floor never 0 | `01 §3b` |
| A9 ★ | Per-chapter first-try win bands | Ch1 ≥92 · Ch2 ≥85 · Ch3 ≥76 · Ch4 ≥68; milestones ≥80 first-try / ≥95 two-try | `01 §4` |
| A10 ★ | Deep-tide `tideRate` | **1.20× at L21** (eased per persona D5), 1.35 at L28, 1.40 at L34 | `01 §5`, `06 §5.5` |
| A11 ○ | Pressure fill thresholds | keep prototype 0.60 / 0.78 unless the sim says otherwise | `03 §3` |

---

## B. Determinism & architecture  *(owner: Engineer + Fairness)*

| ID | Question | Recommendation | Src |
|---|---|---|---|
| B1 ★ | Two-axis model (surface × fairness) vs. one mode enum | **Two axes** — it's what fixes the tide/zen affordance bug and the goal/constraint HUD | `02 §3`, `00 §3` |
| B2 ★ | Resume implementation: `getState()` rehydration vs. `rngCalls` fast-forward | **`getState()` rehydration** (O(1)); replace the prototype XOR entirely; bridge-test both | `03 §1.4`, `02 §7`, `07 T2` |
| B3 ★ | Daily seed scope | **date-only** (one shared board); date+level only if a future "daily voyage" ships | `03 §1.3`, `04 §4.1` |
| B4 ★ | Ship `undo` in core? | **No** — drop from core; layer Undo-Last on host `snapshot()/restore()`; forbidden in Seeded | `02 §2`, `05 §3.3` |
| B5 ★ | Reroll semantics: fresh RNG draw vs. pure permutation of existing tray | **Pure permutation** where possible — keeps even Seeded deterministic | `02 §8` |
| B6 ○ | `RETRY_CAP` before safe fallback | 8 | `03 §8` |
| B7 ★ | `F_rescue` / `F_cap` (Guided rescue + fill ceiling) | start 0.72 / 0.80; **certified by driving Guided no-moves to zero over ≥1e6** | `03 §4.3, §8` |
| B8 $ | Is Blitz ranked? | If yes it **must be seeded** like Daily; recommend Blitz stays casual/unranked in v1 | `03 §1.3` |

---

## C. Elements & progression  *(owner: Progression + Systems; persona veto applied)*

| ID | Question | Recommendation | Src |
|---|---|---|---|
| C1 ★ | `current` element: cut vs. tray-bias (drift **vetoed**) | **Cut as a taught element** (simplest, honors the veto); if kept, tray-bias only behind `FEATURES.currentLive` | `04 §1.6`, `06 §5.1` → **D2** |
| C2 ★ | `storm`: de-fang vs. cut | **Remove `fillCells`**; keep only a gentle telegraphed tide-bump on survive levels, or cut | `04 §1.7`, `06 §5.3` → **D3** |
| C3 ★ | L30 milestone content (if `current` cut) | **anchor + pearl** showcase (both taught, calm) | `00 §6`, `04 §2.1` |
| C4 ★ | L26/L27 (freed if `current` cut) | practice/consolidation levels, no new noun | `00 §6` |
| C5 ○ | anchor unlock: turn-count K vs. condition | **K = 5 turns**, `MAX_ANCHOR_COLUMNS = 1`, never lock a full row | `04 §1.4` |
| C6 ○ | coral2: downgraded-recolor + "needs one more pass" legibility | **Required** telegraph so a full-looking un-clearing line never reads as a bug | `04 §1.2`, `06 §5.4` |
| C7 ○ | bonus-tile multiplier stacking cap | **×4** total (protects leaderboard bands) | `04 §1.5` |
| C8 ★ | Tier-B go-live | `current`/`storm` ship dark behind `FEATURES.*Live` until `07 T-TIERB` is green | `04 §3, §6`, `07` |

---

## D. Dynamism layer — combos, specials, power-ups  *(owner: Special Mechanics; persona applied)*

| ID | Question | Recommendation | Src |
|---|---|---|---|
| D-a ○ | Combo grace | **1 forgiven move** (0 = today's harsh reset; 2 = never breaks) | `05 §1.2` |
| D-b ○ | Endless combo score cap `COMBO_SCORE_CAP` | 20 (display climbs freely; only score contribution caps) | `05 §1.2` |
| D-c ○ | Combo→special ladder | ×3 → Line-Blaster · ×6 → Bomb · ×10 → repeat Line-Blaster | `05 §1.4` |
| D-d ○ | Special scoring | Line-Blaster **N=2**; Bomb **flat cells×10** (N≥1 if it completes lines); both advance combo | `05 §2` |
| D-e ★ | Special debuts | Line-Blaster **L17**, Bomb **L29** (both in existing quiet slots) | `05 §2.5` |
| D-f ★ | Satchel: which items, when | **Undo-Last + +Moves** at launch; **Tide-Push** survive-only; **Reroll-Tray** held/cut; one at a time; debut **contextual / ≥L24** (off the L17–19 stack) | `05 §3`, `06 §5.2/§5.7` → **D4** |
| D-g ○ | Power-up sizes / prices | +Moves **N=5**; Tide-Push **−2**; pearl prices 20/15/10/25; **RV ≤3/day** | `05 §3`, `04 §5` |
| D-h ★ | Leaderboard eligibility of helpers | deterministic in-play helpers OK; **any revive disqualifies**; reroll/undo casual-only in ranked | `05 §3.3`, `04 §4.2` |
| D-i ○ | Lucky Tray / Bonus Wave (endless texture) | Lucky Tray p≈0.06 (off in ranked); Bonus Wave every 10 clears → +3 pearls | `05 §5` |

---

## E. Economy & monetization  *(owner: Progression; business)*

| ID | Question | Recommendation | Src |
|---|---|---|---|
| E1 $ | Milestone flat pearl bonuses | 30 / 40 / 50 / 75 (escalating, additive to star rewards) | `04 §2.1` |
| E2 $ | Leaderboard scope | **cohort / friends** over global (less intimidating for 45–65); engine is backend-agnostic | `04 §4.2` |
| E3 $ | Does any `continueAfterLoss` disqualify the leaderboard run? | **Yes** (keeps the board honest); still counts for the streak | `04 §4.2` |
| E4 $ | Streak-chest ladder past day 30; freeze-token economy | repeating 30-day loop @600, or add 60/90/365 tiers; define how freezes are earned/bought | `04 §4.1` |
| E5 $ | Weekly-challenge reward | small pearl + a weekly cosmetic (feeds the chase without inflating pearls) | `04 §4.3` |
| E6 $ | Pearl vs. IAP-exclusive cosmetics; do collectible pearls pay the wallet? | most cosmetics **pearl-earnable** + a few premium IAP-only; collectible pearls **+1 wallet each** | `04 §4.4, §5.1` |

---

## F. Cross-spec / persona decisions surfaced by synthesis

| ID | Question | Recommendation | Src |
|---|---|---|---|
| **D1** ★ | HUD: split Objective + Constraint chips vs. single combined slot | **Split** (Objective always; Constraint only when a moveLimit or tide is live; never both; moves chip reads as calm capacity, never a countdown) | `00 §4.3`, `06 §5.8` |
| **D2** ★ | `current` cut vs. tray-bias | **Cut as taught element** (see C1) | `06 §5.1` |
| **D3** ★ | `storm` de-fang vs. cut | **De-fang** (remove board-litter); cut is acceptable | `06 §5.3` |
| **D4** ★ | Satchel trim to 2 + stagger | **Apply** (see D-f) | `06 §5.7` |
| **D5** ○ | Deep-tide ease-in | **Apply** (see A10) | `06 §5.5` |
| **D6** ★ | Ch3 re-order to insert an L21→L22 practice breath | **Systems Designer re-authors Ch3** (deep-tide → practice → anchor); keeps 10 levels | `06 §5.6` |
| **D7** $ | True ≥2 novelty spacing in dense Ch2: lengthen the chapter or cut a board element? | Accept low-weight optional specials + moved satchel (done); **only lengthen/cut if playtest shows overload** | `00 §6`, `05 §4`, `06 §3` |
| **D8** ○ | Combo *reset* softening vs. `01 §5` "combo unchanged" | Confirm: **score formula unchanged, only the reset softens** — `01`'s owner sign-off | `05 §1.2`, `00 §10` |
| **D9** ○ | Add a small deterministic `pushTide()` hook beyond the three in `02 §8` | **Yes** — so an in-play tide-push reads as a helper, not a revive | `05 §3.1` |

---

## G. Sim-locked thresholds  *(QA commits these; product owner may override)*

Not "open" so much as **chosen by the sim harness** and stated for visibility (`07 §4`):

- Zero-death gate sample sizes: **Guided ≥ 1e6**, Fair/Seeded ≥ 1e5 games per mode, both bots.
- Win-rate band sample: **≥ 5,000 games/level** (milestones ≥ 10,000).
- Band tolerance **ε = 2%**; difficulty regression alarm **δ = 3%**.
- Reference casual skill **s = 0.55** (anchor-fit on the un-losable L1–3, then frozen).
- Daily seed-vetting **SALT_CAP = 64** (smallest cap clearing 60 days of look-ahead).
- `F_rescue = 0.72` / `F_cap = 0.80` are **certified, not assumed** — lowered if any Guided no-moves loss appears.

---

## H. Star-band & economy additions  *(owners: Systems Designer + Progression; new from `09`–`12`)*

| ID | Question | Recommendation | Src |
|---|---|---|---|
| A12 ○ | Star distribution targets per chapter (3★/2★/1★ shares) | 65/28/7 → 42/43/15; milestones 75/22/3 | `09 §2` |
| A13 ★ | Survive star metric: `maxTide` (run-worst) vs `tideAtWin` (at-win) | **`maxTide`** (rewards sustained calm) | `09 §1.4` |
| A14 ○ | G15 tolerances: 3★ ±8pp, 1★ ≤target+5pp | Adopt as recommended | `09 §4.3` |
| A15 ○ | Star-band chapter cushion factors c3/c2/b3 | Ch1 1.15/1.60/+1 → Ch4 1.00/1.40/+0 (sim overrides) | `09 §1.8` |
| E7 $ | Power-ups: pearl cost vs RV-only (#1 balance question) | Lean **RV-primary**, pearls as fallback | `10 §6` |
| E8 ★ | First-Win-of-Day +10 pearls — approve? | **YES** (gentle, no FOMO) | `10 §1` |
| E9 ○ | Special block endless store prices (LB ~15–20, Bomb ~25–30) | Adopt as recommended | `10 §4` |
| E10 ○ | Satchel hold caps (~5 power-ups, ~3 specials) | Adopt | `10 §3–4` |
| E11 ★ | Continue cap per game (≤2) | Adopt | `10 §2` |
| E12 $ | Cosmetic store rotation cadence and slot count | Needs definition | `10 §5` |
| E13 ★ | Free daily Undo allowance — 1 or 2 per day? | **2** (keeps forgiveness ungated) | `10 §3` |
| E14 ★ | Streak-break window — 2 vs 3 missed days | **3** (per persona review — 2 days is a normal weekend) | `10 §5` |
| E15 ★ | Streak-freeze hold cap — 2 vs 3–4 | **3–4** (per persona review — covers a short trip) | `10 §5` |
| AD1 $ | Double-star-pearls RV placement — approve? | YES (celebratory, cozy-safe) | `12 §1` |
| AD2 $ | Interstitial frequency cap (every Nth level) | Every 3rd level completion | `12 §1` |
| AD3 $ | First-session ad immunity window | 3 sessions or 5 levels | `12 §1` |
| AD4 $ | Remove-ads IAP price | $4.99–$9.99 one-time | `12 §2` |
| AD5 $ | Banner on gameplay board? | Product owner's call (see `12 §1.3`) | `12 §1` |
| G-G15 ○ | G15 star-band calibration gate (WARN tier) | Adopt per `09 §4.3` | `09 §4.3` |
| G-G16 ○ | G16 DDA validation gate (WARN tier) | Adopt per `11 §5.2` | `11 §5` |

---

## What's needed before build vs. what the sim will settle

- **Decide before E3–E4 (content):** the ★ items in C and D (element cuts, satchel shape, special debuts,
  HUD split, deep-tide ease, milestone content) — they change what gets authored.
- **Decide before E1–E2 (fairness/determinism):** B1–B5, B7.
- **Business (any time before soft launch):** all $ items in E, plus D7, B8.
- **The ○ items** are tuning the difficulty loop (`07 §3`) calibrates against the win-rate bands — ship the
  recommendations, let the sim lock them.
- **One re-author pass:** D6 (Ch3 ordering) is the only content work outstanding before the 40-level table is final.
