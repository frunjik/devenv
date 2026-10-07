# UI Design Review (2026-10-07)

**Reviewed:** 2026-10-07
**Scope:** Running DevEnv UI at desktop and 390px mobile widths: Problem Inquiry (notes and ticket form), System Plan, Glossary, and Workflow TODO. Relevant templates and component styles were inspected.
**Status:** Findings recorded for later consideration; no implementation changes made.
**Limits:** No complete numeric contrast or keyboard accessibility audit; not every route or state was inspected. API was unavailable initially during the review and was started temporarily to inspect data-backed views.

## Findings

### 1. Dense mobile meta navigation

**Severity:** Medium
**Criteria:** Scale, visual hierarchy, simplicity
**Evidence:** At mobile width, the meta toolbar wraps into several rows of many similarly weighted links. Styles reduce button height to 28px and disable Material touch targets.
**Impact:** Dense navigation competes with page content and makes targets harder to use on touch screens.
**Recommendation:** Consider grouping secondary links in a collapsible menu, emphasizing primary destinations, and preserving comfortable touch targets.
**References:** `projects/client/src/app/navigation-toolbar/navigation-toolbar.component.scss`; `projects/client/src/app/navigation-toolbar/navigation-toolbar.component.html`.

### 2. Workflow table is cramped on mobile

**Severity:** Medium
**Criteria:** Scale, alignment, whitespace
**Evidence:** At 390px, resume buttons become narrow and wrap text tightly; the Related concern column is offscreen. The table wrapper permits horizontal scrolling but offers no explicit scroll cue.
**Impact:** Workflow names and resume actions are harder to scan and operate in a narrow viewport.
**Recommendation:** Consider a stacked/card row layout for narrow screens, or deliberate table sizing and a visible scroll affordance.
**References:** `projects/client/src/app/system/workflow-todo/workflow-todo.component.scss`; `projects/client/src/app/system/workflow-todo/workflow-todo.component.html`.

### 3. Problem Inquiry native controls differ from the theme

**Severity:** Low
**Criteria:** Consistency, color
**Evidence:** Form controls and buttons in the notes and ticket workflows render with browser-default gray surfaces against the dark green UI. Shared dark `.form-control` styling exists but is not applied to these controls.
**Impact:** The controls look visually detached from their surrounding interface.
**Recommendation:** Consider applying the shared control treatment consistently while retaining feature-specific layout and spacing.
**References:** `projects/client/src/app/problem-inquiry/input-converter/input-converter.component.scss`; `projects/client/src/app/problem-inquiry/ticket-framing/ticket-framing.component.scss`; `projects/client/src/styles.scss`.

## Strengths

- The dark green palette is cohesive, and sampled text/statuses appeared legible; status is conveyed with labels as well as color.
- System Plan has a clear heading, progress summary, and concern-list hierarchy.
- Card spacing and alignment are consistent in the sampled glossary and plan views.
- Typography is readable in the sampled views.
