## 2024-05-23 - Component Definition Inside Render
**Learning:** Defining React components inside other components forces a remount on every render, causing state loss and unnecessary DOM thrashing.
**Action:** Extract nested components to top-level or separate files and pass necessary data via props.

## 2024-05-24 - Form Input Latency
**Learning:** Rendering complex static UI elements (like selector buttons) inside a form component causes them to re-render on every keystroke, introducing input latency.
**Action:** Extract static UI sections into `React.memo` components so they don't re-render when form state (like text input) changes.

## 2025-05-25 - Navigation Re-renders & Hook Ordering
**Learning:**
1. Inline arrow functions for navigation handlers (e.g., `onClick={() => navigate('/')}`) break `React.memo` on child components.
2. Conditional returns (early exits) must come *after* all hooks. Putting them before hooks causes "Rendered fewer hooks than expected" errors if the condition changes.
**Action:**
1. Wrap navigation handlers in `useCallback` and pass stable references to memoized nav items.
2. Always declare hooks at the top level of the component, before any conditional logic.
