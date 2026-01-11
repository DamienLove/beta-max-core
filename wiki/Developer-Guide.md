# Developer Guide

Protocols for building, deploying, and maintaining the Beta Max core systems.

## 🛠️ Build Environment

### Prerequisites
*   **JDK**: Version 17 or higher (Gradle 8.11 requires it).
*   **Android Studio**: Ladybug or newer recommended.
*   **Node.js**: v18+ (for Portal).
*   **Firebase CLI**: Authenticated with the project.

### Android Build (`app/`)
The Android project uses Gradle 8.11 and Kotlin 2.0.0.

```bash
# Clean and Build Debug APK
./gradlew clean assembleDebug
```

**Artifact Location**: `app/build/outputs/apk/debug/app-debug.apk`

### Portal Build (`betamax-portal/`)
The web portal is a standard Vite project.

```bash
cd betamax-portal
npm install
npm run dev   # Local development server
npm run build # Production build to dist/
```

---

## 🚀 Deployment Protocols

### The "Scorched Earth" Protocol
*Use this ONLY if the Android build configuration (Icons, App ID) is corrupted or stuck.*

1.  **Nuke**: Delete the `android/` folder in the root (if using Capacitor bridge).
2.  **Config**: Verify `capacitor.config.json` has the correct `appId`.
3.  **Regenerate**:
    ```bash
    npx cap add android
    ```
4.  **Sync**:
    ```bash
    npx cap sync
    ```
5.  **Launch**:
    ```bash
    npx cap open android
    ```

### Firebase Deployment
To deploy the Web Portal and Security Rules:

```bash
# Deploy everything (Hosting, Firestore Rules, Indexes)
firebase deploy

# Deploy only hosting
firebase deploy --only hosting
```

---

## ⚠️ Troubleshooting

### AAPT / Resource Errors
If you see errors regarding missing `mipmap` or `drawable` resources during build:
*   Ensure `ic_launcher.xml` and `ic_launcher_round.xml` exist in `app/src/main/res/mipmap-anydpi-v26/`.
*   Check that the referenced drawables (`ic_launcher_background`, `ic_launcher_foreground`) are present.

### Kotlin 2.0.0 & Kapt
We are using Kotlin 2.0.0. If you encounter annotation processing issues with Room:
*   Ensure the Room compiler version matches the supported Kotlin version.
*   Kapt may fall back to 1.9 compatibility mode; this is expected behavior for now.
