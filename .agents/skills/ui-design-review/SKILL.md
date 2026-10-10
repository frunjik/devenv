---
name: ui-design-review
description: "Only on explicit request or agreement: review the visual design of a running UI and relevant source/styles. Review only; no automatic implementation."
---

# Review UI Design

Invoke only when requested or agreed. UI changes do not automatically require this review.

## Scope and method

1. Establish the requested UI/route/flow, user tasks and available states. Do not invent product intent.
2. Inspect representative viewports and interactions, including keyboard focus and narrow reflow where available. Check observations against relevant templates, styles and shared tokens.
3. Assess color/contrast, whitespace, alignment, scale, hierarchy, consistency, simplicity and typography together. Use applicable WCAG thresholds: 4.5:1 normal text; 3:1 large text and meaningful graphics.
4. Report concrete findings with severity, route/state, evidence, impact and recommendation; prioritize severity and avoid duplicate findings. Distinguish strengths, limitations and unverified observations.

- **High:** prevents or seriously impairs a common task.
- **Medium:** creates avoidable effort, confusion or reduced readability.
- **Low:** limited-impact refinement.

Do not modify UI, data or behavior without separate implementation scope approval. Report criteria proportionally; avoid repetitive empty checklists.

## References

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [Nielsen Norman Group: Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
