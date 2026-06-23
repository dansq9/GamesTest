package com.gamestest.games.games.sudoku

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.runtime.toMutableStateList
import com.gamestest.games.core.Daily
import com.gamestest.games.core.GameProgress
import com.gamestest.games.games.GameId
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate

class SudokuViewModel(app: Application) : AndroidViewModel(app) {

    val n = SudokuPuzzle.N
    private val today = LocalDate.now().toEpochDay()
    private val puzzle = SudokuEngine.generate(Daily.random(today, GameId.SUDOKU.id))

    /** True where the cell is a fixed clue and cannot be edited. */
    val isGiven: BooleanArray = BooleanArray(n * n) { puzzle.givens[it] != 0 }

    val cells: SnapshotStateList<Int> = puzzle.givens.toList().toMutableStateList()

    var selected by mutableIntStateOf(-1); private set
    var solved by mutableStateOf(false); private set
    var elapsed by mutableIntStateOf(0); private set
    var streak by mutableIntStateOf(GameProgress.get(app).stats(GameId.SUDOKU.id).streak); private set

    init {
        if (GameProgress.get(app).stats(GameId.SUDOKU.id).doneToday) {
            // Already solved today: reveal solution as a recap.
            for (i in cells.indices) cells[i] = puzzle.solution[i]
            solved = true
        }
        startTimer()
    }

    private fun startTimer() = viewModelScope.launch {
        while (!solved) { delay(1000); elapsed++ }
    }

    fun select(index: Int) { if (!isGiven[index] && !solved) selected = index }

    fun input(value: Int) {
        val i = selected
        if (i < 0 || isGiven[i] || solved) return
        cells[i] = if (cells[i] == value) 0 else value
        checkSolved()
    }

    fun erase() {
        val i = selected
        if (i < 0 || isGiven[i] || solved) return
        cells[i] = 0
    }

    /** Indices that currently violate a row/column/box rule (for red highlighting). */
    fun conflicts(): Set<Int> {
        val bad = HashSet<Int>()
        fun scan(group: List<Int>) {
            val seen = HashMap<Int, Int>()
            for (idx in group) {
                val v = cells[idx]
                if (v == 0) continue
                val prev = seen[v]
                if (prev != null) { bad.add(prev); bad.add(idx) } else seen[v] = idx
            }
        }
        for (r in 0 until n) scan((0 until n).map { r * n + it })
        for (c in 0 until n) scan((0 until n).map { it * n + c })
        for (br in 0 until n step SudokuPuzzle.BOX_H) for (bc in 0 until n step SudokuPuzzle.BOX_W) {
            val cellsInBox = ArrayList<Int>()
            for (dr in 0 until SudokuPuzzle.BOX_H) for (dc in 0 until SudokuPuzzle.BOX_W)
                cellsInBox.add((br + dr) * n + (bc + dc))
            scan(cellsInBox)
        }
        return bad
    }

    private fun checkSolved() {
        for (i in cells.indices) if (cells[i] != puzzle.solution[i]) return
        solved = true
        GameProgress.get(getApplication()).recordCompletion(GameId.SUDOKU.id, elapsed)
        streak = GameProgress.get(getApplication()).stats(GameId.SUDOKU.id).streak
    }

    fun reset() {
        if (solved) return
        for (i in cells.indices) cells[i] = puzzle.givens[i]
        selected = -1
    }
}
