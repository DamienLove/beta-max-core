## 2024-05-23 - Component Definition Inside Render
**Learning:** Defining React components inside other components forces a remount on every render, causing state loss and unnecessary DOM thrashing.
**Action:** Extract nested components to top-level or separate files and pass necessary data via props.

## 2024-05-24 - Optimizing Context Consumers
**Learning:** React Context consumers re-render on every provider update. Expensive computations (like filtering lists) inside consumers run on every update, and inline list items force child re-renders.
**Action:** Memoize derived data with `useMemo` and extract list items to `React.memo` components with stable callbacks (via `useCallback`) to isolate updates.
