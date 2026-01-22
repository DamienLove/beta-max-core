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

## 2026-03-xx - Ligature Icon Accessibility
**Learning:** Google Material Symbols rely on ligatures (text content like "dashboard"), which screen readers pronounce if not explicitly hidden.
**Action:** Enforced `aria-hidden="true"` on the core `Icon` component to ensure icons remain purely decorative, preventing confusing audio announcements.

## 2026-03-xx - Form Validation Feedback
**Learning:** Users could submit empty forms because the submit button provided no feedback on validity.
**Action:** Implemented client-side validation that disables the action button and visually signals the disabled state, preventing bad data submission and guiding the user.
