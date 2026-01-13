## 2024-03-27 - Hardcoded Secrets in Frontend Config
**Vulnerability:** Found hardcoded Firebase API keys and configuration in `src/firebase.js`.
**Learning:** Even if keys are technically public (like some Firebase keys), hardcoding them sets a bad precedent and makes environment management (dev/staging/prod) impossible without code changes. It also risks exposing more sensitive keys if developers follow the same pattern.
**Prevention:** Use `import.meta.env` (Vite) or `process.env` (Node) for all configuration. Add `.env` to `.gitignore` immediately upon project creation. Provide `.env.example` for onboarding.
