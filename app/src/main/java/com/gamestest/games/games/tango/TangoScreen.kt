package com.gamestest.games.games.tango

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamestest.games.games.GameId
import com.gamestest.games.games.common.GameScaffold
import com.gamestest.games.ui.clickableNoRipple

private val Sun = Color(0xFFF5A623)
private val Moon = Color(0xFF5C6BC0)

@Composable
fun TangoScreen(onBack: () -> Unit, vm: TangoViewModel = viewModel()) {
    val accent = GameId.TANGO.accent
    val conflicts = vm.conflicts()
    GameScaffold(
        title = GameId.TANGO.title,
        accent = accent,
        rules = "Fill the grid with suns & moons. Equal counts per row/column, never three in a row. = means equal neighbors, × means different.",
        elapsed = vm.elapsed,
        streak = vm.streak,
        solved = vm.solved,
        onBack = onBack,
        onReset = vm::reset,
    ) {
        TangoBoard(vm, conflicts)
    }
}

@Composable
private fun TangoBoard(vm: TangoViewModel, conflicts: Set<Int>) {
    val n = vm.size
    val grid = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f)
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 2.dp,
        modifier = Modifier.fillMaxWidth().padding(4.dp)
    ) {
        BoxWithConstraints(Modifier.fillMaxWidth().padding(6.dp)) {
            val side = maxWidth
            val cell: Dp = side / n
            Box(Modifier.size(side)) {
                // cells
                Column(
                    Modifier
                        .size(side)
                        .drawBehind {
                            val cw = size.width / n
                            for (i in 0..n) {
                                drawLine(grid, Offset(i * cw, 0f), Offset(i * cw, size.height), 1.5f)
                                drawLine(grid, Offset(0f, i * cw), Offset(size.width, i * cw), 1.5f)
                            }
                        }
                ) {
                    for (r in 0 until n) {
                        Row(Modifier.weight(1f)) {
                            for (c in 0 until n) {
                                val idx = r * n + c
                                val v = vm.cells[idx]
                                val bg = if (idx in conflicts) Color(0xFFFFCDD2)
                                else if (vm.isGiven[idx]) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                                else Color.Transparent
                                Box(
                                    Modifier
                                        .weight(1f)
                                        .fillMaxSize()
                                        .background(bg)
                                        .clickableNoRipple { vm.tap(idx) },
                                    contentAlignment = Alignment.Center
                                ) {
                                    when (v) {
                                        0 -> Icon(Icons.Filled.WbSunny, "sun", tint = Sun, modifier = Modifier.fillMaxSize().padding(8.dp))
                                        1 -> Icon(Icons.Filled.DarkMode, "moon", tint = Moon, modifier = Modifier.fillMaxSize().padding(9.dp))
                                    }
                                }
                            }
                        }
                    }
                }
                // edge markers
                for (r in 0 until n) for (c in 0 until n - 1) {
                    if (vm.hEdge(r, c) != Edge.NONE)
                        EdgeBadge(vm.hEdge(r, c), x = cell * (c + 1), y = cell * r + cell / 2)
                }
                for (r in 0 until n - 1) for (c in 0 until n) {
                    if (vm.vEdge(r, c) != Edge.NONE)
                        EdgeBadge(vm.vEdge(r, c), x = cell * c + cell / 2, y = cell * (r + 1))
                }
            }
        }
    }
}

@Composable
private fun EdgeBadge(edge: Edge, x: Dp, y: Dp) {
    val s = 20.dp
    Surface(
        shape = RoundedCornerShape(50),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 1.dp,
        modifier = Modifier
            .offset(x = x - s / 2, y = y - s / 2)
            .size(s)
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                if (edge == Edge.EQUAL) "=" else "×",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
