# Bolt's Journal

## 2024-05-22 - Frontend Code Splitting
**Learning:** React Router routes with static imports can significantly increase initial bundle size, even for routes the user doesn't visit immediately (like `MissionDetailsPage` or `AppRegistrationPage`).
**Action:** Use `React.lazy` and `Suspense` for route components to implement code splitting. This ensures users only download the code for the page they are currently viewing.
