## 2025-01-07 - Code Splitting React Routes
**Learning:** Initial page loads were downloading all application logic due to synchronous imports in `App.jsx`.
**Action:** Implemented `React.lazy` and `Suspense` to split code by route. This reduced the main bundle size from ~638kB to ~587kB (gzip ~195kB to ~182kB) and ensures pages are loaded only when needed. Verified by inspecting build output chunks.
