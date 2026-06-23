package com.gamestest.games.games.zip

import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamestest.games.games.GameId
import com.gamestest.games.games.common.GameScaffold

@Composable
fun ZipScreen(onBack: () -> Unit, vm: ZipViewModel = viewModel()) {
    val accent = GameId.ZIP.accent
    GameScaffold(
        title = GameId.ZIP.title,
        accent = accent,
        rules = "Draw one path that fills every cell, connecting the numbers 1→${vm.numbers.max()} in order. Drag to draw; cross back to undo.",
        elapsed = vm.elapsed,
        streak = vm.streak,
        solved = vm.solved,
        onBack = onBack,
        onReset = vm::reset,
    ) {
        ZipBoard(vm, accent)
    }
}

@Composable
private fun ZipBoard(vm: ZipViewModel, accent: Color) {
    val cols = vm.cols
    val rows = vm.rows
    val grid = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.18f)
    val wallColor = MaterialTheme.colorScheme.onSurface

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 2.dp,
        modifier = Modifier.fillMaxWidth().padding(4.dp)
    ) {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(cols.toFloat() / rows.toFloat())
                .padding(6.dp)
                .pointerInput(Unit) {
                    val cw = size.width / cols
                    val ch = size.height / rows
                    fun cellAt(o: Offset): Int {
                        val c = (o.x / cw).toInt().coerceIn(0, cols - 1)
                        val r = (o.y / ch).toInt().coerceIn(0, rows - 1)
                        return r * cols + c
                    }
                    detectDragGestures(
                        onDragStart = { vm.visit(cellAt(it)) },
                        onDrag = { change, _ -> vm.visit(cellAt(change.position)) }
                    )
                }
                .pointerInput(Unit) {
                    val cw = size.width / cols
                    val ch = size.height / rows
                    detectTapGestures { o ->
                        val c = (o.x / cw).toInt().coerceIn(0, cols - 1)
                        val r = (o.y / ch).toInt().coerceIn(0, rows - 1)
                        vm.visit(r * cols + c)
                    }
                }
        ) {
            androidx.compose.foundation.Canvas(Modifier.fillMaxSize()) {
                val cw = size.width / cols
                val ch = size.height / rows

                // grid
                for (i in 0..cols) drawLine(grid, Offset(i * cw, 0f), Offset(i * cw, size.height), 1.5f)
                for (j in 0..rows) drawLine(grid, Offset(0f, j * ch), Offset(size.width, j * ch), 1.5f)

                // path
                if (vm.path.size > 1) {
                    val strokeW = minOf(cw, ch) * 0.30f
                    fun center(cell: Int) = Offset((cell % cols + 0.5f) * cw, (cell / cols + 0.5f) * ch)
                    for (i in 0 until vm.path.size - 1) {
                        drawLine(
                            accent,
                            center(vm.path[i]),
                            center(vm.path[i + 1]),
                            strokeWidth = strokeW,
                            cap = StrokeCap.Round
                        )
                    }
                }

                // walls (thick segments on shared borders)
                val wallStroke = Stroke(width = minOf(cw, ch) * 0.10f)
                for (cell in 0 until rows * cols) {
                    val r = cell / cols; val c = cell % cols
                    if (c < cols - 1 && vm.hasWall(cell, cell + 1))
                        drawLine(wallColor, Offset((c + 1) * cw, r * ch), Offset((c + 1) * cw, (r + 1) * ch), wallStroke.width)
                    if (r < rows - 1 && vm.hasWall(cell, cell + cols))
                        drawLine(wallColor, Offset(c * cw, (r + 1) * ch), Offset((c + 1) * cw, (r + 1) * ch), wallStroke.width)
                }

                // checkpoint numbers
                val paint = android.graphics.Paint().apply {
                    color = android.graphics.Color.argb(255, 16, 24, 40)
                    textAlign = android.graphics.Paint.Align.CENTER
                    isAntiAlias = true
                    textSize = minOf(cw, ch) * 0.42f
                    isFakeBoldText = true
                }
                for (cell in 0 until rows * cols) {
                    val num = vm.numbers[cell]
                    if (num == 0) continue
                    val r = cell / cols; val c = cell % cols
                    val cx = (c + 0.5f) * cw
                    val cy = (r + 0.5f) * ch
                    // white disc behind number for contrast against the path
                    drawCircle(Color.White, radius = minOf(cw, ch) * 0.32f, center = Offset(cx, cy))
                    drawCircle(accent, radius = minOf(cw, ch) * 0.32f, center = Offset(cx, cy), style = Stroke(2f))
                    drawContext.canvas.nativeCanvas.drawText(
                        num.toString(), cx, cy - (paint.descent() + paint.ascent()) / 2, paint
                    )
                }
            }
        }
    }
}
