package com.betamax.core.data

import android.content.Context
import android.content.pm.PackageManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jsoup.Jsoup

data class DetectedBeta(
    val name: String,
    val packageId: String,
    val versionName: String,
    val whatsNew: String = "No intel available."
)

class ReconScanner(private val context: Context) {

    suspend fun scanDevice(): List<DetectedBeta> = withContext(Dispatchers.IO) {
        val pm = context.packageManager
        // Get all installed apps
        val packages = pm.getInstalledPackages(PackageManager.GET_META_DATA)
        
        val detected = mutableListOf<DetectedBeta>()

        for (pkg in packages) {
            val appInfo = pkg.applicationInfo
            if (appInfo == null) continue

            // Filter out system apps usually
            val isSystem = (appInfo.flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM) != 0
            val version = pkg.versionName ?: ""
            
            // Heuristic: Check for "beta", "test", "dev", "nightly" in version string
            // OR if it is a known package we are tracking (simplified here to just heuristics)
            val isBetaSignal = version.contains("beta", ignoreCase = true) ||
                               version.contains("test", ignoreCase = true) ||
                               version.contains("dev", ignoreCase = true) ||
                               version.contains("alpha", ignoreCase = true)

            // For demo purposes, we also include any app that starts with "com.betamax"
            val isInternal = pkg.packageName.startsWith("com.betamax")

            if ((!isSystem && isBetaSignal) || isInternal) {
                val label = pm.getApplicationLabel(appInfo).toString()
                val intel = fetchPlayStoreIntel(pkg.packageName)
                
                detected.add(DetectedBeta(
                    name = label,
                    packageId = pkg.packageName,
                    versionName = version,
                    whatsNew = intel
                ))
            }
        }
        detected
    }

    private fun fetchPlayStoreIntel(packageId: String): String {
        return try {
            val url = "https://play.google.com/store/apps/details?id=$packageId&hl=en_US&gl=US"
            val doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .timeout(5000)
                .get()

            // Select specific Play Store elements. These classes change often, 
            // so we look for standard attributes or sections.
            // As of 2025/2026 this selector might need tuning, but generic 'div[itemprop=description]' 
            // or searching for "What's New" text is safer.
            
            // Attempt 1: Look for "What's New" header sibling
            val whatsNewHeader = doc.select("h2:containsOwn(What's New)").first()
            if (whatsNewHeader != null) {
                // Usually the content is in a div following the header or close by
                // This is brittle, but efficient for a hackathon/MVP
                return whatsNewHeader.parent()?.text()?.replace("What's New", "")?.trim() ?: "Encrypted Signal."
            }

            "Intel unavailable or classified."
        } catch (e: Exception) {
            "Connection failed: ${e.message}"
        }
    }
}
