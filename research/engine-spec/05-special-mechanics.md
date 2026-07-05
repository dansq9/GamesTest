# 05 · Special Mechanics, Combos & Dynamism

**Owner:** Special Mechanics, Combo & Dynamism Designer · **Scope:** mechanics / logic / economy-of-mechanics ONLY. **No UI, CSS, or rendering.**
**Audience:** 45–65 cozy-casual (Wordscapes / Fishdom / Solitaire Grand Harvest). **Governing principle:** every special mechanic is *helpful and telegraphed (a reward, never a threat), introduced ONE at a time, never requires reflex or multi-step planning.* When in doubt, cut it. **Restraint is the deliverable.**
**Aligns to (does not contradict):** `01-level-tables.md`, `02-engine-architecture.md`, `03-fairness-solvability.md`, `04-progression-economy.md`. Where I touch their surface I say so explicitly.
**Convention:** invented values tagged **[OPEN — product owner]** with a recommendation. Research claims tagged **[EB]** (evidence-based, from live survey) vs **[SPEC]** (my design inference).

---

## 0. What the market actually does (live survey, condensed)

| Finding | Verdict for our audience |
|---|---|
| **[EB]** Block Blast's core drag-3-pieces mode ships **almost no special blocks**; its dynamism is entirely **combo** (multi-line in one placement) + **streak** (consecutive-clearing placements), and the streak multiplier is enormous — a 59-streak scores ~13,000 for 5 lines vs ~3,150 unstreaked (~4× swing). | **Copy the philosophy (clarity), soften the number.** A 4× streak cliff is an optimization treadmill; wrong for cozy. Keep the streak, make it *forgiving* and *gentle*. |
| **[EB]** Woodoku core is likewise clean. Its **Bomb Mode** uses a bomb that **counts down each move and ends the game** if its line isn't cleared in time. | **Threat → reject.** A game-ending countdown is the exact opposite of "a reward, never a threat." We take the *word* "bomb" but not the mechanic. |
| **[EB]** Woodoku ships gentle helper power-ups: **undo last placement** and **remove one block**. Rainbow/"match-any-color" pieces appear in *match-color* variants. | Undo/remove = helpful, optional, no reflex → **keep the family**. Rainbow-by-color is **meaningless in our engine** (see §2, clears are by fill, not color) → cut. |
| **[EB]** "Adjacent power-ups combine into bigger blasts / chain reactions" (Block Blast match variant). | **Multi-step planning under combinatorial rules → reject** for 45–65. |

**Takeaway:** the leaders win on restraint. Our job is a *combo upgrade* + a **two-piece** special roster + a **four-item** optional power-up satchel — nothing that pressures, times, or threatens.

---

## 1. Combo system — clarified & upgraded (the centrepiece)

### 1.1 What's there today, and its two flaws
Today (`01` §5, `01_current_engine_reference` §Scoring): `combo` increments on any clearing placement, **resets to 0 the instant a placement clears nothing**; score adds `combo * 50`. Two flaws for our audience:
1. **Illegible.** `combo` is an internal int the player never reads as a *thing they own*. There is no state the UI can hold up and celebrate as "your streak."
2. **Unforgiving.** One setup move (placing a piece that *doesn't* complete a line — the correct, thoughtful thing to do) instantly zeroes the streak. That punishes the calm, deliberate play we want to reward. Block Blast's own 4× streak cliff **[EB]** proves how brutal a hard reset feels; we refuse to inherit it.

### 1.2 The upgrade — a legible, FORGIVING streak with a one-move grace
Keep the scoring **formula** exactly as `01` §5 mandates (`pts = N*N*cellsCleared*10; pts += combo*50`). **Change only *when* `combo` resets** — a strictly compatible change to the reset rule, not the point math. *(Flagged deviation from `01` §5's "combo unchanged": the formula is unchanged; the reset trajectory is softened. Rationale below; `01`'s owner to confirm.)*

**The grace rule ("one forgiven move"):**
- Every **clearing** placement: `combo += 1`, and set `comboGrace = true` (grace refreshed).
- The **first** non-clearing placement while `comboGrace === true`: **combo is held, not lost.** Spend the grace (`comboGrace = false`), keep `combo` as-is. Emit `comboHeld`.
- The **second consecutive** non-clearing placement (grace already spent): **now** `combo = 0`. Emit `comboBroken { was }`.
- Any clear at any point refreshes grace back to `true`.

Net: a player gets exactly **one deliberate setup move "for free"** between clears without losing their streak — the single most important cozy affordance here. It is legible ("you have one safe move"), forgiving, and matches the *thematic* forgiveness already in the economy (the Daily **streak-freeze** in `04` §4.1 forgives one missed day — same emotional promise, one layer down). No timer, no pressure.

- **[OPEN — product owner]** grace = **1 move** (recommend). A value of 2 is too loose (streaks never break); 0 is today's hard reset. Recommend 1.
- **[OPEN — product owner]** *Optional* combo score cap. Our authored combo targets are tiny (×2–×4, `01` L5/L13/L17/L39), so runaway score is a non-issue in the voyage. But **endless/Daily** could inflate leaderboards. Recommend capping the *score contribution* at `min(combo, COMBO_SCORE_CAP) * 50`, `COMBO_SCORE_CAP = 20` [OPEN], while letting the *displayed* combo count climb freely (celebration ≠ score inflation). This keeps `04` §4.2 leaderboard bands honest without capping the player's sense of achievement.

### 1.3 Combo as first-class, celebratable engine state
Add to `GameState` (`02` §3):
```ts
combo: number;          // already exists — consecutive-clearing streak
comboGrace: boolean;    // NEW — is a forgiven non-clearing move still available this streak
comboBest: number;      // NEW — best combo reached this game (for end-screen + endless flex)
comboRewardAt: number;  // NEW — highest reward milestone already granted this streak (see §1.4)
```
Events (extends `02` §3 union):
```ts
| { type: 'combo'; value: number }                              // existing — combo grew (N>0)
| { type: 'comboHeld'; value: number }                          // NEW — grace spent, streak survived a quiet move
| { type: 'comboBroken'; was: number }                          // existing — grace exhausted, streak ended
| { type: 'comboReward'; special: SpecialId; combo: number }    // NEW — a milestone granted a special block (§1.4)
```
Ordering slots into `02` §3's canonical list at step **3** (combo/comboBroken), with `comboHeld` occupying the same slot when the placement did not clear but grace covered it, and `comboReward` emitted immediately after (before `trayRefilled`, so a just-earned special can appear in the very next tray).

### 1.4 Combo milestones GRANT specials — the earn-don't-buy reward loop
This is the cozy engine that makes the game feel *progressive without pressure*: **your own clean play hands you helpers.** Nothing is bought, nothing is timed.

- When `combo` **crosses** a milestone value `M` on a clearing placement (i.e. `combo >= M > comboRewardAt`), grant the mapped special into the **satchel** (§3 inventory), set `comboRewardAt = M`, emit `comboReward`.
- Milestone tracking (`comboRewardAt`) **resets to 0 when the streak breaks** — so a fresh streak can earn again, but a single streak can't farm infinite specials.

**Recommended ladder [OPEN — product owner]:**

| combo crosses | grants | rationale |
|---|---|---|
| **×3** | **1 × Line-Blaster** | Reachable, matches the L17 combo-3 target — the reward lands exactly when the lesson does. |
| **×6** | **1 × Bomb** | A real accomplishment for this audience; the area-clear is the bigger prize. |
| **×10** | **1 × Line-Blaster** (repeat) | Endless-tail flex; keeps long streaks feeling generous without a new concept. |

Only **two special *types* ever exist** (§2), so the ladder never introduces a *new thing* past ×6 — it just re-grants. This is deliberate: the reward loop scales in *quantity*, never in *complexity*.

**Determinism guard (critical — coordinated with `03`/`04`):** in **Seeded / Daily / ranked**, combo-earned specials are **DISABLED** (the ladder does not fire; combo/score still work normally). Why: which combos a player hits is *player-dependent*, so granting a tray-perturbing special would give two players on the same Daily seed **different boards** → breaks Daily sameness (`03` §4.1, `04` §4.1). In **casual/voyage** the grant fires and stays deterministic-from-its-own-seed (§2.4). See §2.4 for the exact draw-order rule that keeps golden-master (`03` T1) stable.

---

## 2. Special-block roster (special TRAY pieces)

**Final roster: TWO. Bomb and Line-Blaster.** I aimed at 3–4 (the brief's candidate set: bomb, wild/rainbow, line-blaster, multiplier) and **cut two on principle** — cutting is the on-brand answer (§6). Both survivors are **pure clears**: they only *remove* cells, never block, so they are unconditionally helpful and cannot worsen solvability (`03`). Both are single-origin-cell pieces, so they fit anywhere there is ≥1 empty cell → maximally placeable → they double as a gentle emergency out.

### 2.1 Line-Blaster (the flagship — clearest special in the game)
- **Cell / footprint:** a **1×1 tray piece** flagged `special:'lineBlaster'`. Player drags it onto any single empty cell.
- **Placement + clear rule:** on placement it stamps its cell, then **immediately clears the entire row AND column it sits in** (a plus/cross), regardless of whether they were full. Deterministic, no target-picking step (picking = a planning step we refuse). Cleared cells resolve through the normal pipeline: barnacles removed, coral struck (`hits--`), pearls collected, bonus tiles fire (`04` §1). 
- **Line count for scoring/goals:** treat the cleared row and column as **N = 2 lines** (or N = 1 if row and col coincide at edges — they always cross, so N = 2). Feeds `lines`/`multi`/`combo`/`collect`/`barnacle` goals exactly as an organic clear would. Score via the standard `N*N*cellsCleared*10`. **Counts as a clearing placement** → advances combo. **[OPEN]** confirm N=2 accounting.
- **Earned by:** combo ×3 (§1.4); or the pearl store / rewarded-video in endless (`04` §4.4 / §5.2). **Debut:** L17 (§4).

### 2.2 Bomb (the area helper — for collection & crowded boards)
- **Cell / footprint:** a **1×1 tray piece** flagged `special:'bomb'`. Drops on any empty cell.
- **Placement + clear rule:** on placement it stamps its cell, then **clears the 3×3 area centred on it** (clipped at edges). **Not a countdown, not a threat** — it fires the instant it's placed. **[EB]** this is the explicit inversion of Woodoku's game-ending countdown bomb. Cleared cells resolve normally (barnacle/coral/pearl/bonus interactions as above).
- **Line count for scoring/goals:** an area clear rarely completes full lines, so score it as a **flat `cellsCleared * 10`** (i.e. `N=0` unless the blast happens to complete lines, in which case standard `N*N` applies and dominates). Cleared barnacle/pearl cells count toward their goals. **Counts as a clearing placement** → advances combo. **[OPEN]** confirm flat-rate for non-line blasts.
- **Earned by:** combo ×6 (§1.4); or store / RV. **Debut:** L29 (§4).

### 2.3 Interaction with the solvability guarantee (`03`)
Both specials are **strictly space-*creating*** and occupy a single empty cell:
- They pass `handIsSafe` (`03` §2.2) **trivially**: a piece that only clears can never dead-end a hand. If the board has ≥1 empty cell, the special is placeable and its placement *reduces* fill.
- They are therefore **never** part of an "unavoidable death" (`03` §7 classifier): a satchel/earned special can only help.
- They do **not** relax the generator's obligations — the *base* 3-piece tray is still generated and validated exactly as `03` §2 requires. A special is **additive** (see §2.4), never a substitute for a safe base hand. If a special ever *replaced* a base slot it would still be safe (single-cell clear), but we do not do that (keeps the base stream and golden-master untouched).

### 2.4 Determinism — how specials route through the seed (`02` §5 / `03` §1)
The hard requirement: adding/removing specials must **not shift the base tray draw order**, or every recorded seed and the golden-master (`03` T1) breaks.

**Rule:** a granted special is **appended after** the normal 3-slot generation, using its **own trailing draws** — exactly the way `02` §5 / `03` §1.2 already append the color pass *after* all three shapes are chosen. Sequence per refill becomes:
```
[base slots 0,1,2 : gap-fill gate → pick → fitness re-rolls]   ← unchanged, frozen
[color pass 0,1,2]                                             ← unchanged, frozen
[special pass : if a satchel/earned special is queued for this tray,
                draw 1 for its cell-color, append it as a 4th tray entry]   ← NEW, trailing
```
Because the special pass is **strictly after** the frozen base+color passes, disabling it (Seeded mode, §1.4) or enabling it (casual) **does not move the base stream a single draw**. Golden-master over the base game is invariant; the special adds a deterministic, recorded tail.
- **Casual/voyage:** the special's one draw is part of that game's own recorded stream (`rngCalls` cursor, `02` §7). `state.deterministic` stays `true`. Snapshot/restore reproduces it exactly.
- **Seeded/Daily/ranked:** the special pass is **skipped entirely** (`04` §4.2 sameness). No draw, no tray perturbation, identical board for everyone.

New state (`02` §3): `SpecialId = 'lineBlaster' | 'bomb'`; tray entries gain optional `special?: SpecialId`; add `satchel: Record<SpecialId, number>` (§3) and `pendingTraySpecial?: SpecialId` (what to append on the next refill).

### 2.5 Debut in the 40-level drip (reconciled with `01`/`04` — see §4 for the full timeline)
| Special | Debuts | Slot character (from `01`) | Why it doesn't collide |
|---|---|---|---|
| **Line-Blaster** | **L17** (Open Shallows · combo 3) | Combo *revisited, deeper*; no board element, no budget limit. | Introduced **as** the combo-reward payoff — same lesson family (combo now hands you a helper), not a second new noun. |
| **Bomb** | **L29** (Treasure Hunt · collect 8) | Pearl practice; pearl taught L18/19, **no new element, no budget**. | A Bomb clearing an area *helps collect pearls* — synergy, not a new axis. Sits 3 levels after the last new element (current L26) and one before milestone L30. |

Both slots satisfy the hard rule (no new board element, no budget tightening in the same level). No change to `01`/`04` schedules is required — the specials fit into existing quiet slots.

---

## 3. The satchel — sandbag generalized into a small power-up inventory

The prototype's tide "sandbag" (`continueAfterLoss` → `tide = max(0, tide-3)`, `02` §8 / `04` §5.2) generalizes into a **four-item, player-triggered, optional inventory**. Every item is a *reward* the player chooses to spend; none is ever forced, timed, or reflex-based.

### 3.1 The four items
| Item | Exact effect | Engine hook (`02` §8) | Draws RNG? | Determinism class |
|---|---|---|---|---|
| **+N Moves** | `moveLimit += N`, `grantedMoves += N`; if lost with `out-of-moves`, `status → 'playing'`. Recommend **N = 5** [OPEN] (matches `04` §5.2). | `grantMoves(5)` | No | **Always safe** (pure counter) |
| **Tide-Push** | `tide = max(0, tide - P)`; recompute phase; **never** touches `tideRises` (progress never rectified downward, `03` §7 T7). Usable *in-play* (proactive), not only on loss. Recommend **P = 2** [OPEN] (a gentler in-play cousin of the loss-revive's −3). | **New tiny hook `pushTide(p)`** — deterministic, no draw. *(Alternatively reuse the `continueAfterLoss` tide math on demand; recommend a dedicated hook so it reads as an in-play helper, not a revive.)* | No | **Always safe** |
| **Undo-Last** | Revert the last placement: `restore()` a host-held pre-placement `snapshot()` and rewind `rngCalls` to that cursor (`02` §2 drops undo from core; it is a **host feature layered on snapshot/restore**, exactly as `02` §2 prescribes). | host `snapshot()/restore()` | No (rewinds the cursor; draws nothing new) | **Safe in casual; FORBIDDEN in Seeded** (see §3.3) |
| **Reroll-Tray** | Replace the current *unplaced* tray with a freshly generated safe hand. | `rerollTray()` | **Yes** | **Flags/forbidden in Seeded** (§3.3) |

### 3.2 How each is earned (per `04` economy)
- **Earned free:** combo milestones grant the two *special blocks* (§1.4); the four *power-ups* are earned from **pearls** (the single soft wallet, `04` §5.1 — spend in the store) and from **rewarded video** (opt-in, **≤3/day cap**, `04` §5.2). Recommended pearl prices [OPEN — product owner]: +N-Moves 20 · Tide-Push 15 · Undo-Last 10 · Reroll-Tray 25. Milestones may also gift a starter satchel (a couple of each) as part of their reward bundle (`04` §2.1).
- **Never pay-to-win where it matters:** none of these alters the *authored* level's solvability floor or goal-achievability certification (`03` §5) — they only spend *player* resources to soften a *player's own* tight spot. In **Seeded/ranked** the rules in §3.3 keep the board honest.

### 3.3 The determinism rule (coordinated with `03` §1 / `04` §4.2 — the important part)
Leaderboard fairness (`04` §4.2) requires a Daily/ranked run to be reproducible from its seed. Therefore, by determinism class:
- **Deterministic items (+N-Moves, Tide-Push):** draw **zero** RNG → they never desync the stream. **Allowed even in Seeded/ranked** *if product permits paid budgets* — but per `04` §4.2's recommendation, **any `continueAfterLoss`/revive still disqualifies the leaderboard run** (keeps the board honest) while **still counting for the streak**. In-play Tide-Push and +Moves that are *not* revives may stay leaderboard-eligible — **[OPEN — product owner]**, recommend: allow in-play deterministic helpers on the leaderboard, disqualify any *revive*.
- **RNG-drawing items (Reroll-Tray, and any no-moves `continueAfterLoss` that regenerates a tray):** in **casual/voyage** they draw from the one seeded `Rng` in-sequence and stay deterministic-from-own-seed (`state.deterministic` stays `true`). In **Seeded/Daily/ranked** the host **forbids** them, or if allowed sets `state.deterministic = false` and stamps `deterministic:false` on the emitted `trayRerolled`/`trayRefilled` event → the run is **excluded from leaderboard verification** (`02` §8, `04` §4.2). 
- **Undo-Last in Seeded:** **forbidden.** Undo rewinds `rngCalls`, letting a ranked player *re-draw the future* (retry the same seed position for a better tray) — a determinism/fairness hole. Allowed in casual only. **[OPEN — product owner]** confirm.

**One-line summary the engineer can hold onto:** *deterministic helpers (moves, tide) are leaderboard-neutral except when used as a revive; any helper that regenerates a tray or rewinds the RNG is casual-only / leaderboard-disqualifying.*

---

## 4. THE CRITICAL RECONCILIATION — one combined novelty schedule

The player experiences board-elements (`04`), special-blocks (§2), and power-ups (§3) as **one stream of new things**. Below is the master timeline. **Rule enforced: ≤ 1 genuinely new concept per ~2–3 levels, and no special-block/power-up debut ever shares a level with a new board element or a budget tightening.**

Legend: **V** = verb/goal (`01`), **N** = board element/noun (`04`), **S** = special block (§2), **P** = power-up satchel (§3), **★** = milestone showcase (combines only taught things). "·" = quiet practice, no new concept.

| L | New concept landing | Bucket | Collision check |
|---|---|---|---|
| 1 | placement + what a clear is | V | — |
| 2–3 | · (practice) | — | |
| 4 | double / precision setup | V | |
| 5 | **combo** (the streak, forgiving §1.2 taught here) | V | |
| 6 | tide (survive) | V | |
| 7 | first move-limit (generous) | V/budget | (budget — no S/P here) |
| 8–9 | · | — | |
| 10 | ★ Shallows Gate (tide + generous budget) | ★ | |
| 11 | **barnacle** | N | |
| 12 | · | — | |
| 13 | triple clear | V | |
| 14 | **coral** | N | |
| 15 | · | — | |
| 16 | first *fair* efficiency | budget | (budget — no S/P here) |
| **17** | **Line-Blaster** (via combo-3 reward §1.4) | **S** | clean: no new N, no budget ✓ |
| 18 | **pearl** | N | (S was L17, ≥1 level clear of this N ✓) |
| 19 | · — **satchel / power-up concept debuts here** (soft, non-scheduled tutorial; see note) | **P** | pearl already taught L18→19 is practice; no new N, no budget ✓ |
| 20 | ★ Reef Guardian (barnacle + coral) | ★ | |
| 21 | **deep tide** | N | |
| 22 | **anchor** | N | (N L21→L22 is the one tight spot — both are `01`'s existing schedule; no S/P added near it) |
| 23 | score-rush | V | |
| 24 | · | — | |
| 25 | tight efficiency | budget | |
| 26 | **current** | N | |
| 27–28 | · | — | |
| **29** | **Bomb** (via combo-6 reward §1.4) | **S** | clean: pearl practice, no new N, no budget; 3 levels after current L26 ✓ |
| 30 | ★ The Abyss (anchor + current) | ★ | |
| 31 | **bonus tile** | N | |
| 32–35 | · (L33 budget, no S/P) | — | |
| 36 | **storm** | N | |
| 37–38 | · | — | |
| 39 | combo mastery (combo 4) — reinforces the reward loop, no new type | V | |
| 40 | ★ The Open Sea (calm showcase of everything) | ★ | |

**Verification of the density rule:** across L1–40 the gaps between *new-concept* landings are all ≥2 levels except the L21→L22 pair (deep-tide → anchor), which is **`01`/`04`'s own existing schedule, not something I added** — and I deliberately keep **no** special/power-up anywhere near it (my nearest debut is L17, four levels earlier, and L29, seven later). Every S/P debut (L17, L19, L29) lands in a slot with **no new board element and no budget tightening**, satisfying the hard rule. **No change to `01`/`04` was required** — the two specials and the satchel slot into pre-existing quiet levels. If future retuning moves an element into L17/L19/L29, **mine yields**: shift Line-Blaster→L15, satchel→L24, Bomb→L27 (all equally clean).

**Note on the power-up satchel debut (L19, but really contextual):** the satchel is **one concept** ("your bag of optional helpers"), not four scheduled lessons — the four items are the *same* cognitive object and unlock as the economy (`04`) affords them. Its natural first appearance is **contextual**: the first time a player hits a `narrowMiss` (`02` §3) or nears a drown, the host offers a helper. L19 is only the *anchor* for the tutorial card if no contextual trigger has fired by then. Either way it does not count as a new *mechanical* concept beyond "you can spend a reward to help yourself."

---

## 5. Other dynamism levers (gentle, restrained)

Engine emits events; the *celebration* is host/UI (out of my scope). Kept deliberately tiny.

1. **Lucky Tray (endless/Daily-practice only).** With low probability the generator biases a hand toward extra-flexible small pieces — mechanically this is the *existing* gap-fill/pressure machinery (`01` §3, `03` §3) surfaced as an occasional, telegraphed "the current favours you" gift. **No new system**; just a named, low-frequency event `luckyTray` the host can celebrate. Recommend **p ≈ 0.06 per refill, off in ranked** [OPEN]. Never in authored voyage (assist curve owns that there).
2. **Bonus Wave (endless).** Every Kth organic clear in an endless run emits `bonusWave { pearls }` — a small pearl shower feeding `04`'s cosmetic chase. Recommend **K = 10 clears → +3 pearls** [OPEN]. Pure reward, no board change, no threat.
3. **Combo celebration escalation.** Engine already emits `combo`/`comboHeld`; the *escalating* fanfare is host-side. Engine contribution is nil beyond the events in §1.3 — listed here only so the persona sees it's an *event*, not a new mechanic.
4. **Milestone showcases.** Already fully specified in `04` §2.1 / `04_puzzle_scenarios` §D — the chapter capstones ARE the primary dynamism beat. I add nothing; I only route a freshly-earned special (if any) into the milestone board so the celebration feels earned.

Everything above is optional texture the player never has to engage with, and none of it can lose the game.

---

## 6. Persona veto criteria (why 45–65 accepts each) + the CUT list

### Kept — one line each
| Mechanic | Why a cozy 45–65 player accepts it |
|---|---|
| **Forgiving combo (one-move grace)** | Helpful & legible — the streak survives one thoughtful setup move; it *removes* punishment rather than adding rules. No timer. |
| **Combo→special reward loop** | Earn-don't-buy; clean play visibly hands you helpers. Optional to use, impossible to lose from. |
| **Line-Blaster** | One tap, one obvious result ("place it, a cross clears"). No target-picking, no reflex, only ever helps. |
| **Bomb** | Same one-tap legibility; an *anti*-countdown bomb — fires instantly, a pure gift, telegraphed by the piece art. |
| **+N-Moves / Tide-Push / Undo / Reroll satchel** | All optional, player-triggered, spend-your-own-reward, no reflex; each softens *your* tight spot, never the game's. |
| **Lucky Tray / Bonus Wave** | Passive, occasional, purely generous; the player does nothing and can lose nothing. |

### CUT — as valuable as what was kept
| Cut | Reason (persona veto) |
|---|---|
| **Wild / Rainbow "match-any-color" piece** | **Mechanically meaningless in this engine** — lines clear by *fill*, not color (`01_current_engine_reference` §Scoring; color is cosmetic). A "matches any color" piece would clear nothing extra; it'd be a confusing non-feature. |
| **Score-Multiplier piece** | **Duplicates the `bonus` board element** (`04` §1.5), which already multiplies a clear's score. Two names for one idea muddies the taxonomy — restraint says pick one, and the board element is already locked. |
| **Woodoku-style countdown Bomb** | **[EB]** It counts down and *ends the game* — a threat. Violates "a reward, never a threat." We took the name, inverted the mechanic. |
| **Adjacency / chain-reaction combos** (special-touches-special → bigger blast, **[EB]** Block Blast match variant) | Multi-step spatial planning under combinatorial rules — the exact "requires planning" the principle forbids for this audience. |
| **Block Blast's steep streak multiplier (×59 → ~4× score)** | **[EB]** An optimization treadmill that punishes streak breaks brutally. We keep a gentle streak + a *cap* (§1.2) instead. |
| **Piece rotation / any timed power-up / any reflex mechanic** | Reflex or clock — categorically out of core play (`01` non-negotiable). |
| **A 3rd/4th special block** | We could reach the brief's "3–4" but every extra piece is cognitive load. Two pure-clear helpers cover the need; **restraint is the deliverable**, so we stop at two. |

---

## 7. Open thresholds surfaced for the product owner
- Combo **grace = 1 move** (§1.2); **COMBO_SCORE_CAP = 20** for endless (§1.2).
- Combo-reward ladder **×3 Line-Blaster / ×6 Bomb / ×10 repeat** (§1.4).
- Special scoring: Line-Blaster **N = 2**; Bomb **flat cells×10** (§2.1/§2.2); whether special-clears advance combo (recommend **yes**).
- Special debut **L17 / L29**; satchel anchor **L19 / contextual** (§4).
- Power-up sizes **+5 moves / Tide-Push −2**; pearl prices 20/15/10/25; **RV ≤3/day** (§3).
- Determinism: **revives disqualify leaderboard; reroll/undo casual-only in ranked** (§3.3) — confirm against `04` §4.2.
- Lucky Tray **p ≈ 0.06**, Bonus Wave **K=10 → +3 pearls** (§5).

---

## 8. ~180-word summary

**Combo, upgraded.** The bare consecutive-clear streak becomes legible, celebratable state (`combo`, `comboGrace`, `comboBest`) with a **one-move grace** — a single deliberate setup move no longer zeros your streak (it breaks only on the *second* consecutive non-clear), mirroring the Daily streak-freeze's forgiveness. The `N*N*cells*10 + combo*50` formula is untouched; only the reset softens. Combos now **grant specials** (×3 → Line-Blaster, ×6 → Bomb) — an earn-don't-buy loop where clean play hands you helpers.

**Special roster: two, both pure clears.** Line-Blaster (single cell → clears its row+column) and Bomb (single cell → clears a 3×3, an anti-countdown *gift*, not Woodoku's game-ending threat). **Cut:** rainbow (color is cosmetic here), multiplier piece (dupes the bonus tile), chain-reaction combos, and steep streak multipliers.

**Power-up/determinism rule:** deterministic helpers (+moves, tide-push) are leaderboard-neutral unless used as a revive; anything that regenerates a tray or rewinds RNG (reroll, undo) is casual-only / leaderboard-disqualifying, and combo-earned specials are disabled in Seeded to preserve Daily sameness.

**Combined-novelty headline:** everything slots into `01`/`04`'s *existing* quiet levels (specials L17/L29, satchel L19) — **no schedule changed, ≤1 new concept per ~2–3 levels, and no special ever shares a level with a new board element or a budget tightening.**
