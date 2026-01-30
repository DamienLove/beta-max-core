## 2026-01-13 - Accessibility First-Pass
**Learning:** The prototype application relied on visual proximity for form labels and icon meanings, completely omitting programmatic associations.
**Action:** Implemented a pattern of auditing all inputs for `id` + `htmlFor` pairings and all icon-buttons for `aria-label`. Future work should check for `aria-describedby` for error messages.

## 2026-02-xx - Semantic Interaction Pattern
**Learning:** The dashboard used `div` elements with `onClick` handlers for main navigation actions (Profile, Project Cards), making them inaccessible to keyboard users.
**Action:** Refactored to semantic `<button>` elements with `w-full text-left` to maintain layout while gaining native keyboard focus and activation support.

## 2026-02-xx - Mock Interaction Fidelity
**Learning:** Static mock elements (like file uploads) implemented as non-interactive divs create dead ends for keyboard users and lack feedback.
**Action:** Converted mock interactions to proper `<button>` elements with state toggles to provide expected accessibility and feedback, even without backend logic.

## 2026-02-xx - Navigation Accessibility
**Learning:** Custom navigation components often miss `aria-current` and focus indicators, leaving screen reader and keyboard users lost in the interface.
**Action:** Standardized `NavItem` pattern to include `aria-current='page'` and visible focus rings, ensuring navigation is accessible to all users.

## 2026-02-xx - Icon Ligature Accessibility
**Learning:** Using Google Material Symbols (ligatures) without `aria-hidden="true"` causes screen readers to announce the raw ligature text (e.g., "arrow_back") instead of the button's purpose, creating confusion.
**Action:** Enforced `aria-hidden="true"` on the base `Icon` component and ensured all interactive parent elements have explicit `aria-label` or text content.

## 2026-02-14 - Layout Occlusion by Floating Elements
**Learning:** Fixed bottom navigation elements and FABs can easily obscure the last item in a scrollable list, rendering actions (like buttons in empty states) inaccessible. Standard padding (e.g., `pb-24`) may be insufficient when stacking multiple fixed elements.
**Action:** When designing near the bottom edge of a viewport with floating overlays, always verify the bottom padding allows for over-scrolling so the last interactive element clears all overlays. Increased container padding to `pb-32` resolved this.

## 2026-01-30 - Prototype vs Production Code Mismatch
**Learning:** The file `PrototypeApp.tsx` appeared to be the main app, but `App.jsx` was the actual entry point mounted in `main.jsx`.
**Action:** Trace the component tree from the entry point (`main.jsx`) before assuming a file is active.
