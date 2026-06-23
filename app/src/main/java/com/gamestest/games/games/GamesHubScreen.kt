package com.gamestest.games.games

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Gesture
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gamestest.games.core.GameProgress
import com.gamestest.games.games.common.formatTime
import com.gamestest.games.ui.clickableNoRipple
import com.gamestest.games.ui.theme.Gold
import com.gamestest.games.ui.theme.TextMuted
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun GamesHubScreen(onBack: () -> Unit, onOpenGame: (GameId) -> Unit) {
    val context = LocalContext.current
    val progress = GameProgress.get(context)
    val stats = GameId.all.associateWith { progress.stats(it.id) }

    val solvedToday = stats.values.count { it.doneToday }
    val streak = stats.values.maxOfOrNull { it.streak } ?: 0
    val firstWin = stats.values.any { it.bestSeconds > 0 }
    val speedSolver = stats.values.any { it.bestSeconds in 1..60 }
    val dateLabel = LocalDate.now().format(DateTimeFormatter.ofPattern("EEE d MMM", Locale.getDefault()))

    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                Header(onBack, dateLabel)
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard(
                        modifier = Modifier.weight(1f),
                        content = {
                            Icon(Icons.Filled.LocalFireDepartment, null, tint = Gold, modifier = Modifier.size(28.dp))
                            Spacer(Modifier.width(10.dp))
                            Column {
                                Text("$streak", fontSize = 24.sp, fontWeight = FontWeight.Bold)
                                Text("day streak", color = TextMuted, fontSize = 13.sp)
                            }
                        }
                    )
                    StatCard(
                        modifier = Modifier.weight(1f),
                        content = {
                            Column {
                                Row(verticalAlignment = Alignment.Bottom) {
                                    Text("$solvedToday", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                    Text("/${GameId.all.size}", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                                }
                                Text("solved today", color = TextMuted, fontSize = 13.sp)
                            }
                        }
                    )
                }
                Spacer(Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    AchievementChip("First win", firstWin, Modifier.weight(1f))
                    AchievementChip("Speed solver", speedSolver, Modifier.weight(1f))
                }
                Spacer(Modifier.height(4.dp))
            }
        }

        items(GameId.all) { game ->
            GameCard(game = game, stats = stats.getValue(game), onClick = { onOpenGame(game) })
        }
    }
}

@Composable
private fun Header(onBack: () -> Unit, dateLabel: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
            shape = CircleShape,
            color = MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.size(40.dp).clickableNoRipple(onBack)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
            }
        }
        Spacer(Modifier.width(14.dp))
        Column {
            Text("Brain Games", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text("$dateLabel · Today's puzzles", color = TextMuted, fontSize = 13.sp)
        }
    }
}

@Composable
private fun StatCard(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Surface(
        modifier = modifier.height(72.dp),
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) { content() }
    }
}

@Composable
private fun AchievementChip(label: String, earned: Boolean, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(50),
        color = if (earned) Gold.copy(alpha = 0.18f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
    ) {
        Row(
            modifier = Modifier.padding(vertical = 9.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Filled.Star,
                contentDescription = null,
                tint = if (earned) Gold else TextMuted.copy(alpha = 0.5f),
                modifier = Modifier.size(16.dp)
            )
            Spacer(Modifier.width(6.dp))
            Text(
                label,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp,
                color = if (earned) Gold else TextMuted.copy(alpha = 0.6f)
            )
        }
    }
}

@Composable
private fun GameCard(game: GameId, stats: GameProgress.Stats, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .height(150.dp)
            .clickableNoRipple(onClick),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = 0.12f))
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                GameIcon(game)
                Spacer(Modifier.weight(1f))
                if (stats.doneToday) {
                    Badge(
                        bg = Color(0xFFE7F5EC),
                        content = {
                            Icon(Icons.Filled.Star, null, tint = Color(0xFF2E7D32), modifier = Modifier.size(14.dp))
                            Spacer(Modifier.width(4.dp))
                            Text(formatTime(stats.bestSeconds), color = Color(0xFF2E7D32), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    )
                } else {
                    Badge(
                        bg = game.accent.copy(alpha = 0.14f),
                        content = { Text("PLAY", color = game.accent, fontWeight = FontWeight.Bold, fontSize = 13.sp) }
                    )
                }
            }
            Spacer(Modifier.weight(1f))
            Text(game.title, fontSize = 19.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(2.dp))
            Text(game.tagline, color = TextMuted, fontSize = 13.sp)
            Spacer(Modifier.height(8.dp))
            Box(Modifier.fillMaxWidth().height(1.dp).background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.12f)))
        }
    }
}

@Composable
private fun Badge(bg: Color, content: @Composable () -> Unit) {
    Surface(shape = RoundedCornerShape(50), color = bg) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp),
            verticalAlignment = Alignment.CenterVertically
        ) { content() }
    }
}

/** Small per-game glyph echoing the wireframe. */
@Composable
private fun GameIcon(game: GameId) {
    when (game) {
        GameId.PATCHES -> Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
            repeat(2) { r ->
                Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                    repeat(2) { c ->
                        Box(
                            Modifier
                                .size(11.dp)
                                .background(
                                    game.accent.copy(alpha = if ((r + c) % 2 == 0) 1f else 0.45f),
                                    RoundedCornerShape(3.dp)
                                )
                        )
                    }
                }
            }
        }
        GameId.SUDOKU -> Text("6", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = game.accent)
        GameId.ZIP -> Icon(Icons.Filled.Gesture, null, tint = game.accent, modifier = Modifier.size(26.dp))
        GameId.QUEENS -> Icon(Icons.Filled.WorkspacePremium, null, tint = game.accent, modifier = Modifier.size(26.dp))
        GameId.TANGO -> Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            Box(Modifier.size(13.dp).background(game.accent, CircleShape))
            Box(Modifier.size(13.dp).background(Color(0xFF3A3F4B), CircleShape))
        }
        GameId.TWENTY48 -> Surface(shape = RoundedCornerShape(6.dp), color = game.accent) {
            Text(
                "2048",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp,
                modifier = Modifier.padding(horizontal = 5.dp, vertical = 4.dp)
            )
        }
    }
}
