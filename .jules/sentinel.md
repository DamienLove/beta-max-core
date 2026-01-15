## 2024-03-27 - Hardcoded Secrets in Frontend Config
**Vulnerability:** Found hardcoded Firebase API keys and configuration in `src/firebase.js`.
**Learning:** Even if keys are technically public (like some Firebase keys), hardcoding them sets a bad precedent and makes environment management (dev/staging/prod) impossible without code changes. It also risks exposing more sensitive keys if developers follow the same pattern.
**Prevention:** Use `import.meta.env` (Vite) or `process.env` (Node) for all configuration. Add `.env` to `.gitignore` immediately upon project creation. Provide `.env.example` for onboarding.

## 2024-05-22 - Insecure Firestore Rules (Public Access)
**Vulnerability:** Firestore rules were configured to allow public read/write access to everyone (`allow read, write: if request.time < ...`).
**Learning:** Default "Test Mode" rules provided by Firebase are often left unchanged, creating a massive security hole where anyone with the project ID can dump or delete the database.
**Prevention:** Always initialize Firestore with "Production Mode" (deny all) or immediately configure `request.auth != null` rules. Never rely on time-based rules for security.
