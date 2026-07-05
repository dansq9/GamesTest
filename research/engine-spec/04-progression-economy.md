# 04 · Progression, Element Rules & Post-70 Economy

> **Owner:** Live-Ops / Progression Designer.
> **Scope:** progression STRUCTURE · board-ELEMENT rules · ECONOMY / retention hooks. **No UI, no rendering, no difficulty tuning** (Systems Designer owns numeric difficulty; this doc owns what exists and how it renews).
> **Reads against:** `02-engine-architecture.md` (types: `ElementId`, `ElementSpec`, `LevelDef`, `GameEvent`, `GameState`, monetization hooks) — this doc supplies the *design content* those types carry. Grounded in handoff docs `01`/`03`/`04` and the v5 prototype (`_seedObstacles` 798, `_checkVoyageGoal` 830, `_resolveVoyageWin` 845, `_tideExtras` 615, `_offerRV` 655, `_startVoyageLevel` 766).
> Invented economy/business numbers are tagged **[OPEN — product owner]** with a recommendation.

This doc resolves two README §6 open questions: **element-roster lock** (§1) and **endless/daily economy past game ~70** (§4).

---

## 1. The locked board-element roster (`ElementSpec` data)

**Recommendation to README §6 (roster lock): SHIP ALL SEVEN, in the drip order of doc 03 §F, but split the roster into two confidence tiers.**

- **Tier A — lock now, implement in E3/E4 (5 elements):** `barnacle`, `coral2`, `pearl`, `anchor`, `bonus`. These are mechanically self-contained cell modifiers with unambiguous rules and clear fairness seeding. Two (`barnacle`, `pearl`) already ship in the prototype.
- **Tier B — lock the interface, gate the content behind a sim pass (2 elements):** `current` (drift) and `storm` (turn-timed event). Both mutate the board *outside* a placement, so they carry the highest risk to the "no unavoidable death" non-negotiable (§4.1 of README). Implement them behind the same `ElementSpec` interface, but do **not** author them into a live level until the headless bot proves the solvability floor holds with them present (doc 04 §E). They debut latest anyway (L26, L36), so this costs no schedule.

All seven are **data-driven cell modifiers** seeded by `count` (and optional `params`) on `LevelDef.elements: ElementSpec[]`. They live in the parallel `state.elements` 8×8 layer (`02` §3); a `barnacle`/`coral2` also occupies the `board` cell, a `pearl`/`bonus`/`anchor`-mark is element-layer-only over an (initially) empty cell.

### 1.0 Shared fairness-seeding contract (extends `_seedObstacles`)

The prototype's `freeCell` spreads obstacles so **no line is pre-loaded near completion** via `rowCount[r] < 2 && colCount[c] < 2` (line 807). Generalize this to a single seeder all elements pass through:

```
seedElements(board, level, rng):
  perRow[8]=0, perCol[8]=0
  for spec in level.elements (seed in this fixed order: barnacle, coral2, anchor, bonus, pearl, current, storm):
    for i in 0..spec.count-1:
      cell = freeCell(spec, rng)           // draws via injected rng ONLY (determinism, 01 §RNG)
      if !cell: break
      apply spec.kind to board/elements at cell
      perRow[cell.r]++; perCol[cell.c]++

freeCell(spec, rng): reject a candidate (r,c) if ANY of:
  - board[r][c] or elements[r][c] already occupied
  - perRow[r] >= MAX_PER_LINE  or perCol[c] >= MAX_PER_LINE     // MAX_PER_LINE = 2 (prototype)
  - would leave any row/col with <2 empty cells at spawn   // NEW: guarantees no line is ≥6/8 pre-filled
  - spec-specific rejections (below)
  give up after 200 attempts (prototype bound) → seed fewer than requested (never crash)
```

The **`<2 empty cells` rule is the key extension**: it formalizes "never hand a free clear at spawn" as an invariant, not just a spread heuristic. It is checked against `board`-occupying elements (barnacle, coral2) only; pearls/bonus don't fill the cell so they don't count toward the pre-fill.

Each element below gives: **cell representation · placement interaction · line-clear interaction · win/loss/score effect · fairness rejection.** Precise enough to implement as a cell modifier with no further design.

---

### 1.1 `barnacle` — fixed blocker (Tier A · intro L11 · family: obstacle)
- **Cell:** occupies `board[r][c] = { color:'barnacle', element:'barnacle' }` AND `elements[r][c]='barnacle'`. Rendered as a filled block by UI; to the engine it is a filled cell.
- **Placement:** blocks placement like any filled cell (`canPlace` already treats a non-null board cell as blocked). No special case.
- **Line-clear:** counts toward its row/col fill exactly like a player block. When that line clears, the barnacle cell is removed and `barnaclesRemoved++`; emit `barnacleRemoved`. (Prototype 1345.)
- **Win/loss/score:** feeds the `barnacle` goal (`goalProgress = barnaclesRemoved`). Cleared barnacle cells count in `cellsCleared`, so they contribute to the standard `N*N*cellsCleared*10` score. No extra bonus.
- **Fairness rejection:** none beyond shared contract. Because it pre-fills a cell, it is subject to the `<2 empty cells per line` rule.

### 1.2 `coral2` — 2-hit blocker (Tier A · intro L14 · family: obstacle)
- **Cell:** `board[r][c] = { color:'coral2', element:'coral2', hits:2 }`, `elements[r][c]='coral2'`. `hits` is the remaining strikes (starts 2).
- **Placement:** blocks placement like a filled cell while `hits>0`.
- **Line-clear:** a line clear passing through it is a **strike**: `hits--`. On the *first* strike the coral is NOT removed and does NOT vacate its cell — the surrounding player/barnacle cells in that line clear normally, but the coral cell stays filled with `hits:1` (emit `coralHit {remaining:1}`). Only when `hits` reaches 0 does the cell clear and count in `cellsCleared` (emit `coralHit {remaining:0}` → then it participates in that clear's removal). **Design note for engineer:** because a downgraded coral remains filled, a line containing a `hits:1` coral is NOT "fully filled" the first time — it will not itself trigger a clear until the coral is gone; the strike happens because a *crossing* line (the perpendicular one) cleared. This is the intended "slows a region" feel.
- **Win/loss/score:** feeds the `barnacle`/collection-family goal only if a level defines it (default: `coral2` is a soft blocker with no goal). Final-strike removal counts in `cellsCleared` for score.
- **Fairness rejection:** treat a `hits:2` coral as **1.5 pre-filled cells** when applying the `<2 empty per line` rule (it is harder to clear, so seed it more sparsely). Never seed two corals in the same line. **[OPEN — product owner]:** whether a downgraded (`hits:1`) coral should visually recolor — UI concern, engine just carries `hits`.

### 1.3 `pearl` — collectible (Tier A · intro L18 · family: collectible)
- **Cell:** element-layer only: `elements[r][c]='pearl'` over an **empty** `board` cell. Does NOT block placement.
- **Placement:** the player places a piece over the pearl cell, filling `board[r][c]`. The pearl marker stays in `elements`.
- **Line-clear:** when the line containing the covered pearl clears, the pearl is collected: `pearlsCollected++`, clear the element marker, emit `pearlCollected`. (Prototype 1345.) An uncovered pearl (line never completed) is simply never collected — no penalty.
- **Win/loss/score:** feeds the `collect` goal (`goalProgress = pearlsCollected`). **Also increments soft-currency `pearls`** in the prototype (line 1353) — see §5 economy note (pearls-in-level vs. wallet pearls must be reconciled). No score multiplier.
- **Fairness rejection:** `freeCell(pearlSafe=true)` — a pearl must sit on a cell that is **reachable**: reject if placing over it can never complete a line (e.g. its row AND col each already hold a barnacle/coral that will not clear). Subject to the spread rule but NOT the pre-fill rule (it doesn't fill a cell).

### 1.4 `anchor` — locked column / cells (Tier A · intro L22 · family: obstacle)
- **Cell:** element-layer marker `elements[r][c]='anchor'` on cells that are **locked from placement** for a duration. `params`: `{ span:'column'|'cell', turns:K }`. If `span:'column'`, seed marks the whole column c; if `'cell'`, individual cells.
- **Placement:** a locked cell rejects placement (engine: `canPlace` also checks `elements[r][c]!=='anchor' || anchorExpired`). Forces play elsewhere.
- **Line-clear:** a locked cell cannot be filled, so its line cannot complete while locked — this is the intended pressure. When the lock expires (after `K` placements since seeding, tracked by a per-anchor `unlockTurn = seedTurn + K`), the cell becomes a normal empty cell; emit `elementEvent {element:'anchor', detail:{unlocked:[...cells]}}`. **[OPEN — product owner]:** unlock trigger — recommend **turn-count `K` (default K=5)** over "until a condition" for determinism and predictability; a condition-based unlock is harder to telegraph to a 45–65 player.
- **Win/loss/score:** none directly. It is a spatial constraint only.
- **Fairness rejection:** **never lock a full row or the whole board's placement capacity.** Rejection rule: after seeding all anchors, the board must still have a legal placement for the smallest piece (a `dot`) — assert `hasAnyMove` over unlocked cells at spawn. Never lock more than 1 column at once (`MAX_ANCHOR_COLUMNS = 1`). This keeps the no-unavoidable-death floor intact.

### 1.5 `bonus` — multiplier tile (Tier A · intro L31 · family: reward)
- **Cell:** element-layer marker `elements[r][c]='bonus'` over an empty cell (like a pearl, but a reward not a collectible). `params`: `{ mult:2 }` (default). Does NOT block placement.
- **Placement:** player fills over it normally.
- **Line-clear:** when a line through the covered bonus clears, **that placement's clear points are multiplied by `mult`** before adding combo bonus: `pts = (N*N*cellsCleared*10) * mult; pts += combo*50`. If a single placement clears multiple lines each covering a bonus, multipliers **stack multiplicatively** (`mult^k`) — **[OPEN — product owner]:** recommend cap at ×4 total to avoid runaway scores that break leaderboard bands. Emit `elementEvent {element:'bonus', detail:{mult, points}}`. Clear the marker after use.
- **Win/loss/score:** score only; feeds `score` goal faster. Never a threat (doc 04 §B: "a reward, not a threat").
- **Fairness rejection:** spread rule only; never place a bonus on a cell that can't complete a line (same reachability check as pearl). It is beneficial, so no pre-fill concern.

### 1.6 `current` — piece drift (Tier B · intro L26 · family: modifier)
- **Cell:** NOT a cell modifier in the usual sense — it is a **board-level modifier** seeded as a single `elements`-layer sentinel or a level flag `params:{ dir:'left'|'right'|'down', strength:1 }`. Recommend representing as `level.elements:[{kind:'current', count:1, params:{dir,strength}}]` and storing on `state` as `currentDir`.
- **Placement:** after a piece is placed and BEFORE line-clear resolution, the just-placed block-group drifts `strength` cells in `dir` **if and only if every drifted cell is empty and in-bounds**; otherwise it does not drift (drift never overwrites, never pushes off-board). Emit `elementEvent {element:'current', detail:{from,to}}`. **Alternative, lower-risk representation:** bias the *tray generator* toward pieces that fit the drifted side rather than moving placed pieces — this keeps placement WYSIWYG for the older player. **[OPEN — product owner]:** recommend the **tray-bias variant** for the 45–65 audience (moving a piece after they place it can read as "the game took my move"); the UX Researcher should veto/confirm. Ship whichever behind the same flag.
- **Line-clear:** unchanged; clears resolve on the post-drift board.
- **Win/loss/score:** none directly; it is texture/novelty.
- **Fairness rejection:** because drift can only move into empty in-bounds cells and no-ops otherwise, it **cannot create an unavoidable death by itself** — but the bot MUST prove this per level before it goes live (Tier B gate). Never combine `current` with `anchor` in the same non-milestone level (doc 04 §C: two elements only combine at milestones).

### 1.7 `storm` — turn-timed event (Tier B · intro L36 · family: event)
- **Cell:** not seeded as a cell; seeded as a **scheduled event**: `level.elements:[{kind:'storm', count:1, params:{ everyTurns:8, effect:'fillCells'|'tideJump', magnitude:3 }}]`. Stored as `state.stormNextTurn`.
- **Placement:** on the placement where `turns == stormNextTurn`, AFTER clears resolve, the storm fires: `fillCells` fills `magnitude` **currently-empty, spread** cells with barnacle-like temporary blocks (or `tideJump` adds `magnitude*0.5` to tide, respecting the tide loss rule). Reschedule `stormNextTurn += everyTurns`. It is **telegraphed** (emit `elementEvent {element:'storm', detail:{firesInTurns}}` one turn ahead) and **always survivable**.
- **Line-clear:** storm-filled cells behave as barnacles (clear with their line). `tideJump` interacts with the normal tide/clear math.
- **Win/loss/score:** can push toward a `survive` loss via tide but never instantly: **rejection guarantee** — a storm may never fire a `fillCells` that would leave `!hasAnyMove`, and may never fire a `tideJump` that alone crosses `tide>=8` (cap its contribution so `tide` lands at most at `7.5`). Emit event either way.
- **Fairness rejection:** the fill targets go through `freeCell` (spread, no line pre-loaded). Storm is the highest-risk element → **hard Tier B gate:** ships only after the sim proves 0 unavoidable deaths across N thousand storm-level runs (doc 04 §E).

**Roster lock summary for README §6:** `barnacle, coral2, pearl, anchor, bonus` locked as final content; `current, storm` locked as interface, content-gated on a simulation pass. All seven implement the one `ElementSpec` + `seedElements` contract above.

---

## 2. The 5-chapter / 100-game arc (formalized)

Chapters group `LevelDef`s and set a **default fairness mode** (`LevelDef.mode`; doc 02 §A Guided/Fair/Seeded). Milestones are `milestone:true` levels — **showcases winnable 1st–2nd try** (doc 04 §D), never bosses.

| Chapter id | Name | Levels | Default `mode` | Character (doc 03 §E) |
|---|---|---|---|---|
| `shallows` | The Shallows | 1–10 | `guided` | Onboarding funnel; ≥90% first-try win target. One concept/level; first moveLimit at L7. |
| `reef` | The Reef | 11–20 | `fair` | Assists fade; nouns begin (barnacle, coral, pearls); triple clears. |
| `deep` | The Deep | 21–30 | `fair` | Faster tide, anchors, currents, score rush; budgets tighten. |
| `openwater` | Open Water | 31–40 | `fair` | Mastery; multiplier tiles, storms; near-pure generation. |
| `endless` | Endless + Daily | 70–100+ | `seeded`/mixed | Authored levels give way to renewable systems (§4). |

> Note the arc has **40 authored levels** (`shallows`→`openwater`, L1–L40) and then the renewable `endless` band. Doc 03 §E labels the map ranges by *game count* (1–10, 10–25, 25–45, 45–70, 70–100+) — i.e. a player reaches ~game 45–70 by *replaying/starring* the 40 authored maps and doing Dailies, not by 70 unique authored levels. **The engine ships 40 `LevelDef`s + the endless/daily systems**; "games 41–70" are re-plays, Dailies, and stars, not new authored content. This reconciles doc 03 §F (40 maps) with doc 03 §E (100 games).

**Chapter 1 level table** is fully specified in doc 03 §C (First Steps → Tight Quarters); the engineer transcribes it into `LEVELS[0..9]` with `mode:'guided'`, `moveLimit` only on L7 (`4 lines / 8 moves`) and L10 (`5 lines / 8 moves`, `milestone:true`). Quantifying each `moveLimit` is the Systems Designer's job (README §6); this doc only fixes *which* levels carry one.

### 2.1 Milestone definitions (L10 / L20 / L30 / L40)

Each milestone `LevelDef` sets `milestone:true` → engine applies (a) the kindest assist/solvability floor (doc 04 §D.4) and (b) a **chapter-complete resolution** that emits `won` carrying `rewards:Reward[]` + the next-chapter pointer via `nextName`. Milestones **combine only already-taught elements** (doc 04 §D.3), never introduce.

| Milestone | Level | Combines (taught, no new) | `rewards` (Reward[]) | Unlocks | Next-chapter pointer (`nextName`) |
|---|---|---|---|---|---|
| **The Shallows Gate** | L10 | tide + very generous move budget | `[{pearls:30}, {palette:'reef'}, {chapterUnlock:'reef'}]` | The Reef · first palette | "The Reef — Barnacle Bay" (L11) |
| **The Reef Guardian** | L20 | barnacle + coral2 (tide gentle) | `[{pearls:40}, {backdrop:'reef_deep'}, {chapterUnlock:'deep'}]` | backdrop · pearl bonus | "The Deep — Anchor's Rest" (L21) |
| **The Abyss** | L30 | anchor + current (generously solvable) | `[{pearls:50}, {palette:'abyss_rare'}, {title:'deep_diver'}, {chapterUnlock:'openwater'}]` | rare palette · Deep-diver badge | "Open Water — Bonus Shoals" (L31) |
| **The Open Sea** | L40 | calm showcase of everything | `[{pearls:75}, {title:'voyager'}, {chapterUnlock:'endless'}]` + **Endless-mode key** | "Voyager" title · Endless key | "Daily Tide" (renewable, §4) |

Reward `pearls` amounts above are **[OPEN — product owner]** (recommend escalating 30/40/50/75; the prototype pays 30/20/10 by stars per normal level, `_resolveVoyageWin` 875 — milestones pay a *flat chapter bonus on top of* the star reward). `stars` still resolve normally (`_resolveVoyageWin`); milestone reward is additive, not star-gated (README §4.4: stars never gate).

**Star resolution** stays exactly as prototype `_resolveVoyageWin` (845): move-limited → by moves-used %; survive → margin over target; score → score/turn; else → remaining board fill. Pearl-per-star 30/20/10 preserved for normal levels.

---

## 3. Feature-gating by progress

Each gate is a boolean the engine derives from `state.gamesPlayed` / max level reached / `chapterUnlock` rewards granted, exposed as read-only flags on a `progression` view. Format: `unlock: <feature> at <condition>`.

```
unlock: retry_prompt        at always            // narrowMiss event drives instant retry (doc 03 §D.2); no gate
unlock: next_level_name     at always            // 'won' event carries nextName (doc 03 §D.3)
unlock: daily_tide          at maxLevelCleared >= 5     // surface Daily Tide + streak AFTER L5 (doc 03 §C.5, §D.4)
unlock: streak_system       at daily_tide         // streak state activates with Daily Tide
unlock: barnacle_element    at chapterUnlock:'reef'      // element content gated to its chapter
unlock: coral_element       at maxLevelCleared >= 14
unlock: pearl_collection    at maxLevelCleared >= 18
unlock: leaderboard_daily   at chapterUnlock:'reef'   // recommend expose with first seeded daily [OPEN]
unlock: anchor_element      at chapterUnlock:'deep'
unlock: current_element     at maxLevelCleared >= 26   // Tier B: also requires sim-pass build flag
unlock: bonus_tiles         at chapterUnlock:'openwater'
unlock: storm_element       at maxLevelCleared >= 36    // Tier B: also requires sim-pass build flag
unlock: endless_mode        at chapterUnlock:'endless'  // the L40 "Endless key" (doc 04 §D)
unlock: weekly_challenge    at chapterUnlock:'endless'  // renewable events come online with Ch5 [OPEN — could open earlier]
```

Governing flag: a single `unlocks: Record<string,boolean>` map recomputed on `won`/`newGame` from `gamesPlayed`, `maxLevelCleared`, and the set of granted `chapterUnlock` reward ids. Persisted in `SerializedGame` (mirrors prototype `localStorage` unlock flags, `_checkUnlocks` 892). Element gates are belt-and-suspenders: a `LevelDef` only *contains* an element once its chapter is authored, so the gate mainly governs when tutorial cards / economy surfaces appear (UI concern) — engine exposes the flag, does not render.

**[OPEN — product owner]:** the two Tier-B element gates (`current`, `storm`) additionally AND with a compile-time `FEATURES.stormsLive` flag so content can ship dark until the sim pass clears them.

---

## 4. The post-game-70 renewable economy (highest-value section)

**Resolves README §6 "endless/daily economy."** Authored difficulty stops scaling at L40; retention past ~game 70 rides **self-renewing systems**. Four systems, each specified as **engine state + events + hooks** so the host/UI can layer on with zero engine rework. The prototype already ships the seeds of all four (`_tideExtras` streaks/chests 615, daily seed `_seedFromDate` 107/01, palettes/backdrops unlock system, `rt_tideResult`).

### 4.1 Daily Tide + streaks (the habit spine)

- **Definition of a "streak":** consecutive UTC days on which the player **completes the scored Daily Tide** (not the practice variant). Prototype `_tideExtras` (615) is the exact contract to lift:
  - increment when `lastDailyDate === yesterday` (or first ever, `''`);
  - **no change** if already completed today;
  - **forgive** one gap if `lastDailyDate === dayBefore` AND a **streak-freeze** token is held (`rt_freeze`), consuming it (line 628) — this is the single "life" that keeps a 45–65 player from feeling punished for one missed evening;
  - otherwise **reset to 1**, recording the broken streak for a gentle "you had N days" nudge (line 632).
- **What breaks it:** two consecutive missed days with no freeze token. **What forgives it:** exactly one missed day if a freeze token is banked.
- **Engine state:** `streakCount:number`, `lastDailyCompletedDate:string(UTC yyyy-mm-dd)`, `freezeTokens:number`, `dailyResultToday?:{seed,score,stars,lines,maxTide,drowned,continued}`.
- **Events:** `dailyCompleted { seed, score, stars, lines }`; `streakChanged { count, delta, forgiven:boolean }`; `streakBroken { was }`; `streakChestEarned { day, pearls }`.
- **Streak chests:** milestone chests at days **3 / 7 / 14 / 30 → 75 / 150 / 300 / 600 pearls** (prototype `chests` map, line 639), each grantable once. **[OPEN — product owner]:** extend past 30 (recommend a repeating 30-day loop paying 600, or add 60/90/365 tiers).
- **Determinism:** the Daily board is `seed = _seedFromDate(utcDateStr)` — **date-only** so every player shares one board (README §4.2, non-negotiable). Resume mid-daily uses `_rng = mulberry32(seedFromDate(date) ^ (turns+1))` (prototype 110) — engine architecture doc §7 owns the exact resume cursor; this doc only asserts *date-only scope* for the shared daily. **[OPEN — product owner]:** confirm date-only vs. date+level for daily (recommend **date-only** for a single shared leaderboard board).

### 4.2 Leaderboards (per-daily-seed)

- **Ranked unit:** results on **one Daily seed** (the date's shared board). Because the board is identical for everyone (§4.1), score is a fair comparison — this is *why* the daily is seeded.
- **What's ranked:** primary key **score**, tiebreak **fewer turns**, then **higher `tideRises` survived** (all already in `state`). A run is **leaderboard-eligible only if `state.deterministic === true`** — any non-seeded reroll/continue sets `deterministic=false` (arch doc §8) and **excludes** the run. Continues that draw no RNG (a pure tide-sandbag, `grantMoves`) may stay eligible **[OPEN — product owner]:** recommend **any `continueAfterLoss` disqualifies** the leaderboard run (keeps the board honest) while still counting for the streak.
- **Engine state:** none new required beyond `seed`, `score`, `turns`, `tideRises`, `deterministic`. Submission is host-side; engine just guarantees the numbers are reproducible from the seed.
- **Events:** the existing `dailyCompleted` event carries `{seed, score, stars}` — the host posts it to whatever backend. Engine emits, does not network.
- **[OPEN — product owner / business]:** leaderboard scope (global / friends / regional / cohort) and backend are a **product+infra decision** — the 45–65 audience often prefers **small friend/cohort boards over global** (less intimidating). Engine is backend-agnostic; it only promises a verifiable score.

### 4.3 Rotating weekly challenges

- **Definition:** a time-boxed authored *scenario* (goal × target × elements × mode, doc 04 §C) seeded from a **week key** `seed = _seedFromDate('W' + isoWeek)` so all players share it, rotating every 7 days. It reuses the entire `LevelDef` + `seedElements` machinery — a weekly is just a `LevelDef` with `chapter:'endless'`, `mode:'seeded'`, and a `weekKey`.
- **Engine state:** `weeklyKey:string`, `weeklyBestScore:number`, `weeklyCompleted:boolean`, `weeklyProgress` (reuse `goalProgress`).
- **Events:** `weeklyCompleted { weekKey, score, stars }`; `weeklyRolled { newWeekKey }` (fires when the host advances the week and calls `newGame` with the new key).
- **Content source:** a **rotation pool** of ~8–12 pre-authored weekly `LevelDef` templates the engine cycles by `isoWeek % pool.length` — deterministic, no live-ops server needed to ship. **[OPEN — product owner]:** whether weeklies pay pearls, cosmetic-only, or a unique weekly-cosmetic chase (recommend a **weekly cosmetic + small pearl** to feed §4.4 without inflating the pearl economy).

### 4.4 Unlock / collection chases (palettes · backdrops · titles)

- **Definition:** the long-tail completionist hook — cosmetic **palettes, backdrops, titles** already exist in the prototype (`_palettes`, `activePalette`, `_applyPalette` 496; milestone palette/backdrop/title rewards, §2.1). Post-70 they become the primary *spend sink* and *chase*.
- **Two acquisition rails:**
  1. **Milestone/authored grants** (fixed): the `Reward{kind:'palette'|'backdrop'|'title'}` from milestones (§2.1) and the Endless key.
  2. **Renewable grants** (the post-70 engine): streak-chest pearls (§4.1) and weekly cosmetics (§4.3) → spent in a **pearl store** on rotating cosmetics. This turns the *earned pearl* into a *chase currency*, which is what actually renews retention when authored levels run out.
- **Engine state:** `ownedCosmetics: Set<id>`, `activePalette/activeBackdrop/activeTitle`, wallet `pearls:number`. A **store catalog** `CosmeticDef[] { id, kind, pricePearls, rotation? }` (static data + optional weekly rotation slot).
- **Events:** `cosmeticUnlocked { id, kind, via:'milestone'|'store'|'weekly' }`; `pearlsSpent { amount, on }`; `pearlsGranted { amount, source }`.
- **Hooks:** `purchaseCosmetic(id)` (pure: check `pearls >= price`, deduct, add to `ownedCosmetics`, emit) and `setActiveCosmetic(id)` (validation only). Both are deterministic, no RNG.
- **[OPEN — product owner]:** store pricing, rotation cadence, and whether any cosmetic is IAP-exclusive vs. pearl-earnable. Recommend **most cosmetics pearl-earnable** (respects the audience's IAP tolerance without paywalling the calm chase) + a **few premium IAP-only** cosmetic packs.

**Post-70 economy summary for README §6:** the daily-streak habit (with a one-day freeze forgiveness) is the spine; per-seed leaderboards give the daily a competitive edge for those who want it; weekly seeded scenarios add rotating novelty from a static pool; and earned pearls feed a cosmetic chase that is the real long-tail sink. All four ride existing prototype systems and the existing `LevelDef`/event pipeline — no new engine subsystem, only new state fields + events listed above.

---

## 5. Monetization posture (economy design + engine hooks only)

**Audience model (doc 03 §A):** 45–65 hybrid — tolerates **few, non-intrusive ads**, pays **IAP more than hyper-casual** (higher ARPU). Best levers: **rewarded video** (opt-in "continue / +N moves / extra pearl") and **IAP** (remove-ads, move/coin packs). **No interstitials mid-board, ever** (kills the calm). This section is logic/state only; the host owns the RV/IAP SDK flow (prototype `_offerRV` 655, `_rvAvailable` 651, `rt_rvCount` cap of 3/day).

### 5.1 Soft currency = pearls (single wallet)

Pearls are the one soft currency: earned from stars (30/20/10, `_resolveVoyageWin` 875), streak chests (§4.1), pearl collectibles in-level, and milestones; spent on cosmetics (§4.4) and — optionally — on continues/rerolls. **Reconciliation note the engineer must resolve:** the prototype conflates *pearls collected as a level goal* with *wallet pearls* (line 1353 adds collected pearls to the wallet). Keep both but make it explicit: `pearlsCollected` (per-level goal counter, resets each level) vs. `pearls` (persistent wallet). A collected pearl may grant, say, **+1 wallet pearl** — **[OPEN — product owner]** whether collectible pearls pay the wallet at all (recommend **yes, +1 each**, it feels generous and costs little).

### 5.2 Rewarded video grants (opt-in, capped)

| RV offer | Effect (engine) | Hook (arch doc §8) | Grounded |
|---|---|---|---|
| **Continue after loss** | revive: tide-drown → `tide = max(0, tide-3)`; no-moves → force a guaranteed-safe small-piece tray; `status:'playing'`, `continues++` | `continueAfterLoss({rewarded:true})` | `_resolveDrown` 689; prototype offers RV before declaring loss (1421) |
| **+N moves** | `moveLimit += N` (recommend **N=5** [OPEN]), `grantedMoves += N`; if lost with `out-of-moves`, resume | `grantMoves(5)` — always deterministic | arch §8 |
| **Extra pearl(s) / reroll tray** | reroll: replace unplaced tray with fresh generated hand | `rerollTray({rewarded:true})` | arch §8 |

- **Cap:** RV offers **≤3/day** (prototype `_rvAvailable`, `rt_rvCount<3`, 653). Keep the cap — over-serving ads to this audience erodes trust.
- **Seeded-mode rule:** any RV grant that draws RNG (reroll, no-moves continue) sets `state.deterministic=false` → disqualifies the leaderboard run (§4.2) but NOT the streak. `grantMoves` draws nothing → safe even in seeded play if product allows paid budgets (arch §8).
- **Events:** reuse `movesGranted`, `continued`, `trayRerolled` (all already in the `GameEvent` union, arch §3). Add `rvOffered { placement, kind }` / `rvClaimed { kind }` **[OPEN — product owner]** if the host wants engine-side analytics; otherwise host owns the offer entirely.

### 5.3 IAP grants

| IAP | Effect (engine state) | Notes |
|---|---|---|
| **Remove ads** | sets `noAds:boolean` flag; RV *offers* still allowed (they're opt-in rewards, not interstitials) — remove-ads suppresses any host interstitial layer only | flag only; engine never shows ads anyway |
| **Pearl pack** | `pearls += packAmount` via `pearlsGranted{source:'iap'}` | pure wallet add |
| **Move pack / continue pack** | grants a consumable count `moveTokens`/`continueTokens` the host spends via `grantMoves`/`continueAfterLoss` without an ad | tokens are host-side inventory; engine just applies the effect when the token is spent |
| **Cosmetic pack** | unlock premium cosmetic ids directly (`cosmeticUnlocked{via:'iap'}`) | §4.4 rail |

- **Engine state added:** `noAds:boolean`, `pearls` (wallet, exists), optional `moveTokens/continueTokens:number`. All deterministic, no RNG.
- **Hooks:** all IAP resolves to the **same three effect hooks** (`grantMoves`, `continueAfterLoss`, `rerollTray`) plus wallet/`ownedCosmetics` mutations — so RV and IAP share one economy code path; the *source* (ad vs. purchase) is host metadata (`opts.rewarded`). This is the clean layering the brief asks for: the engine exposes effects, the host decides monetization trigger.

**Posture summary:** one soft currency (pearls), three effect hooks shared by RV and IAP, a hard ≤3/day RV cap, no mid-play interstitials, remove-ads + packs as the IAP spine, cosmetics as the primary sink. Nothing here tightens difficulty or renders; it is state + hooks the economy layers onto later.

---

## 6. Open business decisions (flagged for product owner)

1. **Tier-B element go-live** (`current`, `storm`): ship dark behind `FEATURES` flags until the sim pass proves 0 unavoidable deaths; and **`current` representation** — drift-placed-pieces vs. tray-bias (recommend tray-bias for 45–65). (§1.6/§1.7)
2. **Milestone flat pearl bonuses** 30/40/50/75 and **bonus-tile multiplier stacking cap** (recommend ×4). (§2.1/§1.5)
3. **Leaderboard scope + eligibility:** global vs. friend/cohort (recommend cohort); does any `continueAfterLoss` disqualify (recommend yes). (§4.2)
4. **Streak chest ladder past day 30** and **freeze-token economy** (how a player earns/buys freezes). (§4.1)
5. **Weekly challenge reward type** (pearls vs. cosmetic-only) and **daily seed scope** (recommend date-only). (§4.3/§4.1)
6. **Pearl monetization boundary:** which cosmetics are pearl-earnable vs. IAP-exclusive; whether collectible pearls pay the wallet; RV grant sizes (N moves, continue sandbag). (§4.4/§5)
