package com.gamestest.games.games.tango

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

class TangoViewModel(app: Application) : AndroidViewModel(app) {

    private val today = LocalDate.now().toEpochDay()
    private val puzzle = TangoEngine.generate(Daily.random(today, GameId.TANGO.id), size = 6)
    val size = puzzle.size

    val isGiven: BooleanArray = BooleanArray(size * size) { puzzle.givens[it] != -1 }
    val cells: SnapshotStateList<Int> = puzzle.givens.toList().toMutableStateList()

    var solved by mutableStateOf(false); private set
    var elapsed by mutableIntStateOf(0); private set
    var streak by mutableIntStateOf(GameProgress.get(app).stats(GameId.TANGO.id).streak); private set

    fun hEdge(r: Int, c: Int): Edge = puzzle.hEdge(r, c)
    fun vEdge(r: Int, c: Int): Edge = puzzle.vEdge(r, c)

    init {
        if (GameProgress.get(app).stats(GameId.TANGO.id).doneToday) {
            for (i in cells.indices) cells[i] = puzzle.solution[i]
            solved = true
        }
        viewModelScope.launch { while (!solved) { delay(1000); elapsed++ } }
    }

    /** Tap cycles empty(-1) -> sun(0) -> moon(1) -> empty. */
    fun tap(index: Int) {
        if (solved || isGiven[index]) return
        cells[index] = when (cells[index]) { -1 -> 0; 0 -> 1; else -> -1 }
        checkSolved()
    }

    /** Cells participating in a broken rule, for red highlighting. */
    fun conflicts(): Set<Int> {
        val s = size
        val bad = HashSet<Int>()
        fun at(r: Int, c: Int) = cells[r * s + c]

        // three-in-a-row
        for (r in 0 until s) for (c in 0 until s - 2) {
            val a = at(r, c); if (a != -1 && a == at(r, c + 1) && a == at(r, c + 2)) {
                bad.add(r * s + c); bad.add(r * s + c + 1); bad.add(r * s + c + 2)
            }
        }
        for (c in 0 until s) for (r in 0 until s - 2) {
            val a = at(r, c); if (a != -1 && a == at(r + 1, c) && a == at(r + 2, c)) {
                bad.add(r * s + c); bad.add((r + 1) * s + c); bad.add((r + 2) * s + c)
            }
        }
        // over-balance per row/col
        for (r in 0 until s) for (v in 0..1)
            if ((0 until s).count { at(r, it) == v } > s / 2)
                (0 until s).forEach { if (at(r, it) == v) bad.add(r * s + it) }
        for (c in 0 until s) for (v in 0..1)
            if ((0 until s).count { at(it, c) == v } > s / 2)
                (0 until s).forEach { if (at(it, c) == v) bad.add(it * s + c) }
        // edge constraints
        for (r in 0 until s) for (c in 0 until s - 1) {
            val a = at(r, c); val b = at(r, c + 1)
            if (a != -1 && b != -1) when (hEdge(r, c)) {
                Edge.EQUAL -> if (a != b) { bad.add(r * s + c); bad.add(r * s + c + 1) }
                Edge.DIFF -> if (a == b) { bad.add(r * s + c); bad.add(r * s + c + 1) }
                Edge.NONE -> {}
            }
        }
        for (r in 0 until s - 1) for (c in 0 until s) {
            val a = at(r, c); val b = at(r + 1, c)
            if (a != -1 && b != -1) when (vEdge(r, c)) {
                Edge.EQUAL -> if (a != b) { bad.add(r * s + c); bad.add((r + 1) * s + c) }
                Edge.DIFF -> if (a == b) { bad.add(r * s + c); bad.add((r + 1) * s + c) }
                Edge.NONE -> {}
            }
        }
        return bad
    }

    private fun checkSolved() {
        for (i in cells.indices) if (cells[i] != puzzle.solution[i]) return
        solved = true
        GameProgress.get(getApplication()).recordCompletion(GameId.TANGO.id, elapsed)
        streak = GameProgress.get(getApplication()).stats(GameId.TANGO.id).streak
    }

    fun reset() {
        if (solved) return
        for (i in cells.indices) cells[i] = puzzle.givens[i]
    }
}
