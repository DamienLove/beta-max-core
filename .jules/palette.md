## 2026-01-13 - Accessibility First-Pass
**Learning:** The prototype application relied on visual proximity for form labels and icon meanings, completely omitting programmatic associations.
**Action:** Implemented a pattern of auditing all inputs for `id` + `htmlFor` pairings and all icon-buttons for `aria-label`. Future work should check for `aria-describedby` for error messages.
