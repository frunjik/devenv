---
name: ui-design-review
description: Review a system's running UI and relevant source/styles for visual design quality and actionable improvements.
---

# Review UI Design

## Trigger
- Use when the user asks to review, assess, or critique the visual design of a system UI.

## Scope
- Review the requested UI, route, or flow; clarify the target if it is not identifiable.
- Identify the users' main tasks. Inspect the running UI at relevant viewport sizes and states, then check relevant templates, styles, and shared design tokens.
- Review only. Do not edit code or apply recommendations unless the user separately asks for implementation.

## Review Criteria
Assess each criterion in the context of the target UI:

1. **Color and contrast** — palette use, text and control contrast, and whether color is the only way meaning or state is conveyed. Check WCAG contrast thresholds: 4.5:1 for normal text, 3:1 for large text and meaningful UI graphics.
2. **Whitespace** — spacing and empty areas support grouping, readability, and focus rather than creating crowding or unexplained gaps.
3. **Alignment** — related elements share intentional edges, baselines, and spacing.
4. **Scale** — relative sizes and proportions make content legible and controls usable without distorting priority.
5. **Visual hierarchy** — layout, size, contrast, and emphasis make the intended order of attention clear.
6. **Consistency** — repeated elements and patterns behave and appear alike; local variations have a reason.
7. **Simplicity** — remove or consolidate visual and interaction complexity that does not help users complete their tasks.
8. **Typography** — readable type sizes, line lengths, hierarchy, and consistent text styles.

## Workflow
1. Establish the target, main tasks, and available states; do not invent product intent.
2. Inspect representative viewports and interaction states, including keyboard focus and narrow/reflowed layouts when available. Verify visual observations against source and design tokens where possible.
3. Assess all eight criteria together. Report concrete issues, not taste; avoid duplicate findings.
4. For each finding, give severity, route/state, evidence, user impact, and a practical recommendation. Label unverified observations and cite source locations when identifiable.
5. List criteria with no material issue briefly. State what could not be inspected.
6. Order findings by severity, then summarize strengths and review limits. Make no UI changes.

## Severity
- **High:** A substantial visual or interaction barrier that prevents or seriously impairs a common task.
- **Medium:** A noticeable issue that creates avoidable effort, confusion, or reduced readability.
- **Low:** A refinement with limited task impact that would improve polish or consistency.

## Success Criteria
- The review addresses all eight requested criteria without inventing product requirements.
- Findings are specific, supported by inspected evidence, prioritized, and paired with actionable recommendations.
- Strengths, limitations, and unknowns are distinguished from findings.
- No implementation changes are made as part of the review.

## References
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) — contrast, focus visibility, and reflow.
- [Understanding WCAG 2.2: Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
- [Nielsen Norman Group: 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) — consistency, status, user control, and simplicity.
