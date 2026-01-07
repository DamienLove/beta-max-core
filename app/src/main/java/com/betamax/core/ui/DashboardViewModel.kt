package com.betamax.core.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.betamax.core.data.Mission
import com.betamax.core.data.MissionRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class DashboardViewModel(
    private val repository: MissionRepository = MissionRepository()
) : ViewModel() {

    private val _missions = MutableStateFlow<List<Mission>>(emptyList())
    val missions: StateFlow<List<Mission>> = _missions.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    init {
        fetchMissions()
    }

    private fun fetchMissions() {
        viewModelScope.launch {
            repository.getMissions().collect {
                _missions.value = it
                _loading.value = false
            }
        }
    }
}
