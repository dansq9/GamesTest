package com.gamestest.games.games.queens

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
import com.gamestest.games.core.Daily
import com.gamestest.games.core.GameProgress
import com.gamestest.games.games.GameId
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate
import kotlin.math.abs

/** Cell state: 0 empty, 1 marked (X note), 2 queen. */
class QueensViewModel(app: Application) : AndroidViewModel(app) {

    private val today = LocalDate.now().toEpochDay()
    private val puzzle = QueensEngine.generate(Daily.random(today, GameId.QUEENS.id), n = 8)
    val n = puzzle.n
    val region: IntArray = puzzle.region

    val state: SnapshotStateList<Int> = MutableList(n * n) { 0 }.toMutableStateList()

    var solved by mutableStateOf(false); private set
    var elapsed by mutableIntStateOf(0); private set
    var streak by mutableIntStateOf(GameProgress.get(app).stats(GameId.QUEENS.id).streak); private set

    val regionColors: List<Color> = buildColors(n)

    init {
        if (GameProgress.get(app).stats(GameId.QUEENS.id).doneToday) {
            for (r in 0 until n) state[r * n + puzzle.solution[r]] = 2
            solved = true
        }
        viewModelScope.launch { while (!solved) { delay(1000); elapsed++ } }
    }

    /** Tap cycles empty -> mark -> queen -> empty. */
    fun tap(index: Int) {
        if (solved) return
        state[index] = (state[index] + 1) % 3
        checkSolved()
    }

    fun queenAt(index: Int) = state[index] == 2

    /** Queens that violate a rule (same row/col/region or touching). */
    fun conflicts(): Set<Int> {
        val qs = (0 until n * n).filter { state[it] == 2 }
        val bad = HashSet<Int>()
        for (i in qs.indices) for (j in i + 1 until qs.size) {
            val a = qs[i]; val b = qs[j]
            val ra = a / n; val ca = a % n; val rb = b / n; val cb = b % n
            val sameLine = ra == rb || ca == cb
            val sameRegion = region[a] == region[b]
            val touching = abs(ra - rb) <= 1 && abs(ca - cb) <= 1
            if (sameLine || sameRegion || touching) { bad.add(a); bad.add(b) }
        }
        return bad
    }

    private fun checkSolved() {
        val qs = (0 until n * n).filter { state[it] == 2 }
        if (qs.size != n) return
        if (conflicts().isNotEmpty()) return
        // n non-conflicting queens necessarily satisfy one-per row/col/region.
        solved = true
        GameProgress.get(getApplication()).recordCompletion(GameId.QUEENS.id, elapsed)
        streak = GameProgress.get(getApplication()).stats(GameId.QUEENS.id).streak
    }

    fun reset() {
        if (solved) return
        for (i in state.indices) state[i] = 0
    }

    private fun buildColors(count: Int): List<Color> {
        val base = listOf(
            0xFFB39DDB, 0xFF80CBC4, 0xFFFFAB91, 0xFFFFF59D,
            0xFF90CAF9, 0xFFA5D6A7, 0xFFF48FB1, 0xFFCE93D8,
            0xFFBCAAA4, 0xFF80DEEA, 0xFFE6EE9C, 0xFFFFCC80,
        ).map { Color(it) }
        return (0 until count).map { base[it % base.size] }
    }
}
