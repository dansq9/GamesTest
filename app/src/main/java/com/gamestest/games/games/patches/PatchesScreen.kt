package com.gamestest.games.games.patches

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamestest.games.games.GameId
import com.gamestest.games.games.common.GameScaffold
import com.gamestest.games.ui.clickableNoRipple

@Composable
fun PatchesScreen(onBack: () -> Unit, vm: PatchesViewModel = viewModel()) {
    val accent = GameId.PATCHES.accent
    GameScaffold(
        title = GameId.PATCHES.title,
        accent = accent,
        rules = "Paint the grid using the row & column clues (run length + color) to reveal today's picture: ${vm.title}.",
        elapsed = vm.elapsed,
        streak = vm.streak,
        solved = vm.solved,
        onBack = onBack,
        onReset = vm::reset,
        controls = { Palette(vm) }
    ) {
        PatchesBoard(vm)
    }
}

@Composable
private fun PatchesBoard(vm: PatchesViewModel) {
    val rows = vm.rows
    val cols = vm.cols
    val gridLine = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.15f)

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 2.dp,
        modifier = Modifier.fillMaxWidth().padding(4.dp)
    ) {
        BoxWithConstraints(Modifier.fillMaxWidth().padding(8.dp)) {
            // Reserve ~2.4 cells worth of width for clues; the rest is the grid.
            val cell: Dp = maxWidth / (cols + 2.4f)
            val clueSize: Dp = cell * 2.4f

            Column {
                // Column clues row
                Row {
                    Spacer(Modifier.size(clueSize))
                    for (c in 0 until cols) {
                        Column(
                            modifier = Modifier.width(cell).height(clueSize),
                            verticalArrangement = Arrangement.Bottom,
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            vm.colClues[c].forEach { clue ->
                                ClueChip(clue.length, vm.palette[clue.colorIndex], cell)
                            }
                        }
                    }
                }
                // Grid rows with row clues
                for (r in 0 until rows) {
                    Row {
                        Row(
                            modifier = Modifier.width(clueSize).height(cell),
                            horizontalArrangement = Arrangement.End,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            vm.rowClues[r].forEach { clue ->
                                ClueChip(clue.length, vm.palette[clue.colorIndex], cell)
                            }
                        }
                        for (c in 0 until cols) {
                            val idx = r * cols + c
                            val v = vm.cells[idx]
                            Box(
                                modifier = Modifier
                                    .size(cell)
                                    .border(0.5.dp, gridLine)
                                    .background(if (v == 0) Color.Transparent else vm.palette[v])
                                    .clickableNoRipple { vm.paint(idx) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ClueChip(length: Int, color: Color, cell: Dp) {
    Box(
        modifier = Modifier
            .padding(0.5.dp)
            .size(cell * 0.82f)
            .background(color, RoundedCornerShape(3.dp)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            "$length",
            fontSize = (cell.value * 0.42f).sp,
            fontWeight = FontWeight.Bold,
            color = if (color.luminance() > 0.6f) Color(0xFF222222) else Color.White
        )
    }
}

private fun Color.luminance(): Float = 0.299f * red + 0.587f * green + 0.114f * blue

@Composable
private fun Palette(vm: PatchesViewModel) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center
    ) {
        // palette index 0 is background; offer colors 1..n
        for (i in 1 until vm.palette.size) {
            val selected = vm.selectedColor == i
            Box(
                modifier = Modifier
                    .padding(6.dp)
                    .size(if (selected) 48.dp else 40.dp)
                    .background(vm.palette[i], CircleShape)
                    .border(
                        width = if (selected) 3.dp else 1.dp,
                        color = if (selected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f),
                        shape = CircleShape
                    )
                    .clickableNoRipple { vm.pickColor(i) }
            )
        }
    }
}
