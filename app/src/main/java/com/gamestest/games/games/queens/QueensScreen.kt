package com.gamestest.games.games.queens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamestest.games.games.GameId
import com.gamestest.games.games.common.GameScaffold
import com.gamestest.games.ui.clickableNoRipple

@Composable
fun QueensScreen(onBack: () -> Unit, vm: QueensViewModel = viewModel()) {
    val accent = GameId.QUEENS.accent
    val conflicts = vm.conflicts()
    GameScaffold(
        title = GameId.QUEENS.title,
        accent = accent,
        rules = "Place one crown per row, column and color region. Crowns can't touch — not even diagonally. Tap: note → crown → clear.",
        elapsed = vm.elapsed,
        streak = vm.streak,
        solved = vm.solved,
        onBack = onBack,
        onReset = vm::reset,
    ) {
        QueensBoard(vm, conflicts)
    }
}

@Composable
private fun QueensBoard(vm: QueensViewModel, conflicts: Set<Int>) {
    val n = vm.n
    val thin = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.25f)
    val bold = MaterialTheme.colorScheme.onSurface

    Surface(
        shape = RoundedCornerShape(12.dp),
        shadowElevation = 2.dp,
        modifier = Modifier.fillMaxWidth().padding(4.dp)
    ) {
        Box(Modifier.aspectRatio(1f)) {
            Column(Modifier.fillMaxSize()) {
                for (r in 0 until n) {
                    Row(Modifier.weight(1f).fillMaxWidth()) {
                        for (c in 0 until n) {
                            val idx = r * n + c
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxHeight()
                                    .background(vm.regionColors[vm.region[idx]])
                                    .clickableNoRipple { vm.tap(idx) },
                                contentAlignment = Alignment.Center
                            ) {
                                when (vm.state[idx]) {
                                    1 -> Icon(
                                        Icons.Filled.Close, "note",
                                        tint = Color.Black.copy(alpha = 0.4f),
                                        modifier = Modifier.fillMaxSize().padding(12.dp)
                                    )
                                    2 -> Icon(
                                        Icons.Filled.WorkspacePremium, "crown",
                                        tint = if (idx in conflicts) Color(0xFFC62828) else Color(0xFF1A1A1A),
                                        modifier = Modifier.fillMaxSize().padding(7.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
            // Borders on top: thin grid everywhere, bold between different regions + outline.
            Canvas(Modifier.fillMaxSize()) {
                val cw = size.width / n
                for (i in 0..n) {
                    drawLine(thin, Offset(i * cw, 0f), Offset(i * cw, size.height), 1f)
                    drawLine(thin, Offset(0f, i * cw), Offset(size.width, i * cw), 1f)
                }
                for (r in 0 until n) for (c in 0 until n) {
                    val idx = r * n + c
                    if (c < n - 1 && vm.region[idx] != vm.region[idx + 1])
                        drawLine(bold, Offset((c + 1) * cw, r * cw), Offset((c + 1) * cw, (r + 1) * cw), 5f)
                    if (r < n - 1 && vm.region[idx] != vm.region[idx + n])
                        drawLine(bold, Offset(c * cw, (r + 1) * cw), Offset((c + 1) * cw, (r + 1) * cw), 5f)
                }
                // outer frame
                drawLine(bold, Offset(0f, 0f), Offset(size.width, 0f), 5f)
                drawLine(bold, Offset(0f, size.height), Offset(size.width, size.height), 5f)
                drawLine(bold, Offset(0f, 0f), Offset(0f, size.height), 5f)
                drawLine(bold, Offset(size.width, 0f), Offset(size.width, size.height), 5f)
            }
        }
    }
}
