package com.gamestest.games.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gamestest.games.ui.clickableNoRipple
import com.gamestest.games.ui.theme.BrandBlue
import com.gamestest.games.ui.theme.Gold
import com.gamestest.games.ui.theme.TextMuted

private data class Job(val title: String, val company: String, val location: String, val posted: String)

private val sampleJobs = listOf(
    Job("Brand Engagement & Content Lead", "UNILEVER", "Karachi", "1 day ago"),
    Job("Manager Information System", "The Citizens Foundation", "Pakistan", "23 hours ago"),
    Job("Specialist, Business Development", "Delivery Hero", "Karachi", "2 days ago"),
    Job("Senior Android Engineer", "Careem", "Lahore", "3 days ago"),
)

@Composable
fun HomeScreen(onOpenGames: () -> Unit) {
    var tab by remember { mutableIntStateOf(0) }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = { HomeBottomBar(tab) { tab = it } }
    ) { inner ->
        LazyColumn(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(
                start = 16.dp, end = 16.dp,
                top = inner.calculateTopPadding() + 12.dp,
                bottom = inner.calculateBottomPadding() + 16.dp
            ),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item { TopBar() }
            item { ToolCards(onOpenGames = onOpenGames) }
            item {
                Text(
                    "Latest Jobs",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
            items(sampleJobs) { JobCard(it) }
        }
    }
}

@Composable
private fun TopBar() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Filled.Menu, contentDescription = "Menu", modifier = Modifier.size(28.dp))
        Spacer(Modifier.width(12.dp))
        Surface(
            modifier = Modifier
                .weight(1f)
                .height(48.dp),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 1.dp
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Filled.Search, contentDescription = null, tint = TextMuted)
                Spacer(Modifier.width(10.dp))
                Text("Search for job", color = TextMuted)
            }
        }
        Spacer(Modifier.width(12.dp))
        Icon(
            Icons.Filled.EmojiEvents,
            contentDescription = "Premium",
            tint = Gold,
            modifier = Modifier.size(32.dp)
        )
    }
}

@Composable
private fun ToolCards(onOpenGames: () -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        // Big left card
        Card(
            modifier = Modifier
                .weight(1f)
                .height(248.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text(
                    "AI Resume Creator",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(12.dp))
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    Icon(
                        Icons.Filled.Description,
                        contentDescription = null,
                        tint = BrandBlue,
                        modifier = Modifier.size(96.dp)
                    )
                }
            }
        }
        // Right column: Optimizer + Games (replaces Mock Interview)
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SmallToolCard(
                title = "AI Resume\nOptimizer",
                icon = Icons.AutoMirrored.Filled.MenuBook,
                tint = BrandBlue,
                onClick = {}
            )
            SmallToolCard(
                title = "Games",
                icon = Icons.Filled.SportsEsports,
                tint = Gold,
                highlight = true,
                onClick = onOpenGames
            )
        }
    }
}

@Composable
private fun SmallToolCard(
    title: String,
    icon: ImageVector,
    tint: Color,
    highlight: Boolean = false,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(118.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (highlight) BrandBlue else MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = if (highlight) Gold else tint,
                modifier = Modifier.size(40.dp)
            )
            Text(
                title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = if (highlight) Color.White else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
private fun JobCard(job: Job) {
    var saved by remember { mutableIntStateOf(0) }
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Surface(
                    shape = RoundedCornerShape(50),
                    color = Color(0xFFE6F4EA),
                    modifier = Modifier.size(48.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Filled.Person, contentDescription = null, tint = Color(0xFF2E7D32))
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        job.title,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(Modifier.height(2.dp))
                    Text("${job.company} • ${job.location}", color = TextMuted, fontSize = 13.sp)
                    Spacer(Modifier.height(2.dp))
                    Text(job.posted, color = TextMuted, fontSize = 12.sp)
                }
                Icon(
                    if (saved == 1) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder,
                    contentDescription = "Save",
                    tint = if (saved == 1) BrandBlue else TextMuted,
                    modifier = Modifier
                        .size(24.dp)
                        .clickableNoRipple { saved = 1 - saved }
                )
            }
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Chip("HYBRID")
                Chip("Full-time")
                Spacer(Modifier.weight(1f))
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = BrandBlue
                ) {
                    Text(
                        "Apply",
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 28.dp, vertical = 10.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun Chip(text: String) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Text(
            text,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 13.sp,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
        )
    }
}

@Composable
private fun HomeBottomBar(selected: Int, onSelect: (Int) -> Unit) {
    data class Tab(val label: String, val icon: ImageVector)
    val tabs = listOf(
        Tab("Home", Icons.Filled.Home),
        Tab("Search Job", Icons.Filled.Search),
        Tab("Saved Jobs", Icons.Filled.BookmarkBorder),
        Tab("Copilot", Icons.Filled.AutoAwesome),
    )
    NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
        tabs.forEachIndexed { i, t ->
            NavigationBarItem(
                selected = selected == i,
                onClick = { onSelect(i) },
                icon = { Icon(t.icon, contentDescription = t.label) },
                label = { Text(t.label, fontSize = 11.sp) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = BrandBlue,
                    selectedTextColor = BrandBlue,
                    indicatorColor = Color.Transparent,
                    unselectedIconColor = TextMuted,
                    unselectedTextColor = TextMuted,
                )
            )
        }
    }
}
