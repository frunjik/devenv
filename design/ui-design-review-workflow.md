# UI Design Review Fixes

## Checkpoint

**Status:** Completed; all three findings are addressed.
**Source review:** [UI Design Review (2026-10-07)](../reviews/ui-design-review-2026-10-07.md)

### Completed

- **Finding 1 — Dense mobile meta navigation:** Grouped secondary links and the commit action behind a mobile “More” control. System plan, Workflow TODO, and Browse remain visible; desktop navigation remains expanded.
- Added a focused expand/collapse test and verified the navigation component at 100% statement, branch, function, and line coverage.
- **Finding 2 — Workflow table is cramped on mobile:** Set a mobile minimum table width, prevented resume labels from wrapping, and added a visible horizontal-scroll hint. Made the scroll region labelled and keyboard-focusable.
- **Finding 3 — Problem Inquiry native controls differ from the theme:** Applied the shared `.form-control` class to text fields, selects, and actions in the notes and ticket forms, preserving unstyled radio controls and local form sizing.
- The Workflow TODO and Problem Inquiry components have 100% statement, branch, function, and line coverage. The shared library and client builds succeed.

### Decisions

- Treat the first three existing navigation links as primary destinations, preserving their current order.
- Keep secondary links available on mobile through an explicit expandable control; preserve all navigation routes and commit behavior.
- Use 44px mobile controls and restore the Material touch target.
- Keep the workflow table semantically tabular, using deliberate horizontal sizing and a visible scroll cue on mobile rather than a separate card layout.

### Scope notes

- `TODO-RAW.md` was present as an untracked user file and was left unchanged.
- No domain Type changes were needed; the navigation expansion is view state and the remaining changes are presentation-only.
