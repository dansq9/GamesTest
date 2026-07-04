# Rising Tide — Full Build Brief

> A self-contained brief for Claude Code to design, architect, and build the Rising Tide
> block puzzle from scratch. Read this entire document before writing any code.

---

## Part 1: What This Is

### The elevator pitch

**Rising Tide** is a block puzzle game where you place polyomino pieces onto an 8×8 grid to clear complete rows and columns — like Block Blast, 1010!, or Woodoku. What makes it different: a **rising water mechanic** that turns the familiar relaxation loop into a tense survival challenge.

But here's the design insight: **the tide is NOT the default mode.** The game ships with two modes:

- **Zen Mode** — Pure, relaxing, infinite block puzzle. No water. No fail pressure. No clock. The player's only enemy is running out of space. This is the retention core that captures the mass casual audience.
- **Daily Tide Mode** — Same grid, same pieces, but water rises from the bottom with every placement. Clear lines to push it back. Drown = game over. Everyone gets the same deterministic piece sequence each day (daily seed). One attempt per day. This is the shareable, competitive, daily-ritual layer.

The game is positioned as **"the arcade cousin of Block Blast"** — it respects what makes block puzzle the most durable mobile genre (zen, clarity, no-pressure decompression) while adding a differentiated spicy mode that generates drama, shareability, and a daily reason to return.

### The core loop

```
[Open app]
    → [Choose: Zen or Daily Tide]
        → [See 3 pieces in tray]
            → [Drag a piece onto the 8×8 grid]
                → [If complete row/column: clear it, score points]
                → [If Tide mode: water rises slightly]
                → [If line cleared in Tide: water drops back]
            → [When all 3 placed: new tray of 3 appears]
        → [Game over: no valid placement (Zen) / water reaches top (Tide)]
    → [See score, streak, share card]
    → [Tomorrow: new Daily Tide seed → return]
```

### What players feel

- **Zen Mode:** The same "one more set of pieces" meditative flow that makes Block Blast a 70M DAU game. Clarity. Satisfaction on line clears. No anxiety. Sessions end when the player decides to stop (or gets stuck after 5–15 minutes).
- **Daily Tide:** Mounting tension as water creeps up. Relief and triumph on multi-line clears that push it back. The near-death "one row from drowning" moments that create the emotional peaks worth sharing. A 3–5 minute intense daily ritual.

---

## Part 2: Why We're Building This

### The market opportunity

Block puzzle is the single most downloaded mobile game category on earth. Block Blast alone: **~870 million lifetime downloads, 368M in 2025, #1 most-downloaded game worldwide in both 2024 and 2025, ~70M DAU, ~$600K–$1M/day in ad revenue** (sources: Udonis, MAF, BusinessWire, PocketGamer.biz). The category works because it's simple, relaxing, rewarding, and infinitely replayable.

**No mainstream casual block puzzle ships a rising-flood loss mechanic.** Rising pressure exists in competitive Tetris (garbage rows) but has never been transplanted into the casual drag-and-place grid-fit category. This is a genuine whitespace finding — a mechanical differentiator in a category that prints money.

### Why the dual-mode design

Our red-team analysis identified the fatal flaw in "tide as core": **the rising water fights the exact motivation that makes block puzzles durable.** The genre's audience (older, casual, session-as-decompression) retains because there is zero fail pressure and no clock. A rising flood converts a wind-down toy into an anxiety loop and self-selects out the largest, stickiest audience.

**The fix:** Quarantine the tide to a daily challenge mode. Ship zen mode as the default — the mass retention engine. The tide becomes the spicy, shareable, seed-based ladder variant that provides:
- A daily reason to return (ritual)
- A shareable score (organic growth)
- A dramatic creative for ads (UA)
- A competitive leaderboard (engagement)

Without poisoning the zen mode's retention.

### Why this concept ranks #2 overall (and #1 for paid UA)

Across three independent stress-test panels:

1. **UA/Creative panel:** Rated C2 the **highest honest-CTR concept** in the entire portfolio (4.5–7% estimated). It's the only concept that honestly stacks failure-bait (drowning) + oddly-satisfying (multi-line clear + water drop) + near-miss (survive by one row) + progress-power (push the tide back). Block puzzle is a proven, algorithm-legible category for ad networks.

2. **Whitespace panel:** The base genre is CROWDED — but the tide twist is unclaimed. No one owns "block puzzle with survival pressure" on mobile.

3. **Red-team panel:** Rated STRONG WITH FIX (tide quarantined to daily/challenge mode). The fix is what makes it viable.

### Why it's buildable

- **Turn-based, discrete, grid-based** — no physics, no realtime, no continuous simulation
- **Pure state machine** — grid is an 8×8 array of booleans, pieces are coordinate lists, tide is a float
- **No authored content** — piece sequences are procedurally generated; no level design, no art pipeline, no narrative
- **No backend** — daily seed derived from epoch day; leaderboards via Play Games Services (free); all logic client-side
- **No art assets beyond geometric shapes** — rounded squares, gradient water, particles
- **The game-feel challenge is real but bounded** — block puzzle retention lives in feel (clear cascade, haptic thunk, particle payoff), and this needs genuine polish, but it's achievable in Compose Canvas with careful attention

### The "tier 2" business case

We're not trying to be Block Blast. We're building a sustainable tier-2 game:

| Metric | Block Blast (tier 1) | Our target (tier 2) |
|--------|---------------------|---------------------|
| DAU | 70M | 100K–500K |
| Revenue | $600K–$1M/day | $500–$3,000/day |
| Downloads | 870M lifetime | 2–10M lifetime |
| Team | 50+ people | 1 founder + AI + 3-person team |
| UA spend | Millions/month | $2–10K/month |

At 200K DAU with 3+ sessions/day, honest IAA monetization (rewarded video primary, capped interstitials), and a $0.10–0.20 ARPDAU, that's $20K–40K/month. A real business that doesn't require competing with Hungry Studio's budget.

### The validation path

Before investing 6 weeks of build:

1. **$150–300 concept-footage CTR test** — animate a flooding block board (15-second clip: near-death → multi-line clear → water crashes down → cliffhanger). Run as a Google/Facebook video-view campaign targeting T3 Android.
2. **Kill bar: <4% CTR = do not build.** ≥4% = greenlight. ≥6% = aggressive invest.
3. Block puzzle creatives are the easiest in the portfolio to produce pre-build (it's just colored blocks and water — no characters, no narrative, no complex mechanics to explain).

---

## Part 3: What to Deliver

### Technical stack

| Layer | Technology |
|-------|-----------|
| Language | Kotlin |
| UI framework | Jetpack Compose (Material3 for chrome) |
| Game rendering | Compose Canvas (custom `DrawScope` for board, pieces, water, particles) |
| State management | ViewModel + StateFlow |
| Persistence | DataStore (Preferences) |
| Audio | SoundPool (short SFX) |
| DI | Manual (or Hilt if complexity warrants) |
| Testing | JUnit + Compose UI testing |
| Build | Gradle (KTS), single-module for v1 |
| Min SDK | 24 (Android 7.0) |
| Target | Portrait-only, phone-optimized |
| APK size target | ≤15MB (no large assets — everything is drawn) |

### What is NOT in scope

- No game engine (Unity, Godot, LibGDX)
- No landscape mode
- No tablet-specific layouts (phone-first, scales up naturally)
- No piece rotation (pieces placed as-shown, like Block Blast)
- No gravity/falling (static grid — pieces stay where placed)
- No color-matching or match-3 mechanics (purely line-completion)
- No multiplayer, chat, guilds, friends list
- No accounts or login (Play Games optional, never required)
- No tutorial overlay in v1 (game should be self-evident from first touch)
- No settings screen in v1 (sound on/off toggle in the HUD is sufficient)
- No backend server whatsoever
- No third-party analytics SDK in the initial build (Firebase comes later via the team)
- No actual AdMob integration (placeholder buttons that log — team handles real SDK)

---

### Game Design Specification

#### The Grid

- **8×8 cells** (tighter than 10×10 → faster decisions, more dramatic near-misses, shorter sessions)
- Each cell: empty or filled (with a color tag from the piece that filled it)
- No gravity — filled cells never fall or shift after line clears
- Visual: thin grid lines on a dark navy background; cells are rounded squares with slight inner shadow

#### Piece Definitions

Pieces are polyominoes (connected cells). The set:

```
// Monomino (1 cell)
■

// Dominoes (2 cells)
■■          ■
            ■

// Triominoes (3 cells)
■■■         ■          ■■         ■■
            ■           ■        ■
            ■

// Tetrominoes (4 cells)
■■■■        ■■         ■■          ■         ■
            ■■          ■         ■■         ■■
                        ■                     ■

// Pentominoes (5 cells) — use sparingly for difficulty
■■■■■       ■■■        ■■
             ■■         ■■
                         ■

// Large squares
■■          ■■■
■■          ■■■
            ■■■
```

Exact set (as coordinate offsets from origin):

| Name | Cells | Frequency weight |
|------|-------|-----------------|
| dot_1x1 | (0,0) | 5 |
| line_1x2 | (0,0)(1,0) | 8 |
| line_1x3 | (0,0)(1,0)(2,0) | 10 |
| line_1x4 | (0,0)(1,0)(2,0)(3,0) | 6 |
| line_1x5 | (0,0)(1,0)(2,0)(3,0)(4,0) | 2 |
| col_2x1 | (0,0)(0,1) | 8 |
| col_3x1 | (0,0)(0,1)(0,2) | 10 |
| col_4x1 | (0,0)(0,1)(0,2)(0,3) | 6 |
| col_5x1 | (0,0)(0,1)(0,2)(0,3)(0,4) | 2 |
| square_2x2 | (0,0)(1,0)(0,1)(1,1) | 8 |
| square_3x3 | 3×3 filled | 3 |
| L_right | (0,0)(0,1)(0,2)(1,2) | 7 |
| L_left | (1,0)(1,1)(1,2)(0,2) | 7 |
| L_down | (0,0)(1,0)(2,0)(0,1) | 7 |
| L_up | (0,0)(1,0)(2,0)(2,1) | 7 |
| T_shape | (0,0)(1,0)(2,0)(1,1) | 6 |
| T_down | (0,0)(0,1)(0,2)(1,1) | 6 |
| S_shape | (0,0)(1,0)(1,1)(2,1) | 5 |
| Z_shape | (1,0)(2,0)(0,1)(1,1) | 5 |
| corner_2x2 | (0,0)(1,0)(0,1) | 7 |

All pieces also have rotated variants (90°, 180°, 270°) — but the player does NOT rotate them. The generator picks from the full variant pool. Each "piece" in the table above represents its canonical form; rotations are stored as separate entries in the pool with the same frequency weight.

#### Piece Tray

- 3 pieces visible at a time in a tray below the board
- All 3 must be placed before a new tray of 3 is dealt
- Pieces shown at ~60% of board-cell size in the tray (they scale up to full size when dragged)
- When a piece is dragged, it becomes semi-transparent on the board at the target position (preview snap)
- Invalid placement: piece shakes briefly and snaps back to tray
- When all 3 placed: brief delay (200ms), then new tray slides in from bottom

#### Piece Generation (seeded PRNG)

```kotlin
class PieceGenerator(seed: Long) {
    private val rng = Random(seed)
    
    fun nextTray(): List<Piece> {
        // Generate 3 pieces using weighted random selection
        // Constraint: at least one piece in each tray must be ≤ 3 cells
        //   (prevents impossible-to-place trays in early game)
        // No constraint on piece color — assign from palette round-robin
    }
}
```

For Daily Tide: `seed = "risingtide_daily_${epochDay}".hashCode().toLong()`
For Zen: `seed = System.nanoTime()` (random each session)

#### Line Clearing

- After EACH piece placement, check for complete rows and columns
- A row is complete when all 8 cells in that row are filled
- A column is complete when all 8 cells in that column are filled
- Multiple rows and/or columns can clear simultaneously from one placement
- Cleared cells are removed (set to empty) — remaining cells do NOT move
- Clear animation: cells shrink toward center (100ms) → particle burst outward → cells disappear
- Score awarded immediately on clear

#### Scoring System

```
Base points per cell cleared = 10
Lines cleared simultaneously = N

Score for a clear = N × N × (cells_cleared × 10)

Examples:
  1 line (8 cells):   1 × 1 × 80  =   80 points
  2 lines (16 cells): 2 × 2 × 160 =   640 points
  3 lines (24 cells): 3 × 3 × 240 = 2,160 points
  4 lines (32 cells): 4 × 4 × 320 = 5,120 points  (rare, deeply satisfying)

Consecutive-clear streak:
  If the last placement ALSO cleared a line, current_streak++
  Bonus per clear = streak × 50
  Streak resets to 0 on any placement that doesn't clear

Perfect tray bonus:
  If all 3 pieces in a tray each triggered at least one clear = +500 bonus
```

This scoring system creates the dramatic highs that make good clips: a 4-line simultaneous clear is 64× more valuable than a single line. The streak rewards forward-planning.

#### Tide Mode Mechanics

The tide is the core differentiator. It must feel physical and threatening.

**Tide state:**
```kotlin
data class TideState(
    val level: Float,          // 0.0 (no water) to 8.0 (game over)
    val riseRate: Float,       // rows per placement (escalates)
    val turnCount: Int,        // placements made this game
    val phase: TidePhase       // CALM, RISING, CRITICAL, DROWNING
)

enum class TidePhase {
    CALM,      // level 0–3: blue tint subtle, no urgency
    RISING,    // level 3–5: water visible, mild tension
    CRITICAL,  // level 5–7: screen edge pulses, audio intensifies
    DROWNING   // level 7–8: screen shakes, red warning, one wrong move = death
}
```

**Tide rise/fall rules:**

| Event | Tide change |
|-------|-------------|
| Piece placed (turn 1–30) | +0.5 rows |
| Piece placed (turn 31–60) | +0.75 rows |
| Piece placed (turn 61+) | +1.0 rows |
| 1 line cleared | −1.0 rows |
| 2 lines cleared simultaneously | −3.0 rows (1.5× per line) |
| 3 lines cleared simultaneously | −4.5 rows |
| 4+ lines cleared simultaneously | −(N × 1.5) rows |
| Sandbag RV used | −3.0 rows (once per game) |

**Tide cannot go below 0.** Excess reduction is lost.

**Game over:** When `tideState.level >= 8.0` after a piece placement and tide rise are resolved.

**Critical insight:** The tide makes multi-line clears DRAMATICALLY more valuable than in zen mode. In zen, a 2-line clear is a nice bonus. In tide, a 2-line clear is the difference between life and death. This creates the near-miss drama that makes the mode shareable and filmable.

#### Daily Seed System

```kotlin
object DailySeed {
    fun forToday(): Long {
        val epochDay = LocalDate.now().toEpochDay()
        return "risingtide_daily_${epochDay}".hashCode().toLong()
    }
    
    fun forDay(epochDay: Long): Long {
        return "risingtide_daily_${epochDay}".hashCode().toLong()
    }
}
```

- Daily Tide uses `DailySeed.forToday()` → all players worldwide get the same piece sequence
- One attempt per calendar day (midnight local time resets)
- If the player hasn't played today's daily, show a "NEW" badge on the Daily Tide button
- After completion, show the share card and lock the mode until tomorrow

#### Persistence

```kotlin
data class GameProgress(
    // Zen
    val zenHighScore: Int = 0,
    val zenGamesPlayed: Int = 0,
    val zenBestLinesInOneGame: Int = 0,
    
    // Daily Tide
    val tideHighScore: Int = 0,
    val tideBestDepth: Int = 0,          // highest turn count before drowning
    val tideCurrentStreak: Int = 0,      // consecutive days with a daily attempt
    val tideLongestStreak: Int = 0,
    val tideLastPlayedEpoch: Long = 0,   // epoch day of last daily played
    val tideTodayScore: Int = 0,         // today's result (for share card)
    val tideTodayDepth: Int = 0,
    
    // Monetization pacing
    val totalGamesPlayed: Int = 0,
    val lastInterstitialTimestamp: Long = 0,
    val sessionGamesPlayed: Int = 0,     // resets on app open
    
    // Lifetime stats
    val totalLinesCleared: Int = 0,
    val bestCombo: Int = 0,              // most lines in one clear
    val totalPiecesPlaced: Int = 0
)
```

Store in Jetpack DataStore (Preferences). No Room/SQLite needed for this simple flat state.

#### Monetization Skeleton

**Rewarded Video placements (player-initiated, never forced):**

1. **Sandbag (Tide mode only):** When tide ≥ row 5, a "🏖 Push Back" button appears in the HUD. Tap → watch RV → tide drops 3 rows. Once per game. After use, button disappears for the rest of that game.

2. **Undo (both modes):** After placing a piece, an "↩ Undo" button is visible for 3 seconds. Tap → watch RV → last piece removed, returned to tray. Once per game.

3. **Peek (both modes):** In the piece tray area, a "👁 Peek" icon. Tap → watch RV → next tray of 3 pieces shown as a ghosted preview for 5 seconds. Once per game.

4. **Retry (Tide mode only):** After game over, "🔄 Try Again" → watch RV → replay today's daily seed (same piece sequence from the start). Once per day.

**Interstitial placement:**
- Triggered between games (after game-over screen dismissed, before next game starts)
- **Never** on the first game of a session
- **Never** more than once per 3 minutes
- **Never** during gameplay
- Shows a skippable interstitial (or a static banner placeholder in v1)

**Remove-Ads IAP ($2.99):**
- Removes all interstitials permanently
- Does NOT remove rewarded video (those are opt-in and provide gameplay value)
- Persisted in DataStore + verified via Play Billing (team handles real integration)

**For the initial build:** All ad placements are placeholder — a modal that says "AD WOULD PLAY HERE" with a "Done" button that grants the reward. Real AdMob SDK integration is handled by the team later.

#### Share Card

After Daily Tide game-over, generate a text-based share card:

```
🌊 Rising Tide — Day 142
📊 Score: 3,840
🌀 Survived: 47 waves
💀 Tide reached: Row 7

🟦🟦🟦🟦🟦🟦🟦⬜  (7/8 filled = how far tide got)

Can you beat my score? Same puzzle for everyone today.
```

Copy-to-clipboard on tap. No image generation in v1 (text-only share is proven by Wordle to be sufficient for organic virality).

#### Mode Selection Screen

The app opens to a clean mode-selection screen:

```
┌─────────────────────────┐
│                         │
│      RISING TIDE        │  ← title + minimal wave animation
│                         │
│  ┌─────────────────┐    │
│  │   🧘 ZEN MODE   │    │  ← large button, calming color (teal)
│  │  No pressure.   │    │
│  │  Just blocks.   │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────────┐│
│  │  🌊 DAILY TIDE      ││  ← large button, intense color (coral)
│  │  Day 142 • NEW      ││  ← "NEW" badge if not played today
│  │  🔥 12-day streak   ││  ← streak if active
│  └─────────────────────┘│
│                         │
│  Best: 4,200 │ 🏆 52   │  ← high score, best depth
│                         │
└─────────────────────────┘
```

Minimal, two clear choices. No cognitive load. Player taps and is in the game within 1 second.

#### Game Screen Layout (portrait)

```
┌─────────────────────────┐
│ Score: 1,240  🔥3 combo │  ← HUD top bar
│ ══════════════════════  │  ← thin progress/turn indicator
├─────────────────────────┤
│                         │
│    ┌─┬─┬─┬─┬─┬─┬─┬─┐  │
│    │ │ │█│█│ │ │ │ │  │
│    ├─┼─┼─┼─┼─┼─┼─┼─┤  │  ← 8×8 grid
│    │ │█│█│█│ │ │ │ │  │       (takes ~60% of screen)
│    ├─┼─┼─┼─┼─┼─┼─┼─┤  │
│    │ │ │ │█│█│ │ │ │  │
│    ├─┼─┼─┼─┼─┼─┼─┼─┤  │
│    │ │ │ │ │ │ │ │ │  │
│    ├─┼─┼─┼─┼─┼─┼─┼─┤  │
│    │█│█│█│ │ │█│█│ │  │
│    ├─┼─┼─┼─┼─┼─┼─┼─┤  │
│    │█│█│ │ │█│█│█│ │  │
│  ≈≈│█│█│█│█│█│█│█│█│≈≈│  ← waterline (Tide mode only)
│  ≈≈│█│█│█│█│█│█│█│█│≈≈│  ← submerged rows (blue tint)
│    └─┴─┴─┴─┴─┴─┴─┴─┘  │
│                         │
├─────────────────────────┤
│                         │
│   [piece1] [piece2] [piece3]  │  ← piece tray (~25% of screen)
│                         │
│  👁Peek          ↩Undo  │  ← RV buttons (subtle, bottom corners)
│                         │
└─────────────────────────┘
```

In Tide mode, the sandbag button ("🏖 Push Back") appears in the HUD bar when tide ≥ 5.

#### Visual Design Language

**Color Palette:**

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep navy | #0F1B2D |
| Grid lines | Slate blue (subtle) | #2A3F5F |
| Cell empty | Transparent (shows grid line only) | — |
| Piece color 1 | Coral | #FF6B6B |
| Piece color 2 | Teal | #4ECDC4 |
| Piece color 3 | Amber | #FFE66D |
| Piece color 4 | Violet | #A855F7 |
| Piece color 5 | Lime | #84CC16 |
| Piece color 6 | Sky blue | #38BDF8 |
| Water (tide) | Gradient: #1E3A5F → #0EA5E9 (30% alpha at surface) | — |
| Danger pulse | Warm red | #EF4444 (pulsing alpha) |
| Text primary | White | #FFFFFF |
| Text secondary | Light slate | #94A3B8 |
| Score pop | Gold | #FBBF24 |

**Piece rendering:**
- Each piece gets one of the 6 colors (assigned round-robin from the palette by tray deal order)
- Cells are rounded rectangles (corner radius = 15% of cell size)
- Subtle inner shadow (2dp, bottom-right, black 20% alpha) gives depth
- When placed on grid, cells have a brief "land" animation (scale 1.05→1.0 over 100ms)

**Water rendering (Tide mode):**
- Horizontal gradient fill from grid bottom up to `tideLevel`
- The waterline itself: animated sine-wave displacement (amplitude 2dp, period = grid width, speed = 2 seconds/cycle)
- Submerged cells: piece colors tinted toward blue (blend 40% with #1E3A5F)
- Water surface: thin white line with 50% alpha, follows the sine wave
- As tide phase escalates: water opacity increases (CALM: 30%, RISING: 45%, CRITICAL: 60%, DROWNING: 75%)

**Animations & Juice:**

| Event | Animation |
|-------|-----------|
| Piece placed | Cells scale 1.05→1.0 (100ms ease-out) + light haptic tap |
| Line clearing | Cells shrink to center (150ms) → white flash → 8–12 small squares scatter outward as particles (300ms, gravity-affected) → cells disappear |
| Multi-line clear | Same but slower (200ms) + screen flash (white 10% overlay, 50ms) + stronger haptic + score number pops from center of cleared area with scale animation |
| Tide rises | Water level animates smoothly (300ms ease-in-out) per step |
| Tide pushed back | Water level drops with a "splash" particle effect at the new waterline + satisfying audio |
| Near-death (tide ≥ 6) | Screen edge vignette pulses red (1.5s cycle, 10%→25% alpha) |
| Game over (Tide) | Water rushes to fill the screen (500ms) → board "sinks" with a slight downward drift → fade to game-over overlay |
| Game over (Zen) | Last piece placement fails → board cells briefly pulse → "No moves!" text fades in → game-over overlay |
| Streak increment | Fire emoji 🔥 animates upward from streak counter (200ms) |
| High score beaten | Score text turns gold + scale pulse + confetti particles from top |

**Audio (SoundPool — short SFX, no music in v1):**

| Event | Sound character |
|-------|----------------|
| Piece placed | Soft "click" / wooden tap |
| Line clear (1) | Crisp "ding" / glass chime |
| Line clear (2+) | Ascending chime chord (pitch rises with combo count) |
| Tide rises | Low, quiet water lap (subtle, not every turn — every 3rd rise) |
| Tide pushed back | Satisfying "whoosh" / water drain |
| Near-death phase enter | Low drum/pulse (one shot, marks the transition) |
| Game over (drown) | Deep splash + muted low tone |
| Game over (zen) | Gentle descending chime |
| Piece snap-back (invalid) | Quick "nope" buzz |

Audio files: generate or source short (≤500ms) royalty-free SFX. If sourcing is complex, use Android's built-in `ToneGenerator` for placeholder tones and mark audio as a polish-pass item.

#### Drag-and-Drop Interaction

This is where game-feel lives or dies. Get this right:

1. **Tap a piece in the tray** → piece lifts (scale 1.0→1.1, shadow appears beneath)
2. **Drag** → piece follows finger with an offset (piece renders ABOVE finger, not beneath it, so the player can see where they're placing)
3. **Over valid position** → grid cells where the piece would land highlight (semi-transparent piece color, 40% alpha). Snap to nearest valid grid alignment.
4. **Over invalid position** → no highlight; piece tints slightly red
5. **Release over valid position** → piece drops into place (scale 1.1→1.0, satisfying "thunk")
6. **Release over invalid position** → piece animates back to tray slot (200ms spring animation)
7. **Quick-tap (without significant drag)** → piece stays selected; tap a valid grid position to place it there (accessibility alternative to drag)

**Finger offset:** When dragging, render the piece so its center is ~40dp above the touch point. This ensures the player's finger doesn't occlude the placement target.

**Grid snap:** While dragging over the grid, the piece should snap to the nearest grid-aligned position (not smooth floating). This communicates valid placements clearly.

---

### Architecture

```
app/src/main/java/com/risingtide/
├── model/
│   ├── Piece.kt                 — Piece data class (cells: List<Offset>, color: PieceColor)
│   ├── PieceDefinitions.kt      — All piece shapes + their rotation variants + frequency weights
│   ├── PieceGenerator.kt        — Seeded PRNG, weighted selection, tray constraint (≥1 small piece)
│   ├── Grid.kt                  — 8×8 state, placement validation, line detection + clearing
│   ├── TideEngine.kt            — Tide rise/fall logic, phase calculation, game-over check
│   ├── Scoring.kt               — Score calculation, combo tracking, streak, high-score check
│   └── DailySeed.kt             — Epoch-day-based deterministic seed generation
├── game/
│   ├── GameState.kt             — Sealed class: Playing, GameOver, Paused
│   ├── GameMode.kt              — Enum: ZEN, DAILY_TIDE
│   └── GameEngine.kt            — Orchestrates: place piece → check lines → update tide → check game-over
├── viewmodel/
│   ├── GameViewModel.kt         — Drives game loop, exposes StateFlow<UiState>
│   └── HomeViewModel.kt         — Streak, daily status, high scores for mode-select screen
├── ui/
│   ├── theme/
│   │   ├── Color.kt             — Palette definitions
│   │   ├── Type.kt              — Typography
│   │   └── Theme.kt             — Material3 theme wrapper
│   ├── home/
│   │   └── HomeScreen.kt        — Mode selection (Zen / Daily Tide)
│   ├── game/
│   │   ├── GameScreen.kt        — Main game Compose screen (orchestrates below)
│   │   ├── BoardCanvas.kt       — Custom Canvas: draws grid, placed cells, tide water
│   │   ├── PieceTrayRow.kt      — Tray of 3 pieces, handles drag initiation
│   │   ├── DragOverlay.kt       — Full-screen overlay for piece being dragged + grid preview
│   │   ├── HudBar.kt            — Score, combo, streak, sandbag button
│   │   ├── TideIndicator.kt     — Visual tide-level indicator (side bar or in-grid)
│   │   └── GameOverOverlay.kt   — Score summary, share button, RV buttons, restart/home
│   ├── components/
│   │   ├── ScorePopAnimation.kt — Floating score number that pops and fades
│   │   ├── ParticleEffect.kt    — Reusable particle system (line-clear bursts)
│   │   └── WaveAnimation.kt     — Sine-wave water surface animation
│   └── navigation/
│       └── NavGraph.kt          — Simple: Home ↔ Game (with mode argument)
├── persistence/
│   ├── GameProgress.kt          — DataStore-backed persistence for all state
│   └── PreferencesKeys.kt       — DataStore key definitions
├── audio/
│   └── SoundManager.kt          — SoundPool wrapper, preloads SFX, play-by-event
└── ads/
    └── AdPlaceholder.kt         — Placeholder ad manager (logs + grants reward; team replaces later)
```

#### Key Design Decisions

1. **GameEngine is a pure function layer** — no Android dependencies. Takes `(currentGrid, piece, position)` → returns `(newGrid, linesCleared, newTide, score, gameOver)`. Fully unit-testable without any UI.

2. **One ViewModel per screen** — `GameViewModel` holds the game loop and emits `StateFlow<GameUiState>`. The Compose UI is a pure function of state. No game logic in the UI layer.

3. **Canvas draws everything game-related** — the grid, pieces, water, particles. Material3 Compose is only for the HUD, dialogs, and navigation chrome. This separation keeps game rendering performant (Canvas is hardware-accelerated) and game logic testable.

4. **Drag state is UI-local** — the ViewModel doesn't know about drag position. The `DragOverlay` composable tracks touch state and only calls `viewModel.placePiece(piece, gridPosition)` on drop. This keeps the ViewModel clean.

5. **Single-module** — no multi-module architecture for v1. It's one game. Optimize for build speed and simplicity.

---

### Build Order (priority sequence)

**Phase 1: Core Logic (no UI) — aim for 100% unit test coverage here**

1. `Piece.kt` + `PieceDefinitions.kt` — define all shapes, rotations, colors
2. `Grid.kt` — 8×8 state, `canPlace(piece, position): Boolean`, `place(piece, position): Grid`, `findCompleteLines(): List<Line>`, `clearLines(lines): Grid`
3. `Scoring.kt` — score calculation given lines cleared + combo state
4. `PieceGenerator.kt` — seeded PRNG, weighted selection, tray generation with small-piece constraint
5. `TideEngine.kt` — `rise(turnCount): Float`, `fall(linesCleared): Float`, `isGameOver(level): Boolean`
6. `GameEngine.kt` — orchestration: `placePiece()` → line check → score → tide update → game-over check → next state
7. `DailySeed.kt` — deterministic seed from epoch day
8. **Unit tests** for all of the above — this is the foundation, it must be correct

**Phase 2: Minimal Playable UI (Zen mode only)**

9. Set up Compose Navigation (Home → Game)
10. `HomeScreen.kt` — two buttons (Zen / Daily Tide), high scores display
11. `BoardCanvas.kt` — render the 8×8 grid with placed cells (static first, then animate)
12. `PieceTrayRow.kt` — render 3 pieces, detect drag-start
13. `DragOverlay.kt` — drag piece follows finger, show grid snap preview, handle drop
14. `GameViewModel.kt` — connect engine to UI via StateFlow
15. **Zen mode end-to-end playable** — place pieces, clear lines, game over when stuck, score shown

**Phase 3: Tide Mode**

16. Add water rendering to `BoardCanvas.kt` (gradient fill + wave animation)
17. Connect `TideEngine` to `GameViewModel` — tide rises on placement, falls on clear
18. Tide phase visual escalation (vignette pulse, audio cues)
19. Tide-specific game-over (water fills screen animation)
20. Daily seed integration — same piece sequence per day, one attempt per day lock
21. **Daily Tide end-to-end playable**

**Phase 4: Retention Systems**

22. `GameProgress.kt` — persist high scores, streaks, daily status
23. Streak counter logic (consecutive daily completions, forgiveness window optional)
24. Share card generation (text → clipboard)
25. `GameOverOverlay.kt` — full overlay with score, share button, streak, home/restart

**Phase 5: Monetization Skeleton**

26. `AdPlaceholder.kt` — modal "ad would show here" with Done/Skip buttons
27. Sandbag button (appears when tide ≥ 5)
28. Undo button (visible 3s after placement)
29. Peek button (shows next tray ghosted)
30. Retry button (Daily Tide game-over — replay same seed)
31. Interstitial trigger (between games, respecting cooldown)

**Phase 6: Polish & Juice**

32. Line-clear particle effect
33. Score pop animation (floating numbers)
34. Multi-line clear screen flash + haptic
35. Piece placement "thunk" feel (scale + haptic)
36. Tide rise/fall smooth animation
37. Sound effects (SoundPool)
38. Near-death screen effects (vignette, subtle shake)
39. High-score celebration (confetti, gold text)
40. App icon design (blocks half-submerged in blue waterline)

---

### Testing Strategy

**Unit tests (must-have before UI work):**
- `Grid`: placement validation (valid, invalid — out of bounds, overlapping), line detection (rows, columns, simultaneous, none), line clearing
- `PieceGenerator`: deterministic given same seed; same seed = same sequence; different seed = different sequence; tray constraint (≥1 small piece) always met
- `TideEngine`: rise rates at different turn counts; fall amounts for 1/2/3/4 lines; never goes below 0; game-over threshold
- `Scoring`: single line, multi-line, combos, streaks, perfect tray bonus
- `DailySeed`: same day = same seed; different day = different seed; matches across timezones (epoch day is UTC)
- `GameEngine`: full game simulation — place N pieces, verify state after each

**Integration tests (nice-to-have):**
- Full game simulation: can a zen game with random inputs eventually reach game-over?
- Daily seed verification: two `PieceGenerator` instances with same daily seed produce identical sequences for 100+ trays

**Manual playtesting checkpoints:**
- [ ] Zen mode: Can I play for 5 minutes without encountering a bug or confusing state?
- [ ] Zen mode: Does a multi-line clear feel satisfying (visual + haptic + audio)?
- [ ] Tide mode: Does the tide feel threatening but fair (not random-death)?
- [ ] Tide mode: Does a multi-line clear that pushes the tide back feel like a triumphant save?
- [ ] Daily Tide: If I play on two devices/emulators on the same day, do I get the same piece sequence?
- [ ] Game over: Is the score/share card clear and does clipboard copy work?
- [ ] Session flow: Can I play 3 games in a row without friction (game over → next game in <2 taps)?

---

### Success Criteria for the First Working Build

The build is "done" when a cold tester can:

1. Open the app → see Zen and Daily Tide options → tap into either
2. In Zen: drag pieces smoothly onto grid → see lines clear with visible feedback → play until stuck → see score → restart or go home
3. In Tide: same + water visibly rising + water dropping on clears + game over on drown → see score + depth + share card
4. Play today's Daily Tide → close app → reopen → Daily Tide shows "PLAYED" / tomorrow timer
5. Play tomorrow → streak increments → shows "🔥 2-day streak"
6. Tap share → clipboard has the emoji result card
7. Tap an RV button → see placeholder → get the reward (sandbag drops water, undo works, peek shows next tray)
8. **The game FEELS good** — there is a qualitative bar here: the satisfaction of a multi-line clear must make you want to play again. If it doesn't, the build isn't done regardless of feature completeness.

---

### What Good Looks Like (reference games to study)

- **Block Blast** — the feel target. Study: piece tray sizing, drag snap behavior, line-clear animation timing, how score pops feel, the "no game over screen until actually stuck" flow. Match this level of polish.
- **1010!** — the original in the sub-genre. Simpler. Study: how little UI is needed for the game to be instantly understandable.
- **Tetris (mobile)** — for the PRESSURE feel only. Study: how escalating speed creates near-miss moments. The tide should create the same rising tension.
- **Wordle** — for the daily-seed + share card pattern. Study: how simple the share format is, how the "same puzzle for everyone" framing drives conversation.

---

### Anti-Patterns (things that will kill this game)

1. **Over-engineering the architecture.** This is one game with <20 files of logic. Don't build a "game engine framework." Don't abstract for hypothetical future games. Build Rising Tide.
2. **Skipping the feel.** A block puzzle that doesn't feel good on line clears is dead on arrival. Budget real time for animation timing, haptic tuning, and audio sync. This is not polish — it IS the product.
3. **Making Tide mode the default.** The zen audience is 10× larger. Tide is the spice, not the meal. Default to zen; make tide discoverable and enticing.
4. **Complex onboarding.** Block puzzle is self-evident. A tray of pieces + a grid = "put these here." If you need a tutorial, the design is wrong.
5. **Too many features in v1.** No themes, no skins, no achievements, no daily rewards calendar, no "energy" system. Ship the two modes, make them feel great, validate.

---

*This brief is the complete specification. Build from this. Ask clarifying questions only if something is ambiguous or contradictory — otherwise, make the call that produces the best-feeling game.*
