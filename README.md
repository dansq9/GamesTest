# GamesTest — daily puzzle games for the job-board app

A standalone Jetpack Compose Android app containing five LinkedIn-style **daily
puzzle games**, designed to be lifted into the main job-board app to boost
retention / sessions per active user. On the home screen the **Games** card
replaces the old "AI Mock Interview" card and opens the games hub.

## The games

Display names were chosen to avoid trademark overlap with the puzzles that
inspired them; the internal `id` (used for storage + daily seeds) is unchanged
and stays stable.

| Display name | id | Rules | Engine |
|------|------|-------|--------|
| **Patches** | `patches` | Paint the grid from row/column run clues to reveal a picture | `PatchesEngine` — colored nonogram over job-themed pixel art |
| **Sudoku** | `sudoku` | 6×6, digits 1–6, 2×3 boxes, no repeats | `SudokuEngine` — backtracking fill + uniqueness-checked hole digging |
| **Trail** | `zip` | One path through every cell, visiting numbers 1→7 in order | `ZipEngine` — randomized Hamiltonian path + walls inserted until unique |
| **Stars** | `queens` | One crown per row, column & colour region; crowns can't touch (incl. diagonally) | `QueensEngine` — valid placement + randomized region growth + solver-verified unique solution |
| **Eclipse** | `tango` | 6×6 suns/moons, equal per row/col, no 3-in-a-row, `=`/`×` edge clues | `TangoEngine` — full-solution generator + minimal unique givens |
| **2048** | `2048` | Swipe to slide & merge matching tiles; reach the 2048 tile | `Game2048` — slide/merge engine, daily-seeded tile spawns |

> **Patches note:** LinkedIn's exact "Patches" ruleset isn't pinned down here, so
> it's implemented as a **colored nonogram / picture-reveal** — the closest
> well-defined daily logic puzzle. The art, palette and clue logic are isolated in
> `PatchesEngine.kt`, so swapping in the final ruleset is a localized change.

## Word & logic engines (NYT-inspired, original + trademark-safe)

A second set of engines lives under `games/<game>/` as **pure Kotlin** (logic +
generators/solvers, no Android deps), with **no NYT names, word lists, clues,
archives, or trade dress**. Screens are pending; engines are verified.

| Engine | id | What it does | Legal note |
|--------|----|--------------|------------|
| `GuessEngine` | `guess` | 5-letter guess, 6 tries, correct/present/absent (correct duplicate handling) | Wordle *mechanic* isn't patented; we avoid the name/branding/UI/share-format and use our own lists |
| `GroupingEngine` | `grouping` | 16 words → 4 hidden groups; CORRECT / ONE_AWAY / WRONG | Connections-like idea, original categories/data, no NYT tile reveal style |
| `LettersEngine` | `letters` | 7 letters, required center, ≥4-letter words, pangrams, scoring | No "Spelling Bee"/bee/honeycomb branding |
| `WordPathEngine` | `wordpath` | Themed path-search; generator packs theme words + a spanner to cover the grid | Strands-like; original data + name |
| `MiniCrossEngine` | `minicross` | Small crossword; numbering/entries derived from the grid | Generic mechanic; original grids/clues, no "Mini" branding |
| `PipsEngine` | `pips` | Domino placement with SUM / EQUAL / DIFFERENT region constraints; solver-verified unique | **Not** Boggle (patented). Domino-logic, original boards/name |

> **Boggle is intentionally excluded** — its grid/timer/adjacency mechanic is patented.

### Content languages

Word/puzzle **content** is locale-selected via `GameLanguage` (Portuguese for
Brazil, English for South Africa + the rest; English is the fallback). UI
localization is left to the app's existing layer. Matching is **accent-insensitive**
(`TextNormalize`) so Portuguese answers like "dança" accept "danca" while the
accented form is shown. Word lists live in `assets/words/<lang>/` and are loaded
by `WordRepository`; grouping/word-path/crossword pools are in each game's
`*Data.kt`. Current data is a **starter set** — expand the assets/pools freely.

> Portuguese mini-crosswords aren't authored yet (the engine supports them; PT
> currently falls back to the English pool).

### Animations

Engines expose the state transitions the UI needs for smooth animation
(per-letter `LetterState`s for tile flips, `ONE_AWAY` for shake feedback,
slide/merge deltas for 2048/Pips, path tracing for Word Path). The actual
Compose animations will be implemented against your designs.

## Daily puzzles & streaks

Puzzles are **deterministic by date**: `Daily.seed(epochDay, gameId)` derives a
stable RNG seed, so every device gets the same puzzle each calendar day with no
backend. Completion + streaks are stored in `GameProgress` (SharedPreferences).
To move to server-authoritative dailies later, feed a server-provided day value
into `Daily`.

## Architecture

Each game is a self-contained package under `com.gamestest.games.games.<game>`:

```
<game>/
  <Game>Engine.kt     // PURE Kotlin — models, generator, solver. No Android deps.
  <Game>ViewModel.kt  // state, timer, solve detection, streak recording
  <Game>Screen.kt     // Compose UI
```

The engines are intentionally **pure Kotlin** so they're portable and unit-testable
outside Android. They were verified over 120 simulated days (valid solution +
unique where required) before the UI was built.

Shared pieces:
- `core/Daily.kt` — deterministic daily seeding
- `core/GameProgress.kt` — streak / best-time persistence
- `games/GameCatalog.kt` — `GameId` registry (title, tagline, route, accent color)
- `games/common/GameScaffold.kt` — shared top bar / timer / streak / win banner
- `games/GamesHubScreen.kt` — the 5-game hub
- `home/HomeScreen.kt` — recreates the job-board home with the **Games** card

## Dropping this into your real app

1. Copy the `com.gamestest.games.games.*` packages plus `core/Daily.kt`,
   `core/GameProgress.kt`, and `ui/` (theme + `clickableNoRipple`).
2. Add the deps from `app/build.gradle.kts` (Compose BOM, navigation-compose,
   material-icons-extended, lifecycle-viewmodel-compose, and
   `coreLibraryDesugaring` if your `minSdk < 26`).
3. Replace the Mock Interview card's `onClick` with navigation to `GamesHubScreen`
   (see `home/HomeScreen.kt` → `SmallToolCard(title = "Games", …)`).
4. Wire the five game routes into your nav graph (see `navigation/GamesNavGraph.kt`).

## Building

Open in Android Studio (Giraffe+), or:

```
./gradlew assembleDebug
```

Requires the Android SDK (compileSdk 34). The puzzle **logic** can be exercised
without the SDK by compiling the `*Engine.kt` + `core/Daily.kt` files as a plain
Kotlin/JVM module.
