package com.gamestest.games.games.twenty48

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
import kotlin.random.Random

class Twenty48ViewModel(app: Application) : AndroidViewModel(app) {

    val size = Game2048.SIZE
    private val today = LocalDate.now().toEpochDay()
    private val seed = Daily.seed(today, GameId.TWENTY48.id)
    private var rng = Random(seed)

    val tiles: SnapshotStateList<Int> = Game2048.emptyBoard().toList().toMutableStateList()

    var score by mutableIntStateOf(0); private set
    var solved by mutableStateOf(false); private set
    var gameOver by mutableStateOf(false); private set
    var elapsed by mutableIntStateOf(0); private set
    var streak by mutableIntStateOf(GameProgress.get(app).stats(GameId.TWENTY48.id).streak); private set
    var best by mutableIntStateOf(GameProgress.get(app).stats(GameId.TWENTY48.id).bestSeconds); private set

    init {
        startNew()
        viewModelScope.launch { while (!solved && !gameOver) { delay(1000); elapsed++ } }
    }

    private fun startNew() {
        val board = Game2048.emptyBoard()
        Game2048.spawn(board, rng)
        Game2048.spawn(board, rng)
        writeBoard(board)
        gameOver = false
    }

    fun move(dir: Dir) {
        if (solved || gameOver) return
        val result = Game2048.slide(boardSnapshot(), dir)
        if (!result.moved) return
        val board = result.board
        Game2048.spawn(board, rng)
        score += result.gained
        writeBoard(board)
        if (!solved && Game2048.hasTile(board, Game2048.WIN_TILE)) {
            solved = true
            GameProgress.get(getApplication()).recordCompletion(GameId.TWENTY48.id, elapsed)
            streak = GameProgress.get(getApplication()).stats(GameId.TWENTY48.id).streak
        }
        if (!Game2048.canMove(board)) gameOver = true
    }

    /** Restart today's puzzle from the same seed (only meaningful before solving). */
    fun reset() {
        if (solved) return
        rng = Random(seed)
        score = 0
        startNew()
    }

    private fun boardSnapshot(): IntArray = IntArray(size * size) { tiles[it] }
    private fun writeBoard(board: IntArray) { for (i in board.indices) tiles[i] = board[i] }
}
