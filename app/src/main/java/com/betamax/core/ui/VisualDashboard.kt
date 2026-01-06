package com.betamax.core.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.betamax.core.data.Mission
import com.betamax.core.ui.theme.*

@Composable
fun VisualDashboard() {
    // Mock Data
    val missions = listOf(
        Mission("PRJ-01", "NEBULA_STREAM", "BETA_ACTIVE", 142, 500, "Next-gen audio streaming.", "nebula_issues"),
        Mission("PRJ-02", "TITAN_OS", "ALPHA_UNSTABLE", 12, 1500, "Experimental Android launcher.", "titan_core")
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Slate900, Color.Black)))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            HeaderSection()
        }
        
        items(missions) { mission ->
            MissionCard(mission)
        }
    }
}

@Composable
fun HeaderSection() {
    Column(modifier = Modifier.padding(bottom = 16.dp)) {
        Text("MISSION CONTROL", style = MaterialTheme.typography.titleLarge, color = Cyan400)
        Text("STATUS: ONLINE", style = MaterialTheme.typography.labelSmall, color = Cyan900)
    }
}

@Composable
fun MissionCard(mission: Mission) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Slate900.copy(alpha = 0.5f)),
        border = BorderStroke(1.dp, Cyan900),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(mission.name, style = MaterialTheme.typography.titleLarge, color = Color.White)
                Badge(mission.status)
            }
            Text(mission.id, style = MaterialTheme.typography.labelSmall, color = Cyan500)
            Spacer(modifier = Modifier.height(8.dp))
            Text(mission.description, style = MaterialTheme.typography.bodyLarge, color = Color.Gray)
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("${mission.payout} CR", color = Amber400)
                Text("${mission.bugs} ANOMALIES", color = Cyan400)
            }
        }
    }
}

@Composable
fun Badge(text: String) {
    Surface(
        color = if (text.contains("ALPHA")) Color(0xFF3B0707) else Color(0xFF022C22),
        border = BorderStroke(1.dp, if (text.contains("ALPHA")) Color.Red else Color.Green),
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = text,
            color = if (text.contains("ALPHA")) Color.Red else Color.Green,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
