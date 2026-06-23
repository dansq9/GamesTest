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
