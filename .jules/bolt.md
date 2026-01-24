## 2024-05-23 - Component Definition Inside Render
**Learning:** Defining React components inside other components forces a remount on every render, causing state loss and unnecessary DOM thrashing.
**Action:** Extract nested components to top-level or separate files and pass necessary data via props.

## 2024-05-24 - Form Input Latency
**Learning:** Rendering complex static UI elements (like selector buttons) inside a form component causes them to re-render on every keystroke, introducing input latency.
**Action:** Extract static UI sections into `React.memo` components so they don't re-render when form state (like text input) changes.

## 2024-05-24 - Inline List Rendering Re-renders
**Learning:** Rendering complex list items inline inside a component prevents `React.memo` from effective optimization, causing the entire list to re-render when the parent updates, even if list data hasn't changed.
**Action:** Extract list items to separate `React.memo` components, especially for potentially long lists like feedback or logs.
## 2025-02-18 - Context-Driven Re-renders
**Learning:** When using a single Context for global state, any update triggers re-renders in all consumers. Large views (like `ProjectDetail`) consuming context will re-render fully on unrelated updates (e.g., adding a version to another project).
**Action:** Extract and memoize list items (like `ProjectFeedbackItem`) in main views to isolate them from context-driven parent re-renders.


