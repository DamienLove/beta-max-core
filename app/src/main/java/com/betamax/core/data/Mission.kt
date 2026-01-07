package com.betamax.core.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "missions")
data class Mission(
    @PrimaryKey val id: String = "",
    val name: String = "",
    val platform: String = "",
    val packageId: String = "",
    val description: String = "",
    val targetTier: String = "",
    val rewardType: String = "",
    val rewardValue: String = "",
    val architectId: String = "",
    val status: String = "",
    val bugsFound: Int = 0,
    val createdAt: Long = 0L,
    // New fields for Community/External missions
    val type: String = "OFFICIAL", // OFFICIAL vs COMMUNITY
    val externalIssuesUrl: String = "",
    val storeUrl: String = ""
)
