package com.gamestest.games.games

import androidx.compose.ui.graphics.Color

/**
 * Static metadata for the games shown in the hub.
 *
 * NOTE: [id] is the persistent storage key + daily-seed key and must stay stable;
 * [title]/[tagline] are display-only and were renamed to avoid trademark overlap
 * with the puzzles that inspired them.
 */
enum class GameId(
    val id: String,
    val title: String,
    val tagline: String,
    val route: String,
    val accent: Color,
) {
    PATCHES("patches", "Patches", "Reveal the hidden picture", "game/patches", Color(0xFFE5484D)),
    SUDOKU("sudoku", "Sudoku", "Fill the 6×6 grid", "game/sudoku", Color(0xFF2563EB)),
    ZIP("zip", "Trail", "Trace 1 to 7 in one path", "game/zip", Color(0xFF0E9384)),
    QUEENS("queens", "Stars", "One per row, column & colour", "game/queens", Color(0xFF7C3AED)),
    TANGO("tango", "Eclipse", "Balance suns & moons", "game/tango", Color(0xFFD97706)),
    TWENTY48("2048", "2048", "Join tiles to reach 2048", "game/2048", Color(0xFFE8901E));

    companion object {
        val all: List<GameId> get() = entries
    }
}
