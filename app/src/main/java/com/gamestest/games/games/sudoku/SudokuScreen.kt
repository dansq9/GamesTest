package com.gamestest.games.games.sudoku

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamestest.games.games.GameId
import com.gamestest.games.games.common.GameScaffold
import com.gamestest.games.ui.clickableNoRipple

@Composable
fun SudokuScreen(onBack: () -> Unit, vm: SudokuViewModel = viewModel()) {
    val accent = GameId.SUDOKU.accent
    val conflicts = vm.conflicts()

    GameScaffold(
        title = GameId.SUDOKU.title,
        accent = accent,
        rules = "Fill every row, column and 2×3 box with the digits 1–6, no repeats.",
        elapsed = vm.elapsed,
        streak = vm.streak,
        solved = vm.solved,
        onBack = onBack,
        onReset = vm::reset,
        controls = { NumberPad(accent, vm) }
    ) {
        SudokuBoard(vm, accent, conflicts)
    }
}

@Composable
private fun SudokuBoard(vm: SudokuViewModel, accent: Color, conflicts: Set<Int>) {
    val n = vm.n
    val line = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.18f)
    val thick = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f)

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 2.dp,
        modifier = Modifier.fillMaxWidth().padding(4.dp)
    ) {
        Column(
            Modifier
                .aspectRatio(1f)
                .drawBehind {
                    val cw = size.width / n
                    val ch = size.height / n
                    for (i in 0..n) {
                        val sw = if (i % SudokuPuzzle.BOX_W == 0) 3f else 1f
                        drawLine(thick.takeIf { i % SudokuPuzzle.BOX_W == 0 } ?: line,
                            Offset(i * cw, 0f), Offset(i * cw, size.height), sw)
                    }
                    for (j in 0..n) {
                        val sw = if (j % SudokuPuzzle.BOX_H == 0) 3f else 1f
                        drawLine(thick.takeIf { j % SudokuPuzzle.BOX_H == 0 } ?: line,
                            Offset(0f, j * ch), Offset(size.width, j * ch), sw)
                    }
                }
        ) {
            for (r in 0 until n) {
                Row(Modifier.weight(1f)) {
                    for (c in 0 until n) {
                        val idx = r * n + c
                        val v = vm.cells[idx]
                        val isSel = vm.selected == idx
                        val bg = when {
                            idx in conflicts -> Color(0xFFFFCDD2)
                            isSel -> accent.copy(alpha = 0.18f)
                            vm.isGiven[idx] -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                            else -> Color.Transparent
                        }
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .aspectRatio(1f)
                                .background(bg)
                                .clickableNoRipple { vm.select(idx) },
                            contentAlignment = Alignment.Center
                        ) {
                            if (v != 0) {
                                Text(
                                    "$v",
                                    fontSize = 22.sp,
                                    fontWeight = if (vm.isGiven[idx]) FontWeight.Bold else FontWeight.Medium,
                                    color = when {
                                        idx in conflicts -> Color(0xFFC62828)
                                        vm.isGiven[idx] -> MaterialTheme.colorScheme.onSurface
                                        else -> accent
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

@Composable
private fun NumberPad(accent: Color, vm: SudokuViewModel) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        for (v in 1..vm.n) {
            Surface(
                modifier = Modifier.weight(1f).clickableNoRipple { vm.input(v) },
                shape = RoundedCornerShape(12.dp),
                color = accent.copy(alpha = 0.12f)
            ) {
                Box(Modifier.padding(vertical = 16.dp), contentAlignment = Alignment.Center) {
                    Text("$v", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = accent)
                }
            }
        }
        Surface(
            modifier = Modifier.size(56.dp).clickableNoRipple { vm.erase() },
            shape = RoundedCornerShape(12.dp),
            color = MaterialTheme.colorScheme.surfaceVariant
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(Icons.AutoMirrored.Filled.Backspace, contentDescription = "Erase")
            }
        }
    }
}
