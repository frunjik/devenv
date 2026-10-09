# InteractiveCanvas Prototype (provisional)

## Checkpoint

**Status:** Completed — isolated canvas clock prototype implemented and verified.

**Purpose:** Explore an HTML Canvas foundation as a possible alternative to the current Diagram Editor. Keep this prototype isolated so the existing `/diagram` experience remains available for comparison.

**Provisional names:** `InteractiveCanvas` and `InteractiveCanvas Prototype` are working names only; neither is established terminology.

**Agreed first-slice outcome:** Add a standalone canvas component on a separate client route. The canvas visibly renders the current time and refreshes once per second. This is an experiment, not yet a decision to replace the existing editor or a commitment to any future editor architecture.

**Evaluation:** The `interactive-canvas-clock-prototype` WorkEvaluation records the beneficiary, intended outcome, success condition, baseline, and start time. Active effort and post-delivery user outcome remain unknown until supported by evidence.

**Implementation:** Added a standalone component at the separate `/interactive-canvas` route. It draws the local time centered on a 640 × 360 canvas and redraws once a second; it reports an unavailable 2D context and clears its interval on destruction. The existing `/diagram` page was not modified.

**Verification:** The initial clock-render test failed before implementation because the component did not exist, then passed after implementation. Both focused suites pass (10 tests), and `interactive-canvas.component.ts` plus `app.routes.ts` have 100% statement, branch, function, and line coverage. The client build passes. The evaluation JSON validated, workflow registration tests pass (25 tests), the generated TODO view is deterministic, and `git diff --check` passes. Browser verification showed the clock on `/interactive-canvas`, detected changed canvas pixels after 1.1 seconds, and confirmed `/diagram` still loads the existing editor. The pixel-readback diagnostic emitted a Canvas2D performance warning during verification; it is not used by the application. Follow-up user outcome and rework remain unknown.

**Type review:** No domain Type is justified for this prototype. The actual canvas clock uses built-in `HTMLCanvasElement` and `CanvasRenderingContext2D`; the component's optional timer handle represents whether its view lifecycle installed an interval. Unlike the existing `DiagramDocument`, the clock has no persisted domain state, operations, or alternative selection states to model. Avoid adding a speculative editor model until concrete interactions are agreed.

**Next:** No further step is agreed. Keep future editor scope and the provisional `InteractiveCanvas` name open for user review; the prototype does not decide to replace the Diagram Editor.
