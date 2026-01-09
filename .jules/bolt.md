# Bolt's Journal

## 2024-05-22 - [Initial Entry]
**Learning:** Started Bolt journal.
**Action:** Record critical learnings here.

## 2024-05-22 - [Environment Inconsistencies]
**Learning:** The codebase memory stated `eslint.config.js` existed and the app used route-based splitting, but both were false. The project also lacked `index.html` and had broken imports preventing build.
**Action:** Always verify "known" state with `list_files` and build checks before optimizing. Don't trust memory blindly.
