package com.betamax.core

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.betamax.core.auth.SessionState
import com.betamax.core.auth.SessionViewModel
import com.betamax.core.auth.UserProfile
import com.betamax.core.ui.DashboardViewModel
import com.betamax.core.ui.TerminalScreen
import com.betamax.core.ui.VisualDashboard
import com.betamax.core.ui.auth.LoginScreen
import com.betamax.core.ui.auth.ProfileScreen
import com.betamax.core.ui.auth.ProfileSetupScreen
import com.betamax.core.ui.theme.BetaMaxTheme
import com.betamax.core.ui.theme.Cyan400
import com.betamax.core.ui.theme.Slate950
import com.google.firebase.FirebaseApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        FirebaseApp.initializeApp(this)
        setContent {
            BetaMaxTheme {
                BetaMaxApp()
            }
        }
    }
}

@Composable
fun BetaMaxApp(sessionViewModel: SessionViewModel = viewModel()) {
    val sessionState by sessionViewModel.state.collectAsState()
    val authError by sessionViewModel.authError.collectAsState()

    when (val state = sessionState) {
        SessionState.Loading -> LoadingScreen()
        SessionState.SignedOut -> LoginScreen(
            authError = authError,
            onClearError = sessionViewModel::clearAuthError,
            onSignIn = sessionViewModel::signIn,
            onSignUp = sessionViewModel::signUp,
            onGoogleCredential = sessionViewModel::signInWithCredential
        )
        is SessionState.NeedsProfile -> ProfileSetupScreen(
            email = state.user.email ?: "",
            authError = authError,
            onSubmit = sessionViewModel::createTesterProfile,
            onSignOut = sessionViewModel::signOut
        )
        is SessionState.SignedIn -> MainScreen(
            profile = state.profile,
            onSignOut = sessionViewModel::signOut,
            onUpdateProfile = sessionViewModel::updateTesterProfile
        )
        is SessionState.Error -> {
            LoadingScreen(message = state.message)
        }
    }
}

@Composable
fun MainScreen(
    profile: UserProfile,
    onSignOut: () -> Unit,
    onUpdateProfile: (String, Int, String, String) -> Unit,
    dashboardViewModel: DashboardViewModel = viewModel()
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    LaunchedEffect(profile.uid, profile.role) {
        dashboardViewModel.start(profile)
    }

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
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Text("PROFILE") },
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
                0 -> VisualDashboard(profile = profile, viewModel = dashboardViewModel)
                1 -> TerminalScreen(profile = profile, viewModel = dashboardViewModel)
                2 -> ProfileScreen(
                    profile = profile,
                    onUpdate = onUpdateProfile,
                    onSignOut = onSignOut
                )
            }
        }
    }
}

@Composable
fun LoadingScreen(message: String = "Loading...") {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        if (message == "Loading...") {
            CircularProgressIndicator(color = Cyan400)
        } else {
            Text(text = message, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
