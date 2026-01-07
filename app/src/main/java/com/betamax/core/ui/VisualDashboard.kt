package com.betamax.core.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.betamax.core.R
import com.betamax.core.data.Mission
import com.betamax.core.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VisualDashboard(viewModel: DashboardViewModel = viewModel()) {
    val missions by viewModel.missions.collectAsState()
    val isLoading by viewModel.loading.collectAsState()

    val featuredMission = missions.firstOrNull()
    val newMissions = missions.take(5)
    val topPaying = missions.sortedByDescending { it.rewardValue.toIntOrNull() ?: 0 }.take(5)

    Scaffold(
        topBar = {
            Column(modifier = Modifier.background(Color.Black).padding(bottom = 8.dp)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_launcher_foreground),
                        contentDescription = "Beta Max Logo",
                        modifier = Modifier.size(40.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "BETA MAX",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Cyan400,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp
                    )
                }

                TextField(
                    value = "",
                    onValueChange = {},
                    placeholder = { Text("Search Missions...", color = Cyan900) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Cyan500) },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Slate900,
                        unfocusedContainerColor = Slate900,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        focusedTextColor = Cyan400,
                        cursorColor = Cyan400
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .height(50.dp)
                        .clip(RoundedCornerShape(25.dp))
                )
            }
        },
        containerColor = Color.Black
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Brush.verticalGradient(listOf(Color.Black, Slate950))),
            contentPadding = PaddingValues(bottom = 16.dp)
        ) {
            item {
                Text(
                    "FEATURED", 
                    style = MaterialTheme.typography.labelSmall, 
                    color = Cyan500, 
                    modifier = Modifier.padding(start = 16.dp, top = 16.dp, bottom = 8.dp)
                )
                featuredMission?.let { HeroCard(it) } ?: Box(modifier = Modifier.fillMaxWidth().height(200.dp).padding(16.dp).background(Slate900, RoundedCornerShape(16.dp)))
            }

            item {
                MissionControlStats()
            }

            item {
                SectionHeader("New Arrivals")
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(newMissions) { mission ->
                        AppStoreCard(mission)
                    }
                }
            }

            item {
                SectionHeader("High Payouts")
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(topPaying) { mission ->
                        AppStoreCard(mission)
                    }
                }
            }
        }
    }
}

@Composable
fun SectionHeader(title: String) {
    Text(
        title,
        style = MaterialTheme.typography.titleMedium,
        color = Color.White,
        modifier = Modifier.padding(start = 16.dp, top = 24.dp, bottom = 12.dp)
    )
}

@Composable
fun HeroCard(mission: Mission) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Slate900),
        border = BorderStroke(1.dp, Brush.linearGradient(listOf(Cyan500, Fuchsia500)))
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Brush.horizontalGradient(listOf(Cyan900.copy(alpha = 0.3f), Fuchsia900.copy(alpha = 0.3f))))
            )
            
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(16.dp)
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Badge(mission.status)
                    if (mission.type == "COMMUNITY") {
                        Badge("COMMUNITY")
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(mission.name, style = MaterialTheme.typography.titleLarge, color = Color.White)
                Text(mission.description, style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
            }
        }
    }
}

@Composable
fun AppStoreCard(mission: Mission) {
    Card(
        modifier = Modifier
            .width(160.dp)
            .height(180.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Slate900),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if ((mission.rewardValue.toIntOrNull() ?: 0) > 1000) Amber500 else Cyan500)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(mission.name, style = MaterialTheme.typography.titleSmall, maxLines = 1, color = Color.White)
            Text("By BetaMax Core", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            Spacer(modifier = Modifier.weight(1f))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Star, contentDescription = null, tint = Amber400, modifier = Modifier.size(12.dp))
                Text(" 4.8", style = MaterialTheme.typography.labelSmall, color = Color.White)
                Spacer(modifier = Modifier.weight(1f))
                Text("${mission.rewardValue} CR", style = MaterialTheme.typography.labelSmall, color = Amber400, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun MissionControlStats() {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("MISSION CONTROL", style = MaterialTheme.typography.labelSmall, color = Cyan500, modifier = Modifier.padding(bottom = 8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            BetaMaxStatCard(
                label = "Active",
                value = "3",
                color = Cyan400,
                modifier = Modifier.weight(1f)
            )
            BetaMaxStatCard(
                label = "Earned",
                value = "4.5k",
                color = Amber400,
                modifier = Modifier.weight(1f)
            )
            BetaMaxStatCard(
                label = "Rank",
                value = "TP",
                color = Fuchsia500,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun BetaMaxStatCard(
    label: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Slate900.copy(alpha = 0.5f)),
        border = BorderStroke(1.dp, color.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            Text(value, style = MaterialTheme.typography.titleLarge, color = color)
        }
    }
}

@Composable
fun Badge(text: String) {
    val (bgColor, borderColor, textColor) = when {
        text.contains("ALPHA") -> Triple(Color(0xFF3B0707), Color.Red, Color.Red)
        text == "COMMUNITY" -> Triple(Color(0xFF0C2038), Color(0xFF22D3EE), Color(0xFF22D3EE))
        else -> Triple(Color(0xFF022C22), Color.Green, Color.Green)
    }

    Surface(
        color = bgColor,
        border = BorderStroke(1.dp, borderColor),
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = text,
            color = textColor,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
