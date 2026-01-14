## 2026-01-13 - Accessibility First-Pass
**Learning:** The prototype application relied on visual proximity for form labels and icon meanings, completely omitting programmatic associations.
**Action:** Implemented a pattern of auditing all inputs for `id` + `htmlFor` pairings and all icon-buttons for `aria-label`. Future work should check for `aria-describedby` for error messages.

## 2026-01-14 - Keyboard Navigation in Cards
**Learning:** Interactive "Cards" (like project summaries) were implemented as `div`s with `onClick`, completely bypassing keyboard users.
**Action:** Converted these `div` wrappers to semantic `<button>` elements with `text-left` and `w-full` to preserve the card layout while gaining native keyboard accessibility (focus, enter/space support) for free.
