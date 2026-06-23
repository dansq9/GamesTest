package com.gamestest.games.games.patches

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.runtime.toMutableStateList
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.gamestest.games.core.GameProgress
import com.gamestest.games.games.GameId
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate

class PatchesViewModel(app: Application) : AndroidViewModel(app) {

    private val today = LocalDate.now().toEpochDay()
    private val puzzle = PatchesEngine.forDay(today)

    val rows = puzzle.rows
    val cols = puzzle.cols
    val title = puzzle.title
    val palette: List<Color> = puzzle.palette.map { Color(it) }
    val rowClues = puzzle.rowClues
    val colClues = puzzle.colClues

    val cells: SnapshotStateList<Int> = MutableList(rows * cols) { 0 }.toMutableStateList()

    var selectedColor by mutableIntStateOf(if (palette.size > 1) 1 else 0); private set
    var solved by mutableStateOf(false); private set
    var elapsed by mutableIntStateOf(0); private set
    var streak by mutableIntStateOf(GameProgress.get(app).stats(GameId.PATCHES.id).streak); private set

    init {
        if (GameProgress.get(app).stats(GameId.PATCHES.id).doneToday) {
            for (i in cells.indices) cells[i] = puzzle.solution[i]
            solved = true
        }
        viewModelScope.launch { while (!solved) { delay(1000); elapsed++ } }
    }

    fun pickColor(index: Int) { selectedColor = index }

    fun paint(index: Int) {
        if (solved) return
        cells[index] = if (cells[index] == selectedColor) 0 else selectedColor
        checkSolved()
    }

    private fun checkSolved() {
        // Empty (0) must match background cells; colored cells must match exactly.
        for (i in cells.indices) if (cells[i] != puzzle.solution[i]) return
        solved = true
        GameProgress.get(getApplication()).recordCompletion(GameId.PATCHES.id, elapsed)
        streak = GameProgress.get(getApplication()).stats(GameId.PATCHES.id).streak
    }

    fun reset() {
        if (solved) return
        for (i in cells.indices) cells[i] = 0
    }
}
