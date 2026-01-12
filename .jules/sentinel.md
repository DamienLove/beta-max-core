## 2024-02-05 - Insecure Firestore Rules
**Vulnerability:** The `betamax-portal/firestore.rules` file contained a rule allowing read/write access to everyone until 2026. This effectively made the entire database public and writable by anyone.
**Learning:** Default or "test mode" configurations in Firebase can easily be left in production if not explicitly checked. The presence of a secure `firestore.rules` in the root did not guarantee that the actual deployed application (in `betamax-portal`) was using it.
**Prevention:** Always verify `firebase.json` configuration to see which rules file is actually being used. Automate checks for "allow read, write: if true" or timestamp-based open access in CI/CD.
