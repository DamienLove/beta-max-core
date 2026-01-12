# Bolt's Journal

## 2026-01-12 - Component Definition Inside Component Anti-Pattern
**Learning:** Found `NavItem` component defined *inside* `NavigationWrapper` component. This causes `NavItem` to be redefined on every render of `NavigationWrapper`, leading to unmounting and remounting of the DOM node. This destroys local state (if any) and forces unnecessary layout/paint, and prevents React from diffing the component properly.
**Action:** Always define components outside of other components. Use `React.memo` and pass necessary props (like callbacks and active state) to optimize rendering, especially for navigation items that re-render frequently on route changes.
