package com.gamestest.games.games

import androidx.compose.ui.graphics.Color

/** Static metadata for the five games shown in the hub. */
enum class GameId(
    val id: String,
    val title: String,
    val tagline: String,
    val route: String,
    val accent: Color,
) {
    SUDOKU("sudoku", "Mini Sudoku", "6×6 logic. Fill 1–6 with no repeats.", "game/sudoku", Color(0xFF2E7D32)),
    QUEENS("queens", "Queens", "One crown per row, column & color.", "game/queens", Color(0xFF8E24AA)),
    TANGO("tango", "Tango", "Balance suns & moons, no three in a row.", "game/tango", Color(0xFFEF6C00)),
    ZIP("zip", "Zip", "Connect 1→N through every cell.", "game/zip", Color(0xFF0097A7)),
    PATCHES("patches", "Patches", "Paint the grid to reveal the picture.", "game/patches", Color(0xFFC2185B));

    companion object {
        val all: List<GameId> get() = entries
    }
}
