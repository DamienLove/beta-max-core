package com.betamax.core.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "missions")
data class Mission(
    @PrimaryKey val id: String,
    val name: String,
    val status: String, // BETA_ACTIVE, ALPHA_UNSTABLE
    val bugs: Int,
    val payout: Int,
    val description: String,
    val tableName: String
)
