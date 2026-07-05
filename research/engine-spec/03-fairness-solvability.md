# 03 · Fairness, Determinism & Solvability

**Owner:** Fairness / Math & RNG Specialist
**Scope:** seeded RNG, determinism, solvability, "no unavoidable death," goal-achievability. **No UI.**
**Grounded in:** `Rising Tide Prototype v5.dc.html` (`class Component extends DCLogic`) and design docs `01`, `02` §E, `04` §C/§E.
**Convention:** invented numbers are tagged **[OPEN — product owner]**. Everything else is lifted from or derived from the prototype/docs.

---

## 0. TL;DR of the contract

1. **One injected `mulberry32` stream drives every draw, in a fixed order.** Seed ⇒ identical event stream, byte-for-byte, cross-platform.
2. **Resume is state-based, not turn-based.** Persist the RNG's 32-bit state word (and `tideRises`/`prevTideFloor`), *not* `turns`. This makes `resume == fresh-play-to-the-same-point`. **The prototype's `mulberry32(seedFromDate ^ (turns+1))` is replaced** — it is not equivalent to continuous play and silently breaks Daily sameness for any player who resumed.
3. **Solvability is a proven per-hand *safety* guarantee** (all 3 pieces placeable in *some* order, with clears simulated), not the prototype's per-piece `fitsAnywhere` heuristic.
4. **Per-hand safety is necessary but not sufficient.** Global winnability (Guided) and budgeted goal-achievability (Efficiency/Score/Survive) are *separate* guarantees resolved in §5 and §6.

---

## 1. The determinism contract

### 1.1 Why `seed ⇒ identical event stream` is achievable

`_mulberry32` (proto L578-585) evolves its state entirely in **32-bit integer arithmetic**: `a + 0x6D2B79F5 | 0`, `Math.imul`, `^`, `>>> n`, final `>>> 0`. `Math.imul` and the bitwise ops are IEEE-754-independent and identical across every JS engine. The only floating-point step is the *output* `(x >>> 0) / 4294967296`, and that single division is IEEE-754-exact (power-of-two divisor, exactly representable) and identical everywhere. `_seedFromDate` (FNV-1a, proto L586-590) is likewise pure 32-bit integer. **Therefore the state trajectory and every emitted double are reproducible bit-for-bit.**

**The exact requirement for reproducibility (two conditions, both mandatory):**

- **(R1) Single stream.** Every random decision — shape roulette, re-roll draws, gap-fill gate, colors, obstacle placement — flows through the *one* injected `rng: () => number` (docs `02` §D `GenContext.rng`). The prototype violates this: casual/voyage set `_rng = null`, so `_rand()` falls back to `Math.random` (proto L591, L770, L990). **Fix: all modes use an injected `mulberry32`; only the *seed source* differs** (§1.3). Casual seeds from a random uint32 at `newGame` and persists it, so even casual games are snapshot/replay/QA-reproducible.
- **(R2) Fixed draw order.** The sequence of `rng()` calls must be a deterministic function of `(board, state)`, never of wall-clock, iteration over an unordered set, or UI timing. The prototype already satisfies this inside `_genTray`; the canonical order must be frozen and documented (§1.2).

### 1.2 Frozen draw order inside `generate(board, ctx)` (lift from `_genTray`, proto L1095-1189)

Per hand, `rng()` is consumed in exactly this order:

```
for slot i in 0,1,2 (in ascending order):
    if (mode==guided && i==0 && assistLevel>0):
        draw d_gate         # gap-fill gate: 1 draw, ALWAYS taken when guided+slot0
        if d_gate < gapFillProb(assistLevel): piece = gapFillPiece()   # 0 draws (pure board scan)
    if piece not chosen:
        draw d_pick          # weighted roulette: exactly 1 draw
    while !fitsAnywhere(piece) && retries < RETRY_CAP:
        draw d_retry         # 1 draw per retry
# after all 3 shapes chosen:
for slot i in 0,1,2:
    draw d_color[i]          # 1 draw per color (proto L1185)
```

**Invariants the order must preserve:** the gap-fill gate draw is consumed *unconditionally* when `guided && i==0` (even if `gapFillPiece()` returns null) so the stream position does not depend on board contents in a way that desyncs; colors are drawn in a *separate trailing pass* after all shapes (matches proto). `fitsAnywhere` and `gapFillPiece` consume **zero** draws (pure board scans) and must stay pure. Obstacle seeding (`_seedObstacles`, proto L798-829) consumes draws *before* the first tray, in row-major attempt order — freeze that too.

> Note: replace the prototype's fixed `0.55` gap-fill probability and `challengeLevel < 10` cutoff with `gapFillProb(assistLevel)` from the assist-fade curve (docs `02` §C). The *draw* still happens; only the threshold it is compared against changes. This keeps the stream position stable as the curve is retuned.

### 1.3 Seed policy per mode

| Mode | `seedPolicy` | Seed source | Deterministic for all players? | Notes |
|---|---|---|---|---|
| **Zen / casual** | `none` | random uint32 at `newGame`, **persisted** | no (per-device) | Still injected+persisted → snapshot/restore & QA replay work. |
| **Voyage (Guided/Fair)** | `attempt` | `hash(levelId) ⊕ attemptSalt`, salt = random per attempt, persisted | no (varies per retry — *intended*: retries feel fresh) | Deterministic *within* an attempt; resumable; replayable. Obstacles seed from same stream. |
| **Daily Tide (Seeded)** | `date` | `seedFromDate(utcDateStr)` | **yes** | One board worldwide. **Date-only, not date+level** (there is a single daily board). |
| **Blitz — casual** | `none` | random uint32 | no | Current behavior. |
| **Blitz — ranked** *(if shipped)* | `date` or `date+round` | `seedFromDate(utcDate)` or `…+roundId` | **yes** | **[OPEN — product owner]** whether Blitz is ranked. If ranked, it *must* be seeded like Daily. |

**Answering README §6 "Seed scope":** Daily is **date-based only**. Use `date+level` *only if* the product later ships multiple distinct daily puzzles (a "daily voyage"); then `seed = seedFromDate(utcDate + ':' + levelId)`. A single daily board = `date`.

### 1.4 The RESUME contract — REPLACE the prototype's rule

**Prototype (proto L955):** `_rng = mulberry32( seedFromDate(date) ^ (turns+1) )`.

**Why it is wrong.** The number of `rng()` draws consumed by turn `T` is **not a function of `T`**: each hand consumes a *variable* count (1–3 gap-fill gates, 3 picks, 0..RETRY_CAP×3 re-rolls, 3 colors, plus obstacle draws). So you cannot reconstruct the live RNG position from `turns`. The XOR trick sidesteps this by *starting a brand-new stream* keyed on `turns`. Consequences:
- **`resume ≠ continuous play`:** a player who never closed the app has the RNG at internal state `S_live`; a player who resumed at the same turn gets `mulberry32(seed ^ (turns+1))`, a *different* future stream. Their subsequent trays diverge.
- **Daily "same board for everyone" breaks the instant anyone resumes** — two players on the same date get different tray sequences depending on whether/when they backgrounded the app. This defeats the entire Seeded-mode purpose (docs `02` §A: "Fairness in Seeded mode = sameness").

**The replacement contract (state-based rehydration).** `mulberry32`'s *entire* internal state is the single 32-bit accumulator `a`. Persist it.

```
// Expose the raw state from the generator:
interface SeededRng { next(): number; getState(): number; }   // getState() returns the current 32-bit `a`
function mulberry32(state) {                                   // `state` = post-last-draw accumulator
  let a = state | 0;
  return {
    next() { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a>>>15, 1|a);
             t = t + Math.imul(t ^ t>>>7, 61|t) ^ t; return ((t ^ t>>>14) >>> 0) / 4294967296; },
    getState() { return a >>> 0; }
  };
}

// SNAPSHOT (persist): { board, tray, score, combo, turns, tide, tidePhase,
//                       tideRises, prevTideFloor,   // <-- proto BUG: _autoSave never saves these
//                       goalProgress, movesUsed, seedPolicy, seedSource,
//                       rngState: rng.getState() }  // <-- the fix
// RESTORE: rng = mulberry32(snapshot.rngState);     // exact continuation
//          restore tideRises/prevTideFloor verbatim; do NOT regenerate the tray.
```

**Why `resume == fresh-play-to-same-point` now holds (proof sketch).** The game state is a pure function `step(state, rng)` where `rng` is the *only* nondeterministic input and all draw order is fixed (R1+R2). At snapshot we persist (a) the full deterministic state and (b) the exact RNG accumulator `a`. On restore, `mulberry32(a).next()` returns *exactly* the value the live stream would have returned next (mulberry32 is a pure function of `a`). By induction over subsequent `step` calls, every future state and every emitted event equals the never-interrupted run. ∎

**Bonus correctness fix:** the prototype's `_autoSave` (proto L931-942) persists `tide`/`tidePhase` but **not** `_tideRises`/`_prevTideFloor` (instance fields set in `_placePiece` L1273-1276). On resume these reset to 0/undefined, corrupting Survive-goal progress. The snapshot above persists them explicitly.

**Golden test for this contract:** see §7 T2 (resume-equivalence).

---

## 2. The upgraded solvability algorithm

### 2.1 What the prototype guarantees vs. what we need

`_genTray` guarantees (proto L1171-1180): each piece *individually* `fitsAnywhere`, else re-`pick(2)` ≤10×, else force slot 0 to a `dot`. **Gap:** three pieces that each fit *alone* can still be collectively unplaceable — placing piece A can block the only spot for piece B. The prototype never checks the **3-piece ordering**. We need a **hand-safety** guarantee.

### 2.2 Definition — a *safe* hand

> **Hand safety.** A tray `H = [p0,p1,p2]` on board `B` is **safe** iff there exists an ordering `π` of its pieces and placements such that all three can be placed in sequence — applying line-clears after each placement — with every piece having ≥1 legal placement when its turn comes.

This is the exact "not force-dead at hand end" property. Game-over fires when a to-be-placed piece has no legal cell (`_hasAnyMove` false, proto L1200-1210), so avoiding force-death within a hand = existence of a full 3-placement sequence. **Line clears must be simulated between placements** — they open space and are what makes many crowded hands safe.

### 2.3 Algorithm

```
function handIsSafe(board, pieces):            # pieces = up to 3 shapes (colors irrelevant)
    return dfs(board, pieces)

function dfs(board, remaining):
    if remaining is empty: return true          # all placed → safe witness found
    for each piece p in remaining (dedup identical shapes):
        for each (r,c) in emptyAnchoredPlacements(board, p):   # only cells that could host p
            if canPlace(board, p, r, c):
                board2 = applyPlaceAndClears(board, p, r, c)   # simulate clears
                if dfs(board2, remaining \ {p}): return true
    return false

# generate(board, ctx):
function generate(board, ctx):
    for attempt in 0 .. RETRY_CAP:              # RETRY_CAP = 8  [OPEN — product owner]
        H = rollHand(board, ctx)                # weighted pick + pressure dial + gap-fill + no-flood
        if handIsSafe(board, H.shapes): return withColors(H, ctx)
        # optional: re-roll only the offending slot (§2.4) instead of the whole hand
    return safeFallback(board, ctx)             # guaranteed-terminating (§2.5)
```

`rollHand` keeps the prototype's weighted `pick`, pressure multipliers, no-flood cap, and gap-fill (proto L1121-1175) — but its output is now *validated*, not trusted.

### 2.4 Offending-slot re-roll (tighter, optional)

Instead of re-rolling all three, find the minimal fix: if `handIsSafe` fails, for `k` in 2,1,0 test whether replacing slot `k` with a dot makes the hand safe; re-roll the lowest such `k` (biasing toward keeping earlier, already-drawn slots). This preserves more of the intended weighted draw and converges faster. Either strategy is correct; the whole-hand re-roll is simpler and bounded identically.

### 2.5 Guaranteed-safe fallback (termination guarantee)

If `RETRY_CAP` re-rolls all fail, build a hand **constructively** rather than by rejection sampling:

```
function safeFallback(board, ctx):
    H = []
    b = board
    for i in 0..2:
        p = smallest shape with ≥1 legal placement on b, preferring dot   # dots maximize placeability
        if p is null: break            # b has 0 empty cells reachable → board is terminal
        (r,c) = first legal placement of p on b
        H.push(p); b = applyPlaceAndClears(b, p, r, c)
    while H.length < 3: H.push(dot)     # pad; harmless if board terminal (loss is legitimate — see §4)
    return withColors(H, ctx)
```

`safeFallback` is a **finite constructive walk** (no rejection loop), so `generate` **always terminates**. It returns the *maximal safe prefix* it can build. If it cannot place even one piece, the board has zero empty cells → the game is at a genuine terminal/near-win state and the resulting loss is **legitimate** (§4), not a generator bug.

### 2.6 Termination & worst-case cost

- **`generate` terminates:** ≤ `RETRY_CAP` bounded `handIsSafe` calls, then one finite `safeFallback`. No unbounded loop (unlike the prototype's `while tries<10` which could still emit an unsafe hand).
- **`handIsSafe` cost:** depth 3, branching = (≤3 pieces) × (legal placements). Anchoring placements to empty cells bounds placements by `E = #empty cells`. Worst case `≤ 3·E · 2·E · 1·E = 6·E³` leaves, each `O(64)` to apply clears ⇒ `O(E³)`. On a **crowded** board (where safety is at risk) `E` is small, so it is fast; on an **empty** board it short-circuits on the first branch. Pathological mid-fill unsafe hands are the only expensive case and are hit ≤ `RETRY_CAP` times.
- **Total generate cost:** `O(RETRY_CAP · E³)` `canPlace` ops + `O(3·64)` fallback ⇒ bounded constant per hand. Acceptable at generation time (once per emptied tray).
- **Optimization (recommended):** pre-filter — if some piece has 0 placements now *and* no other piece's placement can clear a line that would open a spot for it, return `false` immediately (skip the DFS). Cheap and cuts most unsafe hands instantly.

**Invariant this establishes:** *If any safe hand exists for board `B`, `generate` returns a safe hand.* (Rejection sampling + constructive fallback both target safety; fallback finds a witness whenever `E ≥` the pieces' cell needs.) This is the property the harness asserts (§7 T4).

---

## 3. Draw-order & no-flood guardrails (lifted, formalized)

Retain from `_genTray`, now as validated rules:

- **Pressure dial** (proto L1126-1128): `crowded (fill>0.60)` → big pieces (≥4) ×0.22, small (≤2) ×2.4; `veryCrowded (fill>0.78)` → (≥3) ×0.35. Per-slot cell caps: wave→4, crowded→≤3, veryCrowded→2. **Strength scales with `assistLevel`** (docs `02` §C: relaxes over life, never fully off). Thresholds 0.60/0.78 are the prototype's; keep unless retuned **[OPEN]**.
- **No-flood** (proto L1163): once 2 pieces with ≥4 cells are drawn, cap the third at ≤3 cells. Never three big pieces in Guided/Fair. Assert as invariant (§7 T5).
- **Gap-fill** (Guided only, proto L1137-1154, L1167): offer a ≤2-cell finisher for a 7/8 line with prob `gapFillProb(assistLevel)`, tapering to 0 by end of Chapter 1 (docs `02` §C). Pure board scan, 0 extra draws beyond the gate.

---

## 4. HARD PROBLEM A — Local vs global solvability

**The trap:** `handIsSafe` guarantees *this* hand has an out. It does **not** guarantee the *game* stays winnable — a player (or a run of unlucky-but-safe hands) can ratchet board fill upward until the board is topologically terminal. Per-hand safety is *local*; winnability is *global*. Each mode makes a **different** promise:

### 4.1 Seeded / Pure (Daily, ranked)

- **Guarantee:** **per-hand safety only.** Every served hand has a legal out; no adaptive help beyond that.
- **Rationale:** Fairness here = *sameness* (docs `02` §A). Everyone gets the identical, per-step-solvable board. If a player paints themselves into a corner over many hands, that is a **legitimate skill loss** — the only fair contract for a leaderboard. Rescuing long-term bad play would make scores incomparable.
- **Strength / cost:** absolute per-hand; zero global promise; zero extra cost.

### 4.2 Fair (Chapters 2–4)

- **Guarantee:** per-hand safety **+ pressure dial** biasing small/flexible pieces as fill rises. This *statistically* suppresses corner-painting but makes **no hard global promise**.
- **Strength / cost:** losses are possible but rare and **legitimate** (the player had outs every hand). Cost: the pressure multipliers only (already in generation).

### 4.3 Guided (Chapter 1, the "un-losable early" promise)

Per-hand safety is **insufficient** for the 45–65 "never feels screwed" bet. Guided adds two mechanisms on top:

1. **Rescue rule (drain guarantee).** When `fill ≥ F_rescue` **[OPEN — e.g. 0.72]**, `generate` must return a hand that is not merely *safe* but **clearing**: ∃ a play sequence that clears ≥1 line. Implementation: extend `handIsSafe` to `handCanClear(board, H)` (same DFS, success condition = "some placement in the witness triggers a line-clear"), and bias `rollHand` toward gap-fill/line-completing pieces until one passes. This means whenever the board gets dangerous, the *very next hand can drain it*.
2. **Fill ceiling via lookahead (belt-and-suspenders).** Reject any tray whose **minimum achievable end-of-hand fill** (computed by the same bounded DFS, minimizing residual fill over safe sequences) exceeds `F_cap` **[OPEN — e.g. 0.80]**; re-roll toward clearing hands. This gives Guided a **monotone fill ceiling**: the board can never ratchet into the density band where force-death is topologically possible.

- **Strength of the guarantee (stated honestly):** rescue + ceiling make force-death by no-moves **practically impossible** in Guided, but I do **not** claim a first-principles proof that a clearing hand *always* exists for every conceivable board at `F_rescue` (adversarial jagged boards could resist). Instead the guarantee is **enforced at runtime** (rescue + ceiling) and **certified empirically** by the harness: **zero Guided no-moves losses over N ≥ 1e6 games** (§7). If the harness ever finds one, lower `F_cap` / raise rescue aggressiveness — the thresholds are the tuning knob. This matches the docs' "prove it with tests, not a bounded retry loop" philosophy (`01` end, `02` §E).
- **Cost:** each Guided hand at high fill runs one extra bounded DFS (`handCanClear` / min-fill), same `O(E³)` envelope as `handIsSafe`. Negligible (once per tray, only above `F_rescue`).

**Summary of the per-mode guarantee ladder:**

| Mode | Per-hand safety | Global winnability mechanism | Losable? |
|---|---|---|---|
| Seeded | ✓ always | none (sameness is the fairness) | yes — legitimate skill loss |
| Fair | ✓ always | pressure dial (statistical) | yes — rare, legitimate |
| Guided | ✓ always | rescue rule + fill ceiling (certified by harness) | effectively no (early game) |

---

## 5. HARD PROBLEM B — Non-death ≠ goal-achievable

**The trap (the real fairness risk on budgeted levels):** solvability guarantees you can *place a piece*; it does **not** guarantee the level's **goal** is reachable within the move/tide budget. "6 lines in 10 moves" (Efficiency), "5,000 pts in 12 moves" (Score), "survive 4 rises" (Survival) can each be *unwinnable within budget* on a board that is perfectly safe every hand. A player who can always place but can never *win* feels screwed — worse, they feel screwed on a level we authored.

### 5.1 The goal-achievability property (two levels)

> **Feasibility (existence).** Level `L` from seed `s` is *feasible* iff ∃ a legal play sequence within its move/tide budget that reaches `target`. A property of `(L, s)`.
>
> **Attainability (skill-calibrated).** `L` is *attainable* iff the **reference bot at the intended skill tier** reaches `target` within budget with first-try win-rate ≥ the chapter band **[OPEN — e.g. Ch1 ≥ 0.90]** (docs `04` §E). Feasibility says a god-player *could* win; attainability says the *target* player *reliably does*.

Both are required. Note **Survival is self-guaranteeing**: `_tideRises` accrues on real upward integer crossings and never decreases (proto L1273-1276; docs `01` tide section) — every survive target is reachable by construction, so Survival needs only attainability pacing, not a feasibility solver.

### 5.2 Enforcement — content pipeline, not tray-gen

The engine does **not** dynamically guarantee goal-achievability (it can't, without solving the level live). It is certified **before ship / before serving**:

- **Authored voyage levels:** the difficulty scorer + sim harness (docs `04` §E) gate every level in CI. For each level: run the existence-solver (bounded search / the optimizing bot) to confirm feasibility, and run the reference bot N times to confirm attainability within the chapter band. **Reject or retune** any level whose `budgetSlack = moveLimit − medianMovesToWin` is negative or whose bot win-rate is out of band. Budgets are set as `moveLimit = ceil(medianMovesToWin × (1 + slackFactor))`, `slackFactor` per chapter **[OPEN — generous early, e.g. Ch1 ≥ 0.6]**. This is where README §6's "quantify the generous move limit" gets answered: **derive it from simulation, don't guess.**
- **Daily Tide (Seeded) — the sharp case.** Because the board is identical for all, feasibility must hold for that **one** seed. Use a **deterministic seed-vetting loop**:

```
function dailySeed(dateStr, budget):
    for salt in 0,1,2,...:                       # deterministic, published order
        s = seedFromDate(dateStr) ⊕ mix(salt)
        if referenceBotWins(dailyLevel, s, budget, skillTier):   # feasibility + attainability
            return s                              # first passing seed = today's board
```

  Everyone computes the same `salt` (the vetting is deterministic), so the board stays identical **and** is provably winnable within its (generous) budget by the target player. This preserves Daily sameness while eliminating "the daily is impossible today."

**Bottom line:** safety floor (§2) removes force-death; goal-achievability (§5) is a **separate, simulation-certified property** enforced at authoring time and at daily-seed-selection time. Conflating them is the mistake; keeping them separate is the fix.

---

## 6. What to lift vs. replace (fairness surface)

| Lift as-is | Replace / add |
|---|---|
| `mulberry32` PRNG math, `seedFromDate` FNV-1a | Expose `getState()`; **replace XOR-on-resume with state rehydration** (§1.4) |
| Pressure multipliers, no-flood, gap-fill *shape* logic | `challengeLevel<10` cutoff & `0.55` const → `assistLevel` curve; **validate** hands with `handIsSafe` |
| `_tideRises` crossing semantics (never lose progress) | **Persist `tideRises`/`prevTideFloor`** in snapshot (proto bug) |
| Obstacle spread rule ("no line pre-loaded near completion", proto L806-807) | Route obstacle seeding through the injected stream in all modes |
| Per-piece `fitsAnywhere` (keep as a fast pre-filter) | **3-piece `handIsSafe` DFS** as the real guarantee; bounded fallback |
| — | Rescue rule + fill ceiling (Guided); goal-achievability solver + daily seed-vetting |

---

## 7. Property tests that PROVE fairness (spec only)

The QA specialist implements the bot; **this section fixes the invariants it must assert** and the legit-vs-unavoidable classifier.

### T1 — Determinism golden-master
For a fixed seed set, `newGame(seed)` + a fixed scripted move sequence produces an **event-stream hash** equal to a committed golden value. Run cross-engine (Node + browser) to confirm integer-exactness. Gate: hash mismatch = fail.

### T2 — Resume-equivalence (proves `resume == fresh play`)
For random seeds and random turn `T`: (a) play continuously to move `M`; (b) play to `T`, `snapshot()`, `restore()`, play to `M`. Assert **identical event streams and final state** for the `[T, M]` tail. This is the test that would have **caught the prototype's XOR bug** and the unpersisted `tideRises`.

### T3 — Zero unavoidable deaths (hard gate, all modes)
Headless bot plays N per mode (**N ≥ 1e6 Guided [OPEN]**, ≥1e5 Fair/Seeded). On every `lost` event the classifier (below) runs; **count(unavoidable) must be 0**.

### T4 — Solvability-floor invariant
On **every** tray generation, assert: *if any safe hand exists for the current board, the served hand is safe* (`handIsSafe == true`, or the board is genuinely terminal — `E < min piece need`). Checked inline during T3 playthroughs, not just at losses.

### T5 — No-flood invariant
No Guided/Fair tray contains three pieces each with ≥4 cells. Assert per tray.

### T6 — Goal-achievability (per authored level & per shipped daily seed)
Existence-solver confirms ∃ winning line within budget; reference bot win-rate within chapter band (§5). Gate in CI before ship; daily seed-vetting (§5.2) enforces it at runtime.

### T7 — Survival monotonicity
`tideRises` never decreases across a run; survive progress is never lost (proto semantics). Assert over tide-mode playthroughs.

### The bot design (high level — QA specialist details it)
Two agents over the same seeds: a **reasonable heuristic AI** (greedy line-completion + keep-board-flat, tuned per chapter skill tier) for attainability/win-rate bands, and a **random-legal-move baseline** for stress-testing the safety floor (a random player must still never hit an *unavoidable* death). The bot logs, per game: every tray (board snapshot + shapes), every placement, and the terminal cause.

### LEGITIMATE loss vs UNAVOIDABLE death — the exact classifier

On a `lost` (reason `no-moves` or `drowned`), reconstruct the last tray-generation:

- **UNAVOIDABLE DEATH (bug — must be zero):** at the last tray-gen, a safe hand *existed for that board* (∃ tray the generator could have produced with `handIsSafe==true`) **but the generator served an unsafe one**, and the player then had no legal first placement. Formally: `boardWasNotTerminal(B_lastgen) ∧ servedHand not safe`. This is a generation failure (§2 forbids it). Also unavoidable: any **Guided** `no-moves` loss whatsoever (§4.3 rescue+ceiling forbid it) — flag as bug regardless of board.
- **LEGITIMATE loss:** any of —
  - **(L-a) Player agency:** the served hand *was* safe (had a witness sequence) but the player chose a placement/order that dead-ended. Detected by: replay shows an alternative legal choice at some earlier step avoided death.
  - **(L-b) Terminal board (Fair/Seeded only):** the board reached a density where **no** tray is safe (`E < min piece need`, no safe hand exists for any hand), and the player's own prior placements produced it. Legitimate skill loss. **Never legitimate in Guided.**
  - **(L-c) Budget exhaustion on a goal-achievable level:** ran out of moves though a winning line existed within budget (T6 passed). Legitimate for Efficiency/Score — safety ≠ goal (§5). Design keeps Guided budgets generous so this is ~absent early.

The gate: **unavoidable count = 0** across all N games; legitimate losses are allowed and must fall within the chapter's designed win-rate band.

---

## 8. Open thresholds for the product owner

- `RETRY_CAP` re-rolls before fallback (proposed 8).
- `F_rescue` (Guided drain trigger, proposed 0.72) and `F_cap` (fill ceiling, proposed 0.80).
- Chapter win-rate bands (proposed Ch1 ≥ 0.90, tapering) and `slackFactor` per chapter for move budgets (proposed Ch1 ≥ 0.6).
- Pressure-dial fill thresholds (prototype 0.60 / 0.78) — keep or retune.
- Whether **Blitz is ranked** (drives whether Blitz must be seeded).
- Sim counts `N` per mode for the zero-death gate.
- Pressure/gap-fill `assistLevel` curve shape (co-owned with Game Systems Designer; docs `02` §C).
