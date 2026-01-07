package com.betamax.core.data

import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class MissionRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    fun getMissions(): Flow<List<Mission>> = callbackFlow {
        val subscription = firestore.collection("missions")
            .whereEqualTo("status", "ACTIVE")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val missions = snapshot.documents.mapNotNull { doc ->
                        doc.toObject(Mission::class.java)?.copy(id = doc.id)
                    }
                    trySend(missions)
                }
            }
        awaitClose { subscription.remove() }
    }
    
    // For developers to see their own missions (including pending ones)
    fun getArchitectMissions(architectId: String): Flow<List<Mission>> = callbackFlow {
        val subscription = firestore.collection("missions")
            .whereEqualTo("architectId", architectId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val missions = snapshot.documents.mapNotNull { doc ->
                        doc.toObject(Mission::class.java)?.copy(id = doc.id)
                    }
                    trySend(missions)
                }
            }
        awaitClose { subscription.remove() }
    }
}
