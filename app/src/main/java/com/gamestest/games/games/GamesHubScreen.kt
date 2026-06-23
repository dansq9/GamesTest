package com.gamestest.games.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
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
import com.gamestest.games.games.common.Brain
import com.gamestest.games.games.common.formatTime
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun GamesHubScreen(onBack: () -> Unit, onOpenGame: (String) -> Unit) {
    val context = LocalContext.current
    val progress = GameProgress.get(context)
    val stats = GameId.all.associateWith { progress.stats(it.id) }

    val today = LocalDate.now().toEpochDay()
    val solvedToday = stats.values.count { it.doneToday }
    val maxStreak = stats.values.maxOfOrNull { it.streak } ?: 0
    val dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("EEE, d MMM", Locale.getDefault()))

    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(bottom = 24.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                HubHeader(onBack, dateStr)
                Column(Modifier.padding(16.dp)) {
                    StreakCard(maxStreak, solvedToday, GameId.all.size)
                    Spacer(Modifier.height(14.dp))
                    BadgeRow(stats.values.toList())
                    Spacer(Modifier.height(2.dp))
                }
            }
        }
        items(GameId.all) { game ->
            GameCard(
                game = game,
                stats = stats.getValue(game),
                modifier = Modifier.padding(
                    start = if (GameId.all.indexOf(game) % 2 == 0) 16.dp else 0.dp,
                    end = if (GameId.all.indexOf(game) % 2 == 0) 0.dp else 16.dp,
                    bottom = 12.dp
                ),
                onClick = { onOpenGame(game.id) }
            )
        }
    }
}

@Composable
private fun HubHeader(onBack: () -> Unit, dateStr: String) {
    Column(Modifier.fillMaxWidth().background(Brain.Card)) {
        Row(
            Modifier.fillMaxWidth().windowInsetsPadding(WindowInsets.statusBars)
                .padding(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                Modifier.size(36.dp).background(Brain.Page, CircleShape).clickable(onClick = onBack),
                contentAlignment = Alignment.Center
            ) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Brain.InkSoft, modifier = Modifier.size(18.dp)) }
            Column {
                Text("Brain Games", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, color = Brain.Ink)
                Text(dateStr, color = Brain.Muted, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun StreakCard(streak: Int, solved: Int, total: Int) {
    Row(
        Modifier.fillMaxWidth().background(Brain.Card, RoundedCornerShape(16.dp))
            .border(1.dp, Brain.Border, RoundedCornerShape(16.dp)).padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            Text("🔥", fontSize = 22.sp)
            Column {
                Text("$streak", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, color = Brain.Ink)
                Text("day streak", color = Brain.Muted, fontWeight = FontWeight.SemiBold, fontSize = 11.sp)
            }
        }
        Box(Modifier.size(width = 1.dp, height = 36.dp).background(Color(0xFFECECF0)))
        Row(Modifier.weight(1f).padding(start = 16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            Box(Modifier.size(24.dp).border(2.5.dp, Brain.Blue, CircleShape), contentAlignment = Alignment.Center) {
                Box(Modifier.size(9.dp).background(Brain.Blue, CircleShape))
            }
            Column {
                Row(verticalAlignment = Alignment.Bottom) {
                    Text("$solved", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, color = Brain.Ink)
                    Text("/$total", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = Color(0xFFC2C7CE))
                }
                Text("solved today", color = Brain.Muted, fontWeight = FontWeight.SemiBold, fontSize = 11.sp)
            }
        }
    }
}

@Composable
private fun BadgeRow(all: List<GameProgress.Stats>) {
    val anyDone = all.any { it.doneToday || it.bestSeconds > 0 }
    val maxStreak = all.maxOfOrNull { it.streak } ?: 0
    val minBest = all.filter { it.bestSeconds > 0 }.minOfOrNull { it.bestSeconds } ?: Int.MAX_VALUE
    val allToday = all.isNotEmpty() && all.all { it.doneToday }
    val defs = listOf(
        "First win" to anyDone,
        "3 day streak" to (maxStreak >= 3),
        "Speed solver" to (minBest < 60),
        "Full house" to allToday,
        "On fire" to (maxStreak >= 7),
    )
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        for ((label, on) in defs) {
            Text(
                (if (on) "★ " else "") + label,
                color = if (on) Color(0xFFB5651D) else Brain.Muted,
                fontWeight = FontWeight.Bold,
                fontSize = 11.5.sp,
                modifier = Modifier
                    .background(if (on) Color(0xFFFFF7EE) else Color(0xFFF4F5F7), RoundedCornerShape(20.dp))
                    .border(1.dp, if (on) Color(0xFFFFDCAE) else Brain.Border, RoundedCornerShape(20.dp))
                    .padding(horizontal = 11.dp, vertical = 6.dp)
            )
        }
    }
}

@Composable
private fun GameCard(game: GameId, stats: GameProgress.Stats, modifier: Modifier, onClick: () -> Unit) {
    val done = stats.doneToday
    val foot = if (done) {
        if (game == GameId.G2048) "Best ${stats.bestScore} pts" else "Best ${if (stats.bestSeconds > 0) formatTime(stats.bestSeconds) else "–"}"
    } else "Daily puzzle"
    Column(
        modifier
            .height(158.dp)
            .background(Brain.Card, RoundedCornerShape(16.dp))
            .border(1.5.dp, if (done) Brain.GreenBd else Brain.Border, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(14.dp)
    ) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Box(Modifier.size(44.dp).background(Brain.BlueSoft, RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
                GameIcon(game)
            }
            Text(
                if (done) "✓ Solved" else "Play",
                color = if (done) Brain.Green else Brain.Blue,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp,
                modifier = Modifier
                    .background(if (done) Brain.GreenBg else Brain.BlueSoft, RoundedCornerShape(20.dp))
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            )
        }
        Spacer(Modifier.weight(1f))
        Text(game.title, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = Brain.Ink)
        Text(game.blurb, color = Brain.Muted, fontWeight = FontWeight.SemiBold, fontSize = 11.5.sp, lineHeight = 15.sp)
        Spacer(Modifier.height(8.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(Color(0xFFF0F1F3)))
        Spacer(Modifier.height(8.dp))
        Text(foot, color = if (done) Brain.ChipInk else Brain.Muted, fontWeight = FontWeight.Bold, fontSize = 11.5.sp)
    }
}

@Composable
private fun GameIcon(game: GameId) {
    when (game) {
        GameId.PATCHES -> Squares(listOf(Brain.Blue, Color(0xFFA9C3EF), Color(0xFFA9C3EF), Brain.Blue))
        GameId.SUDOKU -> Text("6", fontWeight = FontWeight.Black, fontSize = 22.sp, color = Brain.Blue)
        GameId.ZIP -> Dots3()
        GameId.QUEENS -> Text("★", fontSize = 22.sp, color = Brain.Blue)
        GameId.TANGO -> Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            Box(Modifier.size(11.dp).background(Brain.Blue, CircleShape))
            Box(Modifier.size(11.dp).border(2.dp, Brain.Blue, CircleShape))
        }
        GameId.G2048 -> Squares(listOf(Color(0xFFA9C3EF), Color(0xFF5E8FE0), Color(0xFF2F6BD0), Brain.Blue))
        GameId.CLUSTERS -> Squares(listOf(Color(0xFFF0A93A), Color(0xFF3F7FE0), Color(0xFF1E8E3E), Color(0xFF8A64C8)))
        GameId.CROSSWORD -> CrossMini()
        GameId.LIGHTSOUT -> Squares(listOf(Brain.Blue, Color(0xFFC5CDD9), Color(0xFFC5CDD9), Brain.Blue))
    }
}

@Composable
private fun Squares(colors: List<Color>) {
    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
        for (r in 0 until 2) Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
            for (c in 0 until 2) Box(Modifier.size(9.dp).background(colors[r * 2 + c], RoundedCornerShape(2.dp)))
        }
    }
}

@Composable
private fun Dots3() {
    Row(horizontalArrangement = Arrangement.spacedBy(3.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(8.dp).background(Brain.Blue, CircleShape))
        Box(Modifier.size(8.dp).background(Brain.Blue.copy(alpha = 0.6f), CircleShape))
        Box(Modifier.size(8.dp).background(Brain.Blue.copy(alpha = 0.3f), CircleShape))
    }
}

@Composable
private fun CrossMini() {
    Column(verticalArrangement = Arrangement.spacedBy(1.5.dp)) {
        for (r in 0 until 3) Row(horizontalArrangement = Arrangement.spacedBy(1.5.dp)) {
            for (c in 0 until 3) {
                val black = (r * 3 + c) == 2 || (r * 3 + c) == 6
                Box(Modifier.size(7.dp).background(if (black) Brain.Ink else Brain.Blue, RoundedCornerShape(1.5.dp)))
            }
        }
    }
}
