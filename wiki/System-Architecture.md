# System Architecture

Beta Max operates as a dual-platform ecosystem: a **Web Portal** for management and a **Native Android App** for field operations.

## 🏗 Tech Stack

### 📱 Android Application (`app/`)
The primary interface for Scouts performing Recon.
*   **Language**: Kotlin 2.0.0
*   **UI Framework**: Jetpack Compose
*   **Architecture**: MVVM (Model-View-ViewModel)
*   **Local Data**: Room Database (SQLite abstraction)
*   **Key Features**:
    *   **Device Recon**: Scans the user's device for installed beta apps.
    *   **Terminal Interface**: A functional CLI for power users.
    *   **Visual Dashboard**: A rich GUI for tracking missions.

### 🌐 Web Portal (`betamax-portal/`)
The command center for Architects and the onboarding point for Scouts.
*   **Framework**: React 18 (via Vite)
*   **Styling**: Tailwind CSS v4 + Lucide Icons
*   **State**: React Context (AuthContext)
*   **Hosting**: Firebase Hosting

### ☁️ Backend & Infrastructure
*   **Platform**: Google Firebase
*   **Auth**: Firebase Authentication (Email/Password + Google Sign-In)
*   **Database**: Cloud Firestore
    *   **Security**: Role-based rules (Architects vs. Scouts).
    *   **Data Model**: Missions, Anomalies, Users, Leaderboards.
*   **AI Core**: Integrated AI for "Query Core" (Natural Language to BMQL).

## 🧩 Key Components

### The "Query Core"
An AI-driven engine that translates natural language requests into database queries.
*   *Input*: "Show me all critical crashes in the Titan OS beta."
*   *Process*: LLM Interpretation -> BMQL Syntax Generation -> Firestore Query.
*   *Output*: Filtered list of Anomaly Logs.

### The "Deck" Interface
A shared design system across Web and Mobile that implements the cyberpunk aesthetic.
*   **CRT Shader**: Custom CSS/Compose modifiers to simulate screen curvature and scanlines.
*   **Glitch Effects**: UI transitions that mimic signal interference.

## 📂 Project Structure
```text
C:\Projects\beta-max-core\
├── app\                  # Native Android Application
│   ├── src\main\java\    # Kotlin Source Code
│   └── src\main\res\     # Android Resources
├── betamax-portal\       # React Web Application
│   ├── src\              # React Components & Pages
│   └── public\           # Static Assets
├── experiments\          # Python scripts for data probing
└── firebase.json         # Firebase Configuration
```
