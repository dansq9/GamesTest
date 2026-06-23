package com.gamestest.games.games.twenty48

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamestest.games.games.GameId
import com.gamestest.games.games.common.GameScaffold
import kotlin.math.abs

@Composable
fun Twenty48Screen(onBack: () -> Unit, vm: Twenty48ViewModel = viewModel()) {
    val accent = GameId.TWENTY48.accent
    GameScaffold(
        title = GameId.TWENTY48.title,
        accent = accent,
        rules = "Swipe to slide all tiles. When two tiles with the same number touch, they merge. Reach the 2048 tile to win.",
        elapsed = vm.elapsed,
        streak = vm.streak,
        solved = vm.solved,
        onBack = onBack,
        onReset = vm::reset,
        controls = { ScoreBar(vm) }
    ) {
        Board(vm)
    }
}

@Composable
private fun ScoreBar(vm: Twenty48ViewModel) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text("Score  ${vm.score}", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        if (vm.gameOver && !vm.solved) {
            Text("Game over — tap ↻", color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun Board(vm: Twenty48ViewModel) {
    val n = vm.size
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFFBBADA0),
        shadowElevation = 2.dp,
        modifier = Modifier.fillMaxWidth().padding(4.dp)
    ) {
        Column(
            Modifier
                .aspectRatio(1f)
                .padding(6.dp)
                .pointerInput(Unit) {
                    var dx = 0f
                    var dy = 0f
                    detectDragGestures(
                        onDragStart = { dx = 0f; dy = 0f },
                        onDrag = { change, drag -> dx += drag.x; dy += drag.y; change.consume() },
                        onDragEnd = {
                            val threshold = 32f
                            if (abs(dx) > abs(dy)) {
                                if (dx > threshold) vm.move(Dir.RIGHT) else if (dx < -threshold) vm.move(Dir.LEFT)
                            } else {
                                if (dy > threshold) vm.move(Dir.DOWN) else if (dy < -threshold) vm.move(Dir.UP)
                            }
                        }
                    )
                }
        ) {
            for (r in 0 until n) {
                Row(Modifier.weight(1f).fillMaxWidth()) {
                    for (c in 0 until n) {
                        val v = vm.tiles[r * n + c]
                        val (bg, fg) = tileColors(v)
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxSize()
                                .padding(4.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(bg),
                            contentAlignment = Alignment.Center
                        ) {
                            if (v != 0) {
                                Text(
                                    "$v",
                                    color = fg,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = when {
                                        v < 100 -> 28.sp
                                        v < 1000 -> 24.sp
                                        else -> 18.sp
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun tileColors(v: Int): Pair<Color, Color> {
    val dark = Color(0xFF776E65)
    val light = Color(0xFFF9F6F2)
    return when (v) {
        0 -> Color(0xFFCDC1B4) to dark
        2 -> Color(0xFFEEE4DA) to dark
        4 -> Color(0xFFEDE0C8) to dark
        8 -> Color(0xFFF2B179) to light
        16 -> Color(0xFFF59563) to light
        32 -> Color(0xFFF67C5F) to light
        64 -> Color(0xFFF65E3B) to light
        128 -> Color(0xFFEDCF72) to light
        256 -> Color(0xFFEDCC61) to light
        512 -> Color(0xFFEDC850) to light
        1024 -> Color(0xFFEDC53F) to light
        else -> Color(0xFFEDC22E) to light
    }
}
