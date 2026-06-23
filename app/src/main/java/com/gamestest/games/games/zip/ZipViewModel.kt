package com.gamestest.games.games.zip

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.runtime.toMutableStateList
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.gamestest.games.core.Daily
import com.gamestest.games.core.GameProgress
import com.gamestest.games.games.GameId
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate
import kotlin.math.abs

class ZipViewModel(app: Application) : AndroidViewModel(app) {

    private val today = LocalDate.now().toEpochDay()
    private val puzzle = ZipEngine.generate(Daily.random(today, GameId.ZIP.id), rows = 6, cols = 6, checkpoints = 8)
    val rows = puzzle.rows
    val cols = puzzle.cols
    val numbers: IntArray = puzzle.numbers
    private val start = numbers.indexOfFirst { it == 1 }
    private val total = rows * cols

    val path: SnapshotStateList<Int> = mutableListOf(start).toMutableStateList()

    var solved by mutableStateOf(false); private set
    var elapsed by mutableIntStateOf(0); private set
    var streak by mutableIntStateOf(GameProgress.get(app).stats(GameId.ZIP.id).streak); private set

    init {
        if (GameProgress.get(app).stats(GameId.ZIP.id).doneToday) {
            path.clear(); path.addAll(puzzle.solution.toList())
            solved = true
        }
        viewModelScope.launch { while (!solved) { delay(1000); elapsed++ } }
    }

    fun hasWall(a: Int, b: Int) = puzzle.hasWall(a, b)

    fun inPath(cell: Int) = path.contains(cell)
    fun pathIndex(cell: Int) = path.indexOf(cell)

    /** Tap or drag onto [cell]: extend the path, or backtrack to it if already visited. */
    fun visit(cell: Int) {
        if (solved || cell !in 0 until total) return
        val existing = path.indexOf(cell)
        if (existing >= 0) {
            // backtrack: drop everything after this cell (keep at least the start)
            if (existing == 0) return
            while (path.size > existing + 1) path.removeAt(path.size - 1)
            return
        }
        val last = path.last()
        if (!adjacent(last, cell) || hasWall(last, cell)) return
        // checkpoints must be entered in ascending order
        val num = numbers[cell]
        if (num != 0 && num != expectedNext()) return
        path.add(cell)
        checkSolved()
    }

    private fun expectedNext(): Int = path.count { numbers[it] > 0 } + 1

    private fun adjacent(a: Int, b: Int): Boolean {
        val ra = a / cols; val ca = a % cols; val rb = b / cols; val cb = b % cols
        return abs(ra - rb) + abs(ca - cb) == 1
    }

    private fun checkSolved() {
        if (path.size != total) return
        solved = true
        GameProgress.get(getApplication()).recordCompletion(GameId.ZIP.id, elapsed)
        streak = GameProgress.get(getApplication()).stats(GameId.ZIP.id).streak
    }

    fun reset() {
        if (solved) return
        path.clear(); path.add(start)
    }
}
