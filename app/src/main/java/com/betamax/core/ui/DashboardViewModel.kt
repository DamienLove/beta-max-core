package com.betamax.core.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.betamax.core.auth.UserProfile
import com.betamax.core.data.Mission
import com.betamax.core.data.MissionRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

class DashboardViewModel(
    private val repository: MissionRepository = MissionRepository()
) : ViewModel() {

    private var activeProfile: UserProfile? = null
    private var missionJob: Job? = null

    private val _missions = MutableStateFlow<List<Mission>>(emptyList())
    val missions: StateFlow<List<Mission>> = _missions.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun start(profile: UserProfile) {
        val current = activeProfile
        if (current?.uid == profile.uid && current?.role == profile.role) return
        activeProfile = profile
        missionJob?.cancel()
        _loading.value = true
        _error.value = null
        missionJob = viewModelScope.launch {
            val flow = if (profile.role == "developer") {
                repository.getArchitectMissions(profile.uid)
            } else {
                repository.getMissions()
            }
            flow.catch { error ->
                _missions.value = emptyList()
                _loading.value = false
                _error.value = error.message ?: "Failed to load missions."
            }.collect { missions ->
                _missions.value = missions
                _loading.value = false
                _error.value = null
            }
        }
    }
}
