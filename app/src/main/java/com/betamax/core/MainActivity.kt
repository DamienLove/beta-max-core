package com.betamax.core

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.betamax.core.ui.TerminalScreen
import com.betamax.core.ui.VisualDashboard
import com.betamax.core.ui.theme.BetaMaxTheme
import com.betamax.core.ui.theme.Cyan400
import com.betamax.core.ui.theme.Slate950

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BetaMaxTheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    var selectedTab by remember { mutableIntStateOf(0) }
    
    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Slate950,
                contentColor = Cyan400
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Text("VISUAL") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Cyan400,
                        indicatorColor = Slate950
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Text("TERMINAL") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Cyan400,
                        indicatorColor = Slate950
                    )
                )
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (selectedTab) {
                0 -> VisualDashboard()
                1 -> TerminalScreen()
            }
        }
    }
}
