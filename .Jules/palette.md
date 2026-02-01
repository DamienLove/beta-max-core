## 2024-05-23 - Dynamic ARIA Labels for Toggle Buttons
**Learning:** Icon-only toggle buttons (like sound controls) must use dynamic `aria-label`s that reflect the *action* (e.g., "Mute sound" vs "Enable sound") rather than just the state, to provide clear context to screen reader users.
**Action:** When implementing toggle buttons, always derive the `aria-label` from the current state variable.
