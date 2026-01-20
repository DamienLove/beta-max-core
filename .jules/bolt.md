## 2024-05-23 - Component Definition Inside Render
**Learning:** Defining React components inside other components forces a remount on every render, causing state loss and unnecessary DOM thrashing.
**Action:** Extract nested components to top-level or separate files and pass necessary data via props.

## 2024-05-24 - Form Input Latency
**Learning:** Rendering complex static UI elements (like selector buttons) inside a form component causes them to re-render on every keystroke, introducing input latency.
**Action:** Extract static UI sections into `React.memo` components so they don't re-render when form state (like text input) changes.

## 2024-05-25 - Inline List Item Rendering
**Learning:** In large single-file components like `PrototypeApp.tsx`, inline JSX for list items (via `.map`) forces re-rendering of all DOM nodes when the parent context updates, bypassing virtual DOM optimization opportunities.
**Action:** Extract list items into top-level `React.memo` components to allow React to skip rendering for items with stable props.
