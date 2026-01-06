# BETA MAX // SYSTEM CORE

> **"Tomorrow's Features, Today."**

Beta Max is a retro-futuristic beta testing platform designed for power users and technical enthusiasts. It bridges the gap between developers and testers by gamifying the QA process, offering advanced tools like a terminal interface and an AI-assisted query engine.

## 🏗 System Architecture

- **Project Name:** Beta Max
- **Repo Name:** `beta-max-core`
- **Lead Architect:** Damien Nichols

### Tech Stack

- **Frontend:** React 18 (via Vite)
- **Styling:** Tailwind CSS + Lucide Icons
- **Native Bridge:** Capacitor (Android Platform)
- **State Management:** React Hooks (Local State for Prototype)

---

## 🚀 Features

### 1. The "Deck" Interface
A cyberpunk-inspired UI featuring CRT scanlines, neon glows, and a "dark mode" first aesthetic.

### 2. Dual Operation Modes
- **VISUAL_MODE:** A rich GUI for browsing missions (beta programs), viewing stats, and tracking earnings.
- **TERMINAL_CLI:** A fully functional command-line interface for elite users.
  - Commands: `help`, `list missions`, `scan`, `gui`

### 3. Query Core (AI-Assisted)
- **Natural Language to SQL:** Users describe data they want (e.g., "Show me critical bugs in Titan OS").
- **BMQL (Beta Max Query Language):** The system translates natural language into a structured query syntax, teaching users database logic as they test.

### 4. The Reputation Economy
- **RP (Reputation Points):** Users earn currency and rank by submitting valid anomalies.
- **Quality Control:** Penalties for duplicate reports or flagging intended features as bugs.

---

## 🛠 Deployment Protocols

### The "Scorched Earth" Protocol (Android)
*Use this if Android Studio fails to update App Name, ID, or Icon configurations.*

1. **Delete** the `android/` folder in the root directory.
2. **Update** `capacitor.config.json` (if needed).
3. **Run:** `npx cap add android` to regenerate the native project from scratch.
4. **Sync:** `npx cap sync` to copy web assets.
5. **Deploy:** `npx cap open android`.

### Standard Build Cycle
1. Edit React code in `src/`.
2. `npm run build` (Vite build -> `dist/`).
3. `npx cap sync` (Copy `dist` to Android assets).
4. `npx cap open android` (Launch Android Studio).

---

## 📜 Project History (Pivots)
1. **"Bug Store"**: Initial concept—a marketplace for bugs.
2. **"Vanguard"**: Rebranded for "early access" features.
3. **"Apex"**: Introduced competitive reputation economy.
4. **"Vector"**: Web-based "Recon" and "Anomaly" terminology.
5. **"BETA MAX"**: Final Form. Retro-future aesthetic, Terminal integration, and AI Query Core.