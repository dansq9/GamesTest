# 07 · Simulation, Play-Bot & QA Gates

**Owner:** QA / Simulation Engineer · **Scope:** test strategy · headless simulation · property/regression suite · CI gates. **No UI, no frontend, no engine implementation** — I *drive* the engine (`02` API) and *prove* the fairness/difficulty contracts (`03`, `01`, `05`, `04`) from scripts before any UI exists.
**Grounded in:** `01-level-tables.md` (§4 win-rate bands, §2 budgets, §3 assist curve), `02-engine-architecture.md` (API, event ordering, snapshot/restore, injected RNG), `03-fairness-solvability.md` (determinism contract, `handIsSafe`, T1–T7, the legit-vs-unavoidable classifier — **central**), `04-progression-economy.md` (Tier-B gate, leaderboard determinism), `05-special-mechanics.md` (combo→special grant, Seeded disable, power-up determinism), and `rising_tide_review/…/04_puzzle_scenarios_and_difficulty.md §E` (difficulty-scoring model).
**Convention:** where a spec left a number `[OPEN]`, I state the value **my sim must lock** and how it locks it. Everything the harness asserts is traceable to a spec line.

---

## 0. TL;DR

1. **The linchpin is the bot, and the bot is deliberately mediocre.** An optimal solver rates every level trivial (it plays the `handIsSafe` witness every hand and never corner-paints) and would greenlight levels that are brutal for a real 45–65 player. The production oracle is a **skill-calibrated casual heuristic bot** (1-hand lookahead, greedy-ish, noisy). It is bracketed by a **random-legal baseline** (fairness floor) and a **strong bot** (feasibility oracle / difficulty ceiling).
2. **Three separate properties, never conflated** (`03`): determinism (T1/T2), per-hand safety / zero-unavoidable-death (T3/T4/T5), and goal-achievability-under-budget (T6). Plus special-mechanics determinism (`05`) and the Tier-B element gate (`04`).
3. **Difficulty is a CI test, not a judgment call** (`04 §E`): a frozen casual bot plays N-thousand games/level, and every authored level's first-try win-rate must land in its chapter band (`01 §4`) or the Systems Designer is flagged to retune.
4. **The bot's own randomness runs on a *separate* stream** from the engine RNG, so simulation never perturbs the deterministic event stream it is validating.

---

## 1. The headless play-bot

### 1.1 Why a casual bot, stated sharply

The engine's solvability floor (`03 §2`) guarantees *a* safe ordering exists every hand. An **optimal** bot always finds and plays that witness, so it essentially never dies except on genuinely terminal boards, and it hits every goal in near-minimum moves. If we calibrate difficulty against an optimal bot, `budgetSlack` looks enormous everywhere and every level reads "trivial" — then we ship L25/L33 (the tight `fair` efficiency levels, slack +2, `01 §2`) and the real 45–65 player, who *misses finishers and picks bad orderings*, loses repeatedly on a level our tests called easy. **The bot must reproduce the human failure modes**: missed line completions, greedy piece ordering that dead-ends a safe hand (classifier case **L-a**, `03 §7`), and leaving the board fuller than optimal. That is exactly what a limited-lookahead, noisy, greedy bot does.

### 1.2 Three bots, one interface

All three implement `Bot.chooseMove(state) → { pieceIdx, r, c }` and are driven through the public API only (`placePiece`, `legalMoves`, `getState`, `02 §2`). None reads engine internals; they see what a player sees (board, tray, goal, tide, moveLimit).

| Bot | Role | Lookahead | Selection | Used by |
|---|---|---|---|---|
| **CasualBot(s)** | Primary difficulty & attainability oracle (models 45–65 at skill `s∈[0,1]`) | **1 placement** (no future-hand search) | softmax over heuristic score, with blunder + clear-miss noise | T3 attainability, T6, difficulty loop (`04 §E`), win-rate bands (`01 §4`) |
| **RandomLegalBot** | **Fairness floor / adversarial stressor** | 0 | uniform over all legal placements | T3 zero-unavoidable-death floor (worst corner-painter), T4/T5 |
| **StrongBot** | **Feasibility oracle / difficulty ceiling** | full 3-piece safe-ordering DFS + min-residual-fill; optional 2-hand | argmax, no noise | T6 feasibility (∃ winning line ≤ budget), sanity-bracketing the casual bot |

RandomLegalBot is the important safety stressor: a uniform-random player ratchets fill upward faster than any heuristic, so if an unavoidable death can be *manufactured*, the random bot finds it first. StrongBot's win must **never be required** for fairness — it only certifies feasibility (`03 §5.1`: a god-player *could* win).

### 1.3 CasualBot heuristic scoring function

For a candidate placement of tray piece `p` at origin `(r,c)` producing post-placement, post-clear board `B'`, score:

```
h(p,r,c) = w_clear   · linesCleared(B→B')·cellsCleared          // chase clears — the casual dopamine
         + w_goal     · goalDelta(B', level.goal)               // pearls covered+cleared, barnacles removed,
                                                                //   tide pushed down (survive), points (score/combo)
         + w_flat     · (−fillPct(B'))                          // keep the board low/open
         + w_frag     · (−fragmentation(B'))                    // penalize isolated 1-cell holes (hard to fill)
         + w_edge     · edgeContact(p,r,c)                      // reward tidy placement against walls/blocks
         + w_near     · nearComplete(B')                        // reward leaving lines at 6/7-of-8  [skill-gated]
         + w_reserve  · reservePenalty(B', remainingTray)       // does B' still admit remaining tray pieces? [skill-gated]
```

- `fragmentation` = count of empty cells with < 2 empty orthogonal neighbours (a proxy for "holes a casual player can't use"). `nearComplete` and `reserve` are the **skill-sensitive** terms: a low-skill player barely plans finishers or reserves space, so their weights scale with `s`.
- **Goal awareness is real but shallow:** the bot biases toward the active goal (`goalDelta`) but only one placement deep — e.g. on a `collect` level it favours covering a pearl and closing that line *this move*, it does not plan a two-move pearl setup. This matches how the target player engages the goal.
- The **base tray only** is scored for placement; earned specials (Line-Blaster/Bomb, `05 §2`) are spent by a trivial policy: play a special when `fillPct > s_panic` (a crowded-board reflex), never as a planned combo — again modeling non-optimal use.

### 1.4 The single "skill" knob `s` and how it maps

`s ∈ [0,1]` is the one dial; a fixed calibration table expands it into the tunables (all **[OPEN — my sim locks these against the bands]**):

| tunable | meaning | s=0.45 (low casual) | s=0.55 (mid, the reference) | s=0.65 (upper casual) | StrongBot |
|---|---|---|---|---|---|
| `D` lookahead | placements searched | 1 | 1 | 1 | 3 (full hand) |
| `τ` temperature | softmax over `h`: `P ∝ exp(h/τ)` | high (loose) | mid | low (sharp) | 0 (argmax) |
| `β` blunder rate | prob. of a uniform-random legal move instead of scored | 0.12 | 0.06 | 0.03 | 0 |
| `μ` clear-miss rate | prob. `w_clear` term is dropped for a candidate (didn't "see" the finisher) | 0.30 | 0.18 | 0.10 | 0 |
| `w_near`,`w_reserve` | planning weights | ≈0 | small | moderate | max |

`μ` (missed finishers) and `β` (lapses) are what make the bot **losable** on safe hands, producing the legitimate **L-a** losses the win-rate bands are measured against. **The reference skill for the shipped win-rate assertions is `s = 0.55`**, chosen because Ch1 must read ≥92% first-try (`01 §4`) for a *median* casual, and 0.55 is the median of the 45–65 band by construction (§1.6).

### 1.5 The bot RNG is a separate stream (determinism firewall)

CasualBot's `τ/β/μ` draws come from a **`botRng = mulberry32(botSeed)` that is wholly independent of the engine's game RNG** (`02 §5`). The bot never consumes the game stream. Consequences: (a) a sim run is reproducible from `(gameSeed, botSeed)`; (b) the bot cannot desync or contaminate the golden-master (T1) or resume-equivalence (T2) it is validating; (c) win-rate estimates are variance-reduced by sweeping `botSeed` over a fixed set while holding `gameSeed` policy fixed.

### 1.6 Validating the bot's skill against the target (breaking the circularity)

The obvious trap: fit the bot to the bands, then "assert" it hits the bands — circular. The fix is **fit on anchors, freeze, then assert on everything else**:

1. **Anchor fit.** Pin `s` on a *small, hand-verified* calibration set the design guarantees: L1–L3 are effectively un-losable (`01 §4` "L1–3 effectively 100%"; trivial targets + solvability floor). Fit `s` so CasualBot wins L1–L3 ≥ 99.5% **and** matches one hand-authored "should feel ~80% first-try" reference board. This yields `s ≈ 0.55`. **`s` is then frozen for the release.**
2. **Assert the other 37 levels.** With `s` frozen, a level landing out of its band (§ T-BAND) implicates the **level**, not the bot — that is the whole point (`04 §E` turns difficulty into a test).
3. **Bracketing sanity (per level, every run):** require `winrate(Random) < winrate(Casual) < winrate(Strong)` and `winrate(Strong) ≥ 0.98` on every authored level. If Casual ≈ Strong, the bot is secretly optimal (too high `s`, or noise wired wrong) → **hard fail the whole suite**, because the difficulty numbers would be worthless.
4. **Monotonicity sanity:** across the difficulty dials (`04 §C`: target size, `−budgetSlack`, obstacle density, element interaction, mode), CasualBot win-rate must be **non-increasing**. A "harder" level that the bot wins *more* often than an easier one flags either a mis-authored level or a mis-tuned heuristic (warn, then investigate).
5. **Behavioral signature check:** log per game the clear-miss rate actually exercised, avg fill at loss, and moves-to-win distribution; assert they sit in casual-plausible ranges (e.g. avg fill-at-loss well above an optimal player's, finishers missed ≈ `μ`). Guards against a bot that hits the right *win-rate* for the wrong *reasons*.
6. **Close the loop post-launch:** once live telemetry exists, re-fit `s` (and only `s`) so simulated per-chapter first-try win-rate matches observed, then re-freeze. Until then `s` is anchored to design intent and frozen so difficulty regressions are attributable to level edits, not bot drift.

**What win-rates a casual bot SHOULD get** (the assertion targets, `01 §4`): Ch1 Guided **≥92%** (target 95%, L1–3 ≈100%); Ch2 Reef Fair **≥85%**; Ch3 Deep Fair **≥76%**; Ch4 Open Fair **≥68%**; milestones L10/20/30/40 **≥80% first-try AND ≥95% two-try**. RandomLegalBot will fall far below these (it is *not* required to hit bands — only required to never suffer an *unavoidable* death). StrongBot ≥98% everywhere.

---

## 2. The property / regression suite

Each test lists **driver**, **pass criteria**, **N / scope**, **gate class** (HARD = red blocks "engine done"; WARN = yellow, triaged not blocking). N values marked **[locks 03 §8 OPEN]** are the sim counts `03` deferred to the product owner; these are the values my harness runs and thereby locks.

### T1 — Determinism golden-master (`03 §7 T1`, `02 §5`) · HARD
- **Driver:** for each seed in a fixed seed set, `newGame(seed)` + a committed scripted move sequence; serialize the full ordered event stream (canonical JSON, event order per `02 §3`) and hash it.
- **Pass:** hash **byte-identical** to the committed golden, across (a) two runs same process, (b) two OS processes, (c) **Node build vs. headless browser build** (proves the `Math.imul`/bitwise integer-exactness claim, `03 §1.1`).
- **Special-pass invariance (`05 §2.4`):** the **base+color** sub-stream hash must be identical whether combo-specials are enabled or disabled — proves the special draw is a strictly trailing 4th-slot draw that never shifts the base stream. Assert by hashing base events with specials-code compiled in vs. out.
- **Fail = any mismatch.** A changed hash without an intended rules change is a determinism regression.

### T2 — Resume-equivalence: `resume == fresh play` (`03 §1.4`, `02 §7`) · HARD
- **Driver:** random `gameSeed`, random turn `T`, random later move `M`. Path A: play continuously `0→M`, record the `[T,M]` tail event stream + final state. Path B: play `0→T`, `snapshot()`, `restore()`, play `→M`.
- **Pass:** Path A tail ≡ Path B tail (identical events + identical final `GameState`).
- **Contract under test = `03`'s state rehydration, not the XOR:** the snapshot MUST carry `rngState = rng.getState()` **and** `tideRises` **and** `prevTideFloor` (`03 §1.4`; the prototype `_autoSave` bug omitted the latter two and corrupts Survive progress). Restore = `mulberry32(snapshot.rngState)`.
  - **Regression guards (must fail loudly):** a committed **`xfail`** test proves the prototype rule `mulberry32(seed ^ (turns+1))` **breaks** T2 (divergent tails) — so nobody reintroduces it. A **mutation test** proves that dropping `tideRises`/`prevTideFloor` from the snapshot corrupts a Survive-level resume (T7 progress loss).
- **Bridging assertion (reconciles `02 §7` vs `03 §1.4`):** `02` fast-forwards `rngCalls` draws; `03` rehydrates `getState()`. Both are deterministic and must pass T2; assert `mulberry32(getState())`-rehydration ≡ `rngCalls`-fast-forward for the same run. **My sim ships against `03`'s O(1) `getState()` rehydration** (fast-forward is O(rngCalls) and pointlessly slower); the bridge test protects either implementation choice.

### T3 — Zero unavoidable deaths (`03 §7 T3` + the classifier) · HARD
- **Driver:** CasualBot(s=0.55) **and** RandomLegalBot each play N games per mode. On every `lost` event, run the classifier (§2.1). Logs per game: every tray-gen (board snapshot + shapes), every placement, terminal cause.
- **N [locks 03 §8 OPEN]:** **Guided ≥ 1e6**, **Fair ≥ 1e5**, **Seeded ≥ 1e5** per bot. (Guided gets 10× because its promise is the strongest — "effectively un-losable," `03 §4.3`.)
- **Pass:** `count(unavoidable) == 0` across all games and both bots. Legitimate losses are allowed (and feed the band checks, T-BAND).
- **Fail = any unavoidable death.** This is the hardest gate in the suite; a single unavoidable death means the generator served an unsafe hand when a safe one existed (`03 §2` forbids it) → lower `F_cap`/raise rescue aggressiveness (`03 §4.3`) or fix the generator.

### T4 — Solvability-floor invariant (`03 §7 T4`) · HARD
- **Driver:** inline during every T3 playthrough, on **every** tray generation.
- **Pass:** the served hand is safe (`handIsSafe(board, served) == true`) **OR** the board is genuinely terminal (`E < min piece cell-need`). Checked per tray, not only at losses (a latent unsafe-but-not-yet-fatal hand is still a bug).
- **Guided extra:** additionally assert the rescue rule + fill ceiling (`03 §4.3`): above `F_rescue` a *clearing* hand is served, and no tray's minimum end-of-hand fill exceeds `F_cap`. **My sim locks the [OPEN] thresholds** by starting at `F_rescue=0.72`, `F_cap=0.80` (`03 §8` proposals) and *lowering `F_cap`* if any Guided no-moves loss ever appears in T3 — the certified values are whatever drives Guided no-moves to zero over 1e6.

### T5 — No-flood invariant (`03 §7 T5`, `02 §6`) · HARD
- **Pass:** no Guided/Fair tray contains three pieces each ≥4 cells (`bigCount≥2 → third capped ≤3`). Assert per tray during T3.

### T6 — Goal-achievability under budget (`03 §5`, §7 T6) · HARD (per authored level & per shipped daily seed)
- **Two properties, both required:**
  - **Feasibility (existence):** StrongBot (bounded existence search) reaches `target` within move/tide budget for `(L, seed)`. For move-limited levels this is `budgetSlack = moveLimit − medianMovesToWin ≥ 0` (the `01 §2` hard rule — **never ship negative slack**). **Survival is exempt** from a feasibility solver: `tideRises` accrues on real upward crossings and never decreases (`03 §5.1`, `01 §5`), so every survive target is reachable by construction — assert only attainability pacing (and T7).
  - **Attainability (skill-calibrated):** CasualBot(0.55) first-try win-rate ≥ chapter band (T-BAND).
- **Daily-seed vetting loop (`03 §5.2`) — repeatable, deterministic:** for the shared Daily board, iterate `salt = 0,1,2,…` in published order, `s = seedFromDate(date) ⊕ mix(salt)`, accept the **first** seed where `referenceBotWins(dailyLevel, s, budget, s=0.55)` (feasibility **and** attainability). Everyone computes the same salt → board stays identical **and** provably winnable within its generous budget. Runs nightly as a **CI cron** that pre-vets upcoming daily seeds and hard-fails if no seed within `salt < SALT_CAP` passes (**SALT_CAP [OPEN] — my sim locks it at the smallest cap that clears 60 days of look-ahead seeds; start 64**).
- **Gate:** feasibility+slack are **HARD** in CI before ship; the daily loop is **HARD** on the vetting cron.

### T7 — Survival monotonicity (`03 §7 T7`) · HARD
- **Pass:** across every tide-mode playthrough, `tideRises` never decreases and survive progress is never lost — including across a `snapshot()/restore()` (ties to T2's `tideRises` persistence). Also assert Tide-Push power-up (`05 §3.1`) reduces `tide` but **never** `tideRises`.

### 2.1 The legitimate-loss vs unavoidable-death classifier (`03 §7`, the exact rule)

On any `lost` (`no-moves`|`drowned`|`out-of-moves`), reconstruct the last tray-generation from the log and classify:

- **UNAVOIDABLE (bug — count must be 0):**
  - `boardWasNotTerminal(B_lastgen) ∧ served hand not safe` — a safe hand *existed* for that board but the generator served an unsafe one and the player then had no legal first placement. (Generation failure; `03 §2` forbids it.)
  - **OR any Guided `no-moves` loss whatsoever**, regardless of board (`03 §4.3` rescue+ceiling forbid it).
- **LEGITIMATE (allowed; feeds win-rate bands):**
  - **L-a Player agency:** served hand *was* safe (a witness ordering existed) but the bot's greedy/noisy choice dead-ended. Detected by replay showing an alternative legal choice avoided death. **This is the expected, desired casual-bot loss** — it is what the win-rate bands measure.
  - **L-b Terminal board (Fair/Seeded only):** board reached `E < min piece need` with no safe hand for *any* hand, produced by the player's own prior placements. **Never legitimate in Guided.**
  - **L-c Budget exhaustion on a goal-achievable level:** ran out of moves though T6 feasibility passed (`03 §5`, safety ≠ goal). Legitimate for Efficiency/Score; kept ~absent early by generous Ch1 budgets.

Implementation: the harness stores the pre-gen board for each hand, so "did a safe hand exist for this board?" is re-decidable offline by exhaustive `handIsSafe` over the roster — no engine internals needed.

### T-BAND — Per-chapter first-try win-rate bands (`01 §4`) · HARD
- **Driver:** frozen CasualBot(0.55), first-try (fresh attempt, no continues/rerolls), N games per level.
- **N [locks 01 §4 / 04 §E]:** **≥ 5,000 games/level** (tight enough CI ~±1.3% at 90% via Wald; sweep `botSeed`, hold `seedPolicy`). Milestones ≥ 10,000 (need both first-try and two-try precision).
- **Pass (with tolerance `ε`, [OPEN] recommend ε=2%):** each level's simulated first-try win-rate ≥ its chapter band − ε: Ch1 ≥92%, Ch2 ≥85%, Ch3 ≥76%, Ch4 ≥68%; milestones ≥80% first-try **and** ≥95% two-try.
- **Fail action:** a level below band → **flag to Systems Designer to retune** (soften a dial, `04 §C`), not a bot change. A level *far above* its band (e.g. Ch4 level at 95%) is a **WARN** (too easy for its slot) surfaced in the difficulty report.

### T-SPECIAL — Special-mechanics invariants (`05`) · HARD (SP1–SP5), WARN→HARD (SP6)
- **SP1 — combo-specials disabled in Seeded (`05 §1.4/§2.4`):** in any Seeded run, `comboReward` never fires, `satchel` unchanged, and the **base tray stream is byte-identical** to the same seed with the special-grant code present-but-disabled. Proves Daily sameness survives (`03 §4.1`, `04 §4.2`).
- **SP2 — specials never worsen solvability (`05 §2.3`):** a served Line-Blaster/Bomb is placeable whenever `E ≥ 1`, and a special can **never** appear in an unavoidable-death classification (a pure-clear, space-creating piece). Assert during T3.
- **SP3 — power-up determinism flags (`05 §3.3`, `02 §8`, `04 §4.2`):** `grantMoves`/`Tide-Push` draw **zero** RNG (assert `rngCalls` unchanged after the hook). `rerollTray`, `Undo-Last` (rewinds `rngCalls`), and any tray-regenerating `continueAfterLoss`: in Seeded/ranked either **forbidden** or set `state.deterministic=false` and stamp `deterministic:false` on the emitted event. **Assert:** no such op ever leaves `deterministic==true`; **Undo-Last is refused entirely in Seeded** (`05 §3.3` — it would let a ranked player re-draw the future).
- **SP4 — leaderboard eligibility (`04 §4.2`):** any run with `deterministic==false` is excluded from leaderboard verification; any `continueAfterLoss` disqualifies the leaderboard run while **still counting the streak** (`04 §4.2` recommendation). Assert the eligibility predicate over a mix of clean/reroll/continue runs.
- **SP5 — leaderboard reproducibility (`04 §4.1/4.2`):** a Seeded/ranked run replayed from `{seed, scripted moves}` yields byte-identical `score`, `turns`, `tideRises`, and event stream; the combo score contribution honors `min(combo, COMBO_SCORE_CAP)·50` with **COMBO_SCORE_CAP=20** (`05 §1.2`) and the bonus-tile multiplier cap **×4** (`04 §1.5`). This is the property that makes leaderboard scores comparable.
- **SP6 — combo grace rule (`05 §1.2`):** scripted-sequence property test — one non-clearing move emits `comboHeld` and holds `combo`; the *second consecutive* non-clear emits `comboBroken`; any clear refreshes grace. HARD because leaderboard scores depend on the reset trajectory.

### T-TIERB — Tier-B element gate: `current` / `storm` (`04 §1.6/1.7/§3`, §6.1) · HARD, build-gating
Tier-B elements mutate the board *outside* a placement (current drifts placed pieces; storm fills cells / jumps tide), so per-hand safety validated at generation is not automatically preserved. **This gate is the build flag `FEATURES.currentLive` / `FEATURES.stormsLive` (`04 §3/§6.1`): the content ships dark until the gate is GREEN.**
- **Scope:** T3 (zero unavoidable death) run **restricted to the Tier-B levels** — `{L26,L27}` (current), `{L36,L37}` (storm), with the deep-tide survive levels `{L21,L28,L34}` included as tide-stress companions — across **N ≥ 1e5 games/level** with **both** CasualBot and RandomLegalBot.
- **Assertions (from `04` rejection guarantees):**
  - **current:** drift only into empty in-bounds cells, no-op otherwise → cannot create an unavoidable death by itself; after every drift the resulting board still passes T4. Never seeded with `anchor` in a non-milestone level (`04 §1.6`). (My sim also validates the recommended **tray-bias variant** separately so product can pick either representation.)
  - **storm:** a `fillCells` fire never leaves `!hasAnyMove`; a `tideJump` alone never crosses `tide≥8` (capped at ≤7.5); the storm is telegraphed one turn ahead (`elementEvent{firesInTurns}`) and fill targets pass `freeCell` spread (`04 §1.7`). After any storm fire, the next tray-gen still satisfies T4.
- **Pass = zero unavoidable deaths on the Tier-B scope for both bots.** Only then may `FEATURES.*Live` flip on. This is the literal "current/storm content only ships if the sim proves no unavoidable death."

---

## 3. The difficulty-scorer calibration loop (`04 §E`) — repeatable, not one-off

A nightly job that turns "is this level fair and appropriately hard?" into a fitted model + a per-level verdict.

**Loop (per authored level `L`, N ≥ 5,000 CasualBot(0.55) games):**
1. **Simulate & record** first-try win-rate `wr(L)`, avg moves-to-win, near-miss rate (`narrowMiss` events / attempts, `02 §3`), avg fill-at-loss, and legitimate-loss breakdown (L-a/L-b/L-c shares).
2. **Fit / validate the model** (`04 §E` shape):
   ```
   difficulty(L) ≈ f( targetSize, budgetSlack, obstacleDensity,
                      elementInteractionCount, engineMode )
   ```
   Fit `f` (regularized linear/GBM) to predict observed `1 − wr(L)` from the five authored dials. Report R² and residuals; the model is only *trusted* once it explains the corpus well — else the dials aren't capturing difficulty and the model itself is flagged.
3. **Flag out-of-band levels** (T-BAND): any `wr(L)` outside its chapter band ± ε → emit a **retune ticket** to the Systems Designer naming the offending level, its measured vs. target win-rate, and the model's largest-magnitude dial (the lever most likely at fault — e.g. "budgetSlack too low on L25", "obstacleDensity high on L14"). This closes the `04 §C` softest→sharpest dial back to a concrete edit.
4. **Regression-diff:** compare this night's `wr(L)` and difficulty scores to the last committed baseline; any level that moved > `δ` (**[OPEN] recommend δ=3%**) without a corresponding level-table change is flagged (a generator/assist-curve change silently shifted difficulty).
5. **Persist** the per-level table + model coefficients as the new baseline artifact (checked into the repo under `sim/baseline/`), so the loop is diffable run-to-run — **repeatable, not a one-off**.

This loop also **locks the `01` [OPEN] numbers** the Systems Designer flagged as riskiest: the three score targets/budgets (L23/32/38, sensitive to the ~200–240 pts/placement assumption) and L10's move budget (12 vs 8) are validated by measured `budgetSlack` and `wr` — the loop reports the actual pts/placement the bot achieves, replacing the assumption with data.

---

## 4. CI gates — what must be GREEN for "engine done (pre-UI)"

Runs on every engine PR (fast tier) and nightly (heavy tier). **HARD = merge/red-blocking; WARN = reported, triaged, non-blocking.**

### Fast tier (every PR, < ~5 min) — all HARD
| Gate | Proves | Spec |
|---|---|---|
| **G1 Golden-master (T1)** | seed ⇒ byte-identical event stream, cross-engine; base-stream invariant to specials | `03 T1`, `05 §2.4` |
| **G2 Resume-equivalence (T2)** | `resume == fresh play` via `getState()` rehydration; XOR `xfail`; `tideRises`/`prevTideFloor` persisted | `03 §1.4` |
| **G3 Solvability-floor + no-flood (T4,T5)** | every served hand safe-or-terminal; no triple-big tray | `03 §2`, `03 T4/T5` |
| **G4 Special/power-up determinism (SP1–SP6)** | Seeded disables combo-specials; RNG-drawing helpers flagged non-deterministic; grace rule; score reproducible | `05`, `04 §4.2` |
| **G5 Bot bracketing sanity (§1.6.3)** | `Random < Casual < Strong`, `Strong ≥ 0.98` on a fast level subset (smoke N) | `04 §E` |

### Heavy tier (nightly / pre-release, hours) 
| Gate | Class | Proves | Spec |
|---|---|---|---|
| **G6 Zero unavoidable deaths (T3)** | **HARD** | classifier `unavoidable==0`, both bots, Guided ≥1e6 / Fair,Seeded ≥1e5 | `03 T3/§7` |
| **G7 Goal-achievability (T6)** | **HARD** | feasibility + `budgetSlack≥0` every move-limited level; survive via T7 | `03 §5`, `01 §2` |
| **G8 Daily-seed vetting (T6 loop)** | **HARD** (cron) | every upcoming daily seed feasible+attainable within budget | `03 §5.2` |
| **G9 Win-rate bands (T-BAND)** | **HARD** | each level within chapter band ± ε; milestones ≥80%/≥95% two-try | `01 §4` |
| **G10 Tier-B element gate (T-TIERB)** | **HARD**, build-gating | current/storm show zero unavoidable death → flips `FEATURES.*Live` | `04 §1.6/1.7/§3` |
| **G11 Survival monotonicity (T7)** | **HARD** | `tideRises` never decreases, incl. across resume & Tide-Push | `03 T7`, `05 §3.1` |
| **G12 Difficulty-model fit + regression-diff (§3)** | **WARN** | model R² healthy; no unexplained per-level difficulty drift > δ | `04 §E` |
| **G13 Bot behavioral-signature (§1.6.5)** | **WARN** | casual bot loses for casual reasons (fill-at-loss, missed finishers ≈ μ) | `01 §4`, `04 §E` |
| **G14 Monotonicity of difficulty (§1.6.4)** | **WARN** | win-rate non-increasing across dials | `04 §C` |

**Definition of "engine done for this phase":** G1–G11 GREEN (all HARD), and G12–G14 reviewed with no unexplained anomaly. Tier-B content stays dark until G10 is GREEN.

**Locked-by-sim summary of `[OPEN]` thresholds:** N per mode for the zero-death gate (Guided 1e6 / Fair,Seeded 1e5); N per level for bands (5,000; milestones 10,000); band tolerance ε=2%; regression δ=3%; reference skill `s=0.55`; daily `SALT_CAP=64`; and `F_rescue`/`F_cap` certified by driving Guided no-moves to zero. `03`'s `F_rescue=0.72`/`F_cap=0.80` and `01`'s score budgets (L23/32/38) and L10's `moveLimit=12` are validated (not assumed) by G7/G9/§3.

---

## 5. ~150-word summary

**The casual bot** is the linchpin, and it is deliberately *not* an optimal solver: `CasualBot(s)` looks **one placement ahead**, scores greedily (chase clears, keep the board flat, avoid holes, weakly pursue the goal), and injects human error via a blunder rate, a **missed-finisher rate**, and softmax noise — all driven by one skill knob `s`, frozen at **0.55** (median 45–65) after anchor-fitting on the un-losable L1–3. It is bracketed by a **random-legal** floor (worst corner-painter, stresses safety) and a **strong** ceiling (feasibility oracle). Its noise runs on a separate RNG so it never contaminates the streams it validates.

**Hard CI gates (must be green):** G1 golden-master, G2 resume-equivalence (state rehydration, not XOR), G3 solvability-floor/no-flood, G4 special/power-up determinism, G6 zero unavoidable deaths, G7 goal-achievability, G8 daily-seed vetting, G9 win-rate bands, G10 Tier-B element gate, G11 survival monotonicity; difficulty-model fit and bot-signature are warn-tier.

**Biggest testing risk:** bot-calibration validity — if `s` is mistuned or noise is wired shallowly, the bot silently trends optimal, every level tests "easy," and we ship brutal levels that pass CI. Mitigations: anchor-fit + freeze, mandatory `Random<Casual<Strong` bracketing, and behavioral-signature checks.
