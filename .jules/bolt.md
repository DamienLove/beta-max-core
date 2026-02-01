## 2024-05-23 - Component Definition Inside Render
**Learning:** Defining React components inside other components forces a remount on every render, causing state loss and unnecessary DOM thrashing.
**Action:** Extract nested components to top-level or separate files and pass necessary data via props.

## 2024-05-24 - Form Input Latency
**Learning:** Rendering complex static UI elements (like selector buttons) inside a form component causes them to re-render on every keystroke, introducing input latency.
**Action:** Extract static UI sections into `React.memo` components so they don't re-render when form state (like text input) changes.

## 2024-05-24 - Inline List Rendering Re-renders
**Learning:** Rendering complex list items inline inside a component prevents `React.memo` from effective optimization, causing the entire list to re-render when the parent updates, even if list data hasn't changed.
**Action:** Extract list items to separate `React.memo` components, especially for potentially long lists like feedback or logs.

## 2025-03-04 - Unstable Callbacks Break Memoization
**Learning:** Passing inline arrow functions (e.g., `onClick={() => navigate('/')}`) to memoized child components forces them to re-render every time the parent renders, defeating `React.memo`.
**Action:** Pass stable primitives (like path strings) instead of callbacks where possible, or wrap callbacks in `useCallback`.

## 2025-05-27 - Inline Handlers Defeat Memoization
**Learning:** Even with `React.memo`, passing an inline arrow function prop (e.g., `onClick={() => navigate(...)}`) causes the component to re-render every time because the function reference changes.
**Action:** Use hooks (like `useNavigate`) directly inside the memoized component for navigation, or pass stable callback references using `useCallback`.
