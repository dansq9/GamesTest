# 11 · Dynamic Difficulty Adjustment (DDA) System

> **Owner:** Engine Engineer + Game Systems Designer.
> **Scope:** player-adaptive difficulty — the system that makes the game feel "just right" for
> each individual player, regardless of skill level. **Logic only, no UI.**
> **Reads against:** `01 §3` (assist-fade curve), `01 §3b` (pressure dial), `02 §6` (`GenContext`),
> `03 §4.3` (Guided rescue rule), `06` (persona: invisible help, no frustration walls),
> `07 §1` (CasualBot calibration), `07 §3` (difficulty loop).
> **Governing principle:** for 45–65 cozy-casual, dominating IS the experience. The DDA makes
> struggling players feel competent, and lets cruising players cruise. It never punishes success.
> **Convention:** every invented number is tagged **[OPEN — product owner]** with a recommendation.

---

## 0. Why DDA matters for this audience

The spec's authored difficulty curve (`01`) is tuned for a *median* casual player. But the 45–65
audience has enormous skill variance — a retired engineer who plays 2 hours/day and a grandmother
who picks up puzzle games for the first time are both in our target. A fixed curve optimized for the
median bores the strong players and walls the weak ones. The weak ones are exactly who churns.

**What competitors do:** Block Blast's DDA (detecting frustration patterns, adjusting block generation
per-session, activating "God Mode" after consecutive losses) is the engineering feature that separates
it from hundreds of clones. It's why a wide skill range all feel like the game is "just right."

**What we build:** a DDA layer that modulates the *existing* assist dials (gap-fill, pressure, rescue)
based on per-player behavioral signals. No new mechanics — just making the dials adaptive instead of
static. The architecture is already wired for this: `GenContext` accepts `gapFillProb` and `pressure`
parameters, `TrayGenerator` uses them. We add a `PlayerProfile` that feeds those parameters.

---

## 1. The player model — four signals, no server required

All signals are persisted locally in `PlayerProfile` (alongside existing `pearls`, `streakCount`, etc.).
They are **inputs to the DDA, never exposed to the player.** No server roundtrip needed.

```ts
interface PlayerProfile {
  recentWinRate: number;    // rolling win rate over last N=10 level attempts (0.0–1.0)
  avgSlack: number;         // rolling average of finishing slack (moves remaining / tide headroom)
  lossStreak: number;       // consecutive level failures; resets to 0 on any win
  sessionClears: number;    // lines cleared this session; engagement/flow signal
}
```

**Update rules:**

| Signal | On win | On loss | On session start |
|---|---|---|---|
| `recentWinRate` | `= (recentWinRate * (N-1) + 1) / N` (toward 1.0) | `= (recentWinRate * (N-1) + 0) / N` (toward 0.0) | unchanged |
| `avgSlack` | `= lerp(avgSlack, currentSlack, 0.2)` | unchanged (losses have no slack) | unchanged |
| `lossStreak` | `= 0` | `+= 1` | unchanged |
| `sessionClears` | `+= linesCleared` | unchanged | `= 0` |

`N = 10` **[OPEN — product owner]** (the rolling window). Smaller = faster adaptation, more volatile.
`currentSlack` = `moveLimit - movesUsed` for move-limited levels, `8 - maxTide` for survive levels,
0 otherwise.

---

## 2. The three adaptive dials

### 2.1 Gap-fill probability (extends `01 §3`)

The authored gap-fill curve (`01 §3a`) decays from 0.60 to 0 by L13. After L13, the DDA can
**reintroduce a small gap-fill** for struggling players:

```
if (recentWinRate < 0.50 || lossStreak >= 2):
    gapFillBoost = 0.15 * (1 - recentWinRate)   // max +0.15 at 0% win rate
else:
    gapFillBoost = 0.0

effectiveGapFill = max(authoredGapFill, gapFillBoost)
```

**[OPEN — product owner]:** boost ceiling 0.15 (recommend); decay rate.

**What this means:** a player with a 30% recent win rate gets ~0.105 gap-fill probability — roughly
1 in 10 hands has a helpful piece slotted in. Invisible, consistent with the existing suppression
rules (skip-if-finisher-exists, cooldown 1 hand, per-level cap 40%, `01 §3d`). A player at 60%+
win rate gets zero boost — the authored curve is working fine for them.

### 2.2 Pressure dial (extends `01 §3b`)

The authored pressure dial `s_p` is a fixed per-chapter value (1.00 / 0.75 / 0.55 / 0.40-floor).
The DDA modulates it around the authored value:

```
targetWinRate = chapterWinRateTarget   // from 01 §4: Ch1=0.92, Ch2=0.85, Ch3=0.76, Ch4=0.68
pressureAdjust = clamp(recentWinRate - targetWinRate, -0.15, +0.10)
effectivePressure = clamp(s_p + pressureAdjust, 0.30, s_p + 0.10)
```

**[OPEN — product owner]:** adjustment range (-0.15 / +0.10), floor 0.30.

**Asymmetric by design:** the softening range (-0.15) is larger than the tightening range (+0.10).
For cozy: we help more than we challenge. A player who is winning 95% of the time gets a *gentle*
pressure bump (+0.10 max), never a wall. A player at 50% win rate gets meaningful softening (-0.15).

### 2.3 Comfort mode (our "God Mode" — after loss streaks)

```
if (lossStreak >= 3):
    comfortMode = true
    // Override: gapFillBoost = 0.25, effectivePressure = floor (0.30)
    // The next attempt is maximally assisted (within solvability rules)
```

**[OPEN — product owner]:** trigger threshold 3 consecutive losses (recommend); max-assist values.

**How this differs from Block Blast's God Mode:**
- We **never make it harder after she dominates.** Block Blast ramps difficulty to "keep challenge steep"
  — that's an engagement-extraction move. For 45–65, dominating IS the experience. If she's cruising,
  we let her cruise. The gentle pressure-dial bump (§2.2, max +0.10) is the most we do.
- Comfort mode is **invisible** — same board, same rules, just friendlier piece distribution. She wins,
  the streak resets, she feels competent again.
- Comfort mode **respects the same solvability contract** as everything else. `handIsSafe` still runs.
  The rescue rule still applies. The floor is safety, not a scripted win.

---

## 3. Mode interactions — what DDA does and doesn't touch

| Mode | DDA active? | Rationale |
|---|---|---|
| **Guided (casual voyage)** | **Full DDA** | The primary mode for the target audience. Full adaptation. |
| **Fair** | **DDA active, gentler ceiling** | Still adapts, but the boost ceiling is halved (e.g. max gapFillBoost = 0.08). Fair players opted for more challenge. |
| **Seeded (Daily/ranked)** | **DDA OFF** | All players see identical boards. DDA parameters frozen to neutral (0 boost, authored pressure). Leaderboard integrity requires it. |
| **Endless/Blitz** | **DDA active** | These are casual modes; adaptation helps session length. |

---

## 4. Integration with existing architecture

The DDA layer slots into the existing tray generation pipeline with minimal changes:

```
// In engine, before tray generation:
const ddaContext = computeDDA(playerProfile, levelDef, chapterTargets);

const genContext: GenContext = {
  fairness: levelDef.mode,
  fillPct: board.fillPct(),
  assist: {
    gapFill: Math.max(authoredGapFill, ddaContext.gapFillBoost),
    pressure: ddaContext.effectivePressure,
    solvabilityFloor: true,   // always on, never touched by DDA
  },
  rng: rng,
  guardrails: { noFlood: true, maxBigPerHand: 2 },
  library: PIECES,
};
```

**What changes in `GenContext`:** nothing structurally. The `assist.gapFill` and `assist.pressure`
fields already exist (`02 §6`). The DDA computes them from the player profile instead of from static
authored values. The generator doesn't know or care where the numbers came from.

**State persisted:** `PlayerProfile` is saved alongside the existing player state. It is NOT part of
`GameState` (which is per-game) — it's per-player, lives in the same persistence layer as `pearls`,
`streakCount`, `ownedCosmetics`.

**Determinism preserved:** DDA parameters are computed *before* tray generation and injected into
`GenContext`. Same seed + same DDA state = same board. The DDA does not draw from the game's RNG
stream — it reads `PlayerProfile` (a pure function of past game outcomes) and produces static numbers.

---

## 5. Sim validation

### 5.1 Authored-curve certification (unchanged)

The QA bot runs with **DDA OFF** (neutral profile) to certify authored difficulty. This is the
existing G9/T-BAND run. It validates that the level table itself is sound.

### 5.2 DDA-validation pass (new)

A separate sim pass runs the bot with **synthetic player profiles** to verify adaptation stays in bounds:

| Profile | `recentWinRate` | `lossStreak` | Expected behavior |
|---|---|---|---|
| **Struggling** | 0.30 | 3+ | Comfort mode activates; win rate should rise to ≥60% within 3 attempts |
| **Median** | 0.70 | 0 | Minimal/no DDA effect; win rate stays in chapter band |
| **Strong** | 0.95 | 0 | Gentle pressure bump; win rate drops by ≤5pp (never a wall) |
| **Recovering** | 0.50→0.80 | 0 | DDA gracefully fades as player improves; no sudden difficulty spike |

**DDA validation gate — G16 (WARN-tier) [OPEN]:**
1. Struggling profile reaches comfort mode within 3 losses (by definition).
2. Comfort mode win rate ≥ 75% (the boost actually helps).
3. Strong profile win rate never drops below `chapterTarget - 5pp` (never punitive).
4. No profile sees a gap-fill boost > 0.25 outside comfort mode.
5. DDA effect is monotone in win rate (lower win rate = more help, never inverted).

---

## 6. What the DDA is NOT

- **Not machine learning.** It's four tracked signals and three simple formulas. The engineering value
  is in *tuning the response curves*, not in model complexity.
- **Not predictive.** It reacts to measured outcomes (win/loss, slack), not to inferred emotional state.
  "Frustration detection" is marketing language for "you lost 3 times in a row."
- **Not punitive.** It never makes a cruising player's life harder in any meaningful way. The max
  pressure bump (+0.10) is subtle — slightly fewer gimme pieces, slightly more variety. The asymmetry
  (help more, challenge less) is deliberate.
- **Not visible.** The player never knows the DDA exists. No "easy mode" label, no "we noticed you're
  struggling" message. The board just feels right.

---

## 7. Build order

- **E0–E2 (skeleton/determinism):** no DDA. Build the static assist curve from `01 §3`.
- **E3 (content):** add `PlayerProfile` tracking (4 fields, updated on win/loss).
- **E4 (tuning):** wire the three DDA formulas into `GenContext`. Run the DDA-validation sim pass.
- **E5 (polish):** tune response curves against real playtest data. The sim gives the initial fit;
  playtesting gives the final calibration.

The DDA is ~200 lines of logic on top of the existing tray generation pipeline. It does not touch
the scoring formula, the solvability guarantees, the determinism contract, or any game rule.
