# 06 · Persona Review — the Casual-Player UX Advocate

**Reviewer:** Casual-Player UX Researcher / Persona Advocate (VETO power).
**I am one person:** the 45–65 sofa-casual who makes *Fishdom / Wordscapes / Solitaire Grand Harvest* top-grossing. I want calm, steady wins, a tidy board, gentle novelty. I churn the instant a game feels like a reflex test, a boss wall, an unfair death, or "the game screwed me."
**Scope:** engine/gameplay logic only. I judge whether the *rules and what-is-shown* read calmly for her, not visual styling.
**Sources read:** `01`, `05`, `04`, `03`, `02` (skim), and persona `03_progression_and_onboarding.md` §A/§D.

---

## 1. Verdict table

| System | Verdict | One-line reason, in HER voice |
|---|---|---|
| **Ch1 onboarding (L1–10)** | **PASS** | "I won five times before anything got hard — I feel clever, not tested." One verb per level, first budget deferred to L7 with +3 slack (`01` §2). |
| **Assist-fade curve** | **PASS** | "It quietly hands me the piece I need but I still feel like *I* did it." The skip-if-finisher-exists + cooldown + 40% cap (`01` §3d) is exactly right — invisible help. |
| **Move budgets** | **PASS** | "There's always a comfortable number of moves." Every authored slack is +2 to +5, never ≤0 (`01` §2). L10 budget 12 not 8 — correct call, a milestone must feel like a victory lap (`01` §1 deviation note). |
| **barnacle** (L11) | **PASS** | "A stuck block I clear by finishing its line — like Fishdom. Tidy and obvious." |
| **coral / 2-hit** (L14) | **REVISE** | "I filled the whole line and it *didn't clear* — did the game cheat me?" The `hits:1` coral leaving its line un-clearable until a crossing line strikes it (`04` §1.2) is a genuine "screwed me" confusion. Needs a loud crack telegraph AND a check that she doesn't read a full-looking-but-un-clearing line as a bug. |
| **pearl / collect** (L18) | **PASS** | "I'm gathering treasure — cozy, exactly what I play these games for." On-brand collection. |
| **anchor** (L22) | **PASS (conditional)** | "Part of my board is temporarily off-limits — fine, as long as I can *see* when it frees up." Needs a visible unlock countdown; K=5, max 1 column (`04` §1.4) keeps it fair. |
| **deep tide** (L21) | **REVISE** | "The water suddenly climbs *faster* the moment a new chapter opens — this got hard." A 1.35× rate jump at L21 (`01` §5) is a difficulty spike wearing a noun's costume. Step it in gentler (see §5). |
| **current / drift** (L26) | **VETO (drift variant)** | "The game *moved my piece after I placed it*." This is the single most churn-inducing mechanic in the whole design. `04` §1.6 itself flags it and asks me to rule: **I veto drift-placed-pieces.** Ship tray-bias only — and if it's invisible tray-bias, don't tutorialize it as a "thing." Strong CUT candidate (see §4). |
| **bonus / multiplier tile** (L31) | **PASS** | "A tile that makes a clear count double — a happy surprise, never a threat." Pure reward (`04` §1.5). |
| **storm** (L36) | **REVISE → CUT candidate** | "Every few turns the game *dumps blocks on my tidy board* — it's undoing my work." Turn-timed `fillCells` (`04` §1.7) is the most threat-like, most anti-tidy element, and it's the *last* one, so cutting costs almost nothing. At minimum, kill `fillCells`; keep only a gentle tide bump on survive levels. |
| **combos (+ grace + reward loop)** | **PASS (strong)** | "One thoughtful setup move no longer wrecks my streak — the game is on my side." The one-move grace (`05` §1.2) is the best cozy affordance here. Earn-don't-buy specials (`05` §1.4) are optional and can only help. Keep exactly as written. |
| **Line-Blaster** (L17) | **PASS** | "One tap, a cross clears, no aiming, no timing — a gift." (`05` §2.1) |
| **Bomb** (L29) | **PASS** | "It clears a little area the instant I drop it — the *opposite* of a scary countdown." (`05` §2.2) |
| **power-up satchel (4 items)** | **REVISE** | "A helper bag is nice, but four different tools I have to understand is a lot." The *concept* passes; four simultaneous items at L19 is at/over my ceiling. Trim and stagger (see §5). |
| **tide (standard survive)** | **PASS** | "The water rises slowly, clears push it back, and my progress never gets taken away." (`01` §5, `03` §5.1 self-guaranteeing.) |
| **milestone showcases (L10/20/30/40)** | **PASS (affirm)** | "Every ten levels there's a real *moment* — a calm win, a reward, the map opening up." Kindest assist floor, ≥80% first-try / ≥95% two-try (`01` §4), combine-only-taught (`04` §2.1). This is my favorite beat. |
| **HUD Objective + Constraint model** | **PASS (conditional)** | "Usually one calm goal to look at; sometimes a second number." Acceptable *because* the Constraint chip is absent on most levels — but it must **never read as a countdown clock** (see §5). |

---

## 2. The un-losable-start check

**CONFIRMED: L1–3 are effectively impossible to fail, and competence lands well before any challenge.**

Specifics:
- **No loss surface exists in L1–3.** No move limit (`moveLimit: 0`, first budget deferred to L7 — `01` §1, persona §C), no tide (tide debuts L6), so the only remaining death is dead-ending — which **guided mode forbids.** `03` §4.3 adds, on top of the flat 1.0 solvability floor, a **rescue rule** (fill ≥ 0.72 → the next hand can clear a line) and a **fill ceiling** (~0.80), certified by the harness at **zero guided no-moves losses over ≥1e6 games** (`03` §7 T3). A guided no-moves loss is classified as a *bug*, not a legitimate loss (`03` §7 classifier). She literally cannot paint herself into a corner here.
- **Boards are fixed and hand-verified.** L1–3 are `seedPolicy: seeded:level` (`01` §6) — identical board every attempt, so un-losability is provable by hand.
- **She's handed wins early.** Gap-fill opens at 0.60 and carries teaching bumps (`01` §3a) — the "it gave me exactly what I needed" moment lands often in L1–3.
- **Targets are tiny and rising gently:** 1 line → 3 → 5, all unlimited (`01` §1).
- **Competence before challenge:** she clears lines (L1–3), learns the setup move (L4), combo (L5), meets the tide gently (L6), and only at **L7** meets her first budget — which carries **+3 slack** (`01` §2). The first real "step-up" is one deliberate, forgiving beat after five confidence-builders.

**One honest caveat:** **L6 (survive 4, tideRate 1.0) is the first level that is *technically* loss-capable** (drown at tide ≥ 8), one level before the first budget. The strict un-losable *guarantee* covers L1–3 only. L6 is very safe (gentle rate, clears push tide down 1.5 each, guided assists) but it is not a proven-zero-loss level the way L1–3 are. This is fine — but QA should confirm L6's first-try band sits at the top of the ≥92% Shallows band, not merely inside it.

---

## 3. The one-new-thing-at-a-time check

The combined novelty stream (board elements from `04` + specials + power-ups from the `05` §4 master timeline) is **mostly** well-spaced — but the spec's own claim that "gaps between new-concept landings are all ≥2 levels except L21→L22" is **false**, and there are two collisions.

**COLLISION A — L17 / L18 / L19: three new concepts in three consecutive levels.**
- L17 **Line-Blaster** (new special, S)
- L18 **pearl** (new board element, N)
- L19 **satchel / power-ups** (new concept, P)

That is special → noun → power-up on three back-to-back levels. `05` §4 defends each debut only against the *weaker* rule ("no S/P shares a level with a new element or budget tightening") and mistakes that for "≥2 levels apart." For her, right where Chapter 2 is meant to breathe, she gets three unrelated new cognitive objects in a row. **This is the collision to fix.** The spec's own fallback (Line-Blaster→L15, satchel→L24) resolves it cleanly.

**COLLISION B — L21 / L22: two "the board is working against me" nouns back to back.**
- L21 **deep tide** (water rises 35% faster, N)
- L22 **anchor** (a column locked away from me, N)

`05` §4 admits this is the "one tight spot" and blames `01`/`04`'s existing schedule. But from her chair, "the water got scarier" immediately followed by "part of my board was taken away" is two menacing ideas with no practice breath between — and it opens a chapter. It compounds with the deep-tide rate spike (§1). Needs a practice level inserted or anchor pushed one level.

Everywhere else the drip is genuinely good: barnacle L11 → coral L14 → pearl L18 each have practice buffers; Bomb L29 sits three levels clear of current L26 and one before a milestone; milestones combine only taught things.

---

## 4. Complexity ceiling — my single most important judgment

**The total mechanical surface is over her ceiling as written — not by a little.** Counting what she must actually hold in her head across 40 levels:

7 obstacle/collectible elements (barnacle, coral, pearl, anchor, current, bonus, storm) **+ deep tide as a de-facto 8th taught noun** + 2 special blocks + 4 power-ups + combo/grace/reward-loop + standard tide + **7 goal types** ≈ **~20 distinct mechanical objects.**

Much of it is optional (specials, satchel) or passive (bonus), and the drip spreads it over 40 levels, so it is not *fatal*. But the leaders she plays win on **restraint**, and `05`'s own governing principle is "when in doubt, cut it." Three things push her past comfortable, and I would cut/shrink them:

**CUT 1 — `current` (piece drift).** I vetoed the drift variant outright (§1). The safe alternative (tray-bias) is nearly invisible, which means it isn't a lesson worth a level — it's a noun that either scares her or does nothing. **Cut it as a taught element.** This also frees the L30 milestone from having to combine anchor+current; make L30 an anchor showcase, or anchor + a taught, benign element.

**CUT 2 — `storm`'s `fillCells` effect.** A recurring event that litters her tidy board is the most on-the-nose violation of "tidy board" and "a reward, never a threat." It's the last element (L36), so removing it costs one level of novelty. If storm survives at all, keep only a gentle `tideJump` on survive levels and drop board-cluttering entirely.

**CUT 3 — trim the satchel from 4 items to 2 (–3).** Four helper tools is inventory-management cognition she didn't sign up for. **Undo-Last** (mistake forgiveness — the coziest) and **+Moves** cover her real needs; **Tide-Push** can appear *only* on survive levels when relevant; **Reroll-Tray** is the most gamer-y and least needed — hold or cut it. And do **not** dump all of them at L19: introduce one helper at a time as the economy affords it (`05` §4 already gestures at this — make it a rule, not a footnote).

Net effect of these three cuts: the required-to-understand surface drops from ~15 to ~11, the two riskiest "the game screwed me" mechanics (drift, board-littering) are gone, and nothing she loves is touched.

**What I would NOT cut:** the two specials and the combo reward loop — they are pure, optional, only-help, and cheap to ignore. They don't count against her ceiling the way an obstacle she must plan around does.

---

## 5. Required changes (prioritized)

Each item = {system · problem in her words · specific fix}.

1. **`current` drift — VETO.**
   *Her words:* "The game moved my piece after I put it down — I'm out."
   *Fix:* Forbid the drift-placed-pieces representation (`04` §1.6) entirely. Ship tray-bias only, and prefer to **cut `current` as a taught element**; rework the L30 milestone to anchor-only (or anchor + a benign taught element).

2. **L17/18/19 novelty stack — space it out.**
   *Her words:* "Three brand-new things in three levels, right when it was finally relaxing."
   *Fix:* Adopt `05` §4's own fallback — **Line-Blaster → L15**, **pearl stays L18**, **satchel → L24 (or purely contextual)**. That puts every new concept ≥2 levels apart.

3. **`storm` `fillCells` — de-fang or cut.**
   *Her words:* "It keeps dumping blocks on my clean board and undoing my work."
   *Fix:* Remove the `fillCells` effect (`04` §1.7). Keep at most a gentle `tideJump` on survive levels, or cut storm — it's the last element, cheap to drop.

4. **coral 2-hit legibility — telegraph the un-clearing line.**
   *Her words:* "My line was full and nothing happened — feels broken."
   *Fix:* Require a strong visual crack/state on `hits:1` coral and confirm in playtest she reads "this needs one more pass" rather than "the game glitched" (`04` §1.2). This is a UI-behavior requirement on the logic, not styling.

5. **deep-tide rate spike — ease the on-ramp.**
   *Her words:* "The water suddenly got faster the second a new chapter started."
   *Fix:* Introduce deep tide at ~**1.20×** at L21, and reserve 1.35/1.40 for L28/L34 after she's practiced (`01` §5). Difficulty should read as "I'm getting good," not "this got hard."

6. **L21→L22 back-to-back obstacle nouns — insert a breath.**
   *Her words:* "Scary water, then a locked-away column, no break between."
   *Fix:* Insert a practice level between deep tide and anchor, or push anchor to L23 and score-rush to L24.

7. **Satchel — trim to 2 and stagger.**
   *Her words:* "Too many tools in the bag to figure out."
   *Fix:* Launch with **Undo-Last + +Moves**; surface **Tide-Push** only on survive levels; hold/cut **Reroll-Tray**. Unlock one at a time, never four at L19 (`05` §3/§4).

8. **HUD Constraint chip — must not read as a clock.**
   *Her words:* "A number ticking down in the corner makes me tense — that's when I quit."
   *Fix:* The two-readout model is fine (§1) because the Constraint chip is absent on most levels, but the moves-remaining chip must be styled/labelled as calm capacity ("moves left"), never an urgent red countdown, and moves-vs-tide must never both show at once (already specified). Keep the Objective chip visually dominant.

---

## 6. What's genuinely right (keep these)

- **The un-losable Shallows.** L1–3 provably unfailable, first budget at L7 with slack, competence before challenge (`01`, `03` §4.3). This is the whole retention bet and it's correct.
- **Invisible assists.** Skip-if-finisher-exists + cooldown + 40% cap (`01` §3d) means she gets helped *and* keeps the pride of the win. Best single design decision in the pack.
- **The one-move combo grace.** A deliberate setup move no longer zeros the streak (`05` §1.2). It rewards exactly the calm, thoughtful play she brings. Keep verbatim.
- **Earn-don't-buy specials, both pure-clear.** Line-Blaster and Bomb only ever help, one tap, no aiming, no timing, anti-countdown (`05` §2). Optional, impossible-to-lose-from — the right kind of novelty.
- **Milestone ceremonies every 10 levels.** Extra-generous, combine-only-taught, reward + map-opening (`01` §4, `04` §2.1). Her favorite beat; it lands inside a session.
- **Generous, positive-slack budgets and no clock in core play.** Difficulty rides on soft dials (target size, obstacle count), never meaner RNG or a timer (`01` §7). Exactly her contract.
- **Survive progress that can never be taken back.** `tideRises` accrues and never decreases (`03` §5.1) — no "the game rectified my progress downward" betrayal.
- **The cut list in `05` §6.** Rejecting countdown bombs, chain-reactions, rainbow pieces, and steep streak multipliers shows the right instinct. I'm simply asking it to cut two or three more.

---

## 7. ~150-word summary (go / no-go)

**Overall: conditional GO for the target player** — the calm-win spine is right, but the mechanical surface is over her comfort ceiling and two churn-risk mechanics must go before ship.

**Top 3 required changes:**
1. **VETO `current` piece-drift.** Moving her piece after she places it is the biggest "the game screwed me" risk in the design; ship tray-bias only, and cut `current` as a taught element (rework the L30 milestone accordingly).
2. **Fix the L17/18/19 stack** — Line-Blaster, pearl, and the satchel land on three consecutive levels. Move Line-Blaster→L15 and satchel→L24 so every new concept is ≥2 levels apart.
3. **Cut `storm`'s board-littering and trim the 4-item satchel to 2**, staggered — restraint is the deliverable, and both push her past overload.

Keep the un-losable Shallows, invisible assists, combo grace, pure-clear specials, and the every-10 ceremonies untouched. Do the cuts, and she stays.
