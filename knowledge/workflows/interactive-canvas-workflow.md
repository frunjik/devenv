# InteractiveCanvas Prototype (provisional)

## Checkpoint

**Status:** Active - canvas editor plan saved and selected on 2026-10-09. The initial clock slice is complete; editor implementation has not started.

**Purpose:** Explore an HTML Canvas foundation as a possible alternative to the current Diagram Editor. Keep this prototype isolated so the existing `/diagram` experience remains available for comparison.

**Provisional names:** `InteractiveCanvas` and `InteractiveCanvas Prototype` are working names only; neither is established terminology.

**Agreed first-slice outcome:** Add a standalone canvas component on a separate client route. The canvas visibly renders the current time and refreshes once per second. This is an experiment, not yet a decision to replace the existing editor or a commitment to any future editor architecture.

**Evaluation:** The `interactive-canvas-clock-prototype` WorkEvaluation records the beneficiary, intended outcome, success condition, baseline, and start time. Active effort and post-delivery user outcome remain unknown until supported by evidence.

**Implementation:** Added a standalone component at the separate `/interactive-canvas` route. It draws the local time centered on a 640 × 360 canvas and redraws once a second; it reports an unavailable 2D context and clears its interval on destruction. The existing `/diagram` page was not modified.

**Verification:** The initial clock-render test failed before implementation because the component did not exist, then passed after implementation. Both focused suites pass (10 tests), and `interactive-canvas.component.ts` plus `app.routes.ts` have 100% statement, branch, function, and line coverage. The client build passes. The evaluation JSON validated, workflow registration tests pass (25 tests), the generated TODO view is deterministic, and `git diff --check` passes. Browser verification showed the clock on `/interactive-canvas`, detected changed canvas pixels after 1.1 seconds, and confirmed `/diagram` still loads the existing editor. The pixel-readback diagnostic emitted a Canvas2D performance warning during verification; it is not used by the application. Follow-up user outcome and rework remain unknown.

**Type review:** No domain Type is justified for this prototype. The actual canvas clock uses built-in `HTMLCanvasElement` and `CanvasRenderingContext2D`; the component's optional timer handle represents whether its view lifecycle installed an interval. Unlike the existing `DiagramDocument`, the clock has no persisted domain state, operations, or alternative selection states to model. Avoid adding a speculative editor model until concrete interactions are agreed.

**Next:** Begin slice 1 below with a focused failing test for responsive canvas sizing and device-pixel-ratio handling. Before slice 2, resolve the sketch-versus-architecture-view and editing decisions below. Keep `/diagram` unchanged.

## Canvas editor plan

Saved at the user's request on 2026-10-09. The user requested this workflow be active and keep all metrics. The plan records a direction and staged acceptance conditions; unresolved choices are not silently adopted. Names remain provisional.

### Goal and concrete example

Interactively create a readable picture of DevEnv, its parts, and their relationships. The first useful example is **DevEnv client -> DevEnv API -> Workspace resources**, arranged by the user with labelled directed arrows.

The existing [architecture JSON](../architecture/devenv-c4.json) describes these parts and relationships. It remains a current-architecture draft, not verified architecture. Its authority is unchanged.

### Responsibilities

1. Architecture meaning: parts, responsibilities, and relationships.
2. Picture layout: positions, sizes, groups, and the parts included in a view.
3. Editor interaction: selection, dragging, connecting, viewport, and temporary previews.

The provisional InteractiveCanvas handles rendering and pointer-coordinate conversion. The editor handles user actions and picture meaning. Neither handles filesystem persistence or API access directly.

### Existing-model constraint

[DiagramDocument](../../projects/shared/src/lib/diagram.types.ts) represents positioned shapes but treats connections as undirected and rejects multiple connections between a pair. DevEnv architecture relationships are directed. Reuse compatible geometry and operations where appropriate, but do not force architecture meaning into this contract or change the existing editor's contract without agreement.

### Implementation slices

| Slice | Needed capability | Acceptance |
| --- | --- | --- |
| 1. Canvas foundation | Container resizing, device-pixel-ratio handling, pointer-to-canvas coordinate conversion, and change-driven redraw scheduling using requestAnimationFrame. | Text stays sharp and coordinates remain correct after resizing. No continuous idle frame loop; the clock may still schedule redraws when its displayed second changes. |
| 2. One editable part | A labelled box, selection, dragging, and label editing through an HTML control. Start with DevEnv client. | Create, select, move, and rename the part without a position jump. |
| 3. Several parts | Add/remove boxes, deterministic hit testing and drawing order, and stable identities. | Independently arrange and select Client, API, and Workspace resources. |
| 4. Relationships | Source/target selection, temporary line preview, directed arrows, editable relationship labels, and cancellation. | Create Client requests data from API; arrows remain attached when parts move; cancellation leaves no incomplete relationship. |
| 5. DevEnv meaning | References to existing architecture part identities, responsibility/technology display, and a distinction between existing and proposed parts. | Layout changes do not silently change architectural facts. |
| 6. Boundaries and navigation | System boundary, contained parts, pan, zoom, and fit-to-picture. Agree grouping semantics first. | Correct selection and dragging under zoom; larger pictures remain navigable. |
| 7. Save and restore | Reviewed explicit Types, runtime validation, versioned JSON, and deliberate save/load boundaries. Prefer references to architecture data over copies. | Reload preserves meaning and layout; malformed data causes a visible error. |
| 8. Usability and output | Undo/redo, keyboard controls, an accessible HTML list/inspector, and image export. | Reverse actions, operate without relying solely on pixels, and export a PNG matching the picture. |

### First useful milestone

Complete slices 1-4 and perform this real-browser scenario before architecture integration, grouping, or persistence:

1. Create DevEnv client, DevEnv API, and Workspace resources.
2. Arrange them by dragging.
3. Connect them with labelled arrows.
4. Move the API and verify both arrows stay attached.
5. Cancel an unfinished connection and delete a part without dangling relationships.

Assess whether this approach feels better than the existing editor; tests alone do not prove responsiveness or usability.

### Open decisions

- Is the picture a free-form sketch or a view of the existing architecture model?
- Does editing a part change architectural facts or only its visual label/layout?
- Is saving required in the first milestone, or may it initially be in-memory?
- Are parts added with a palette, an Add button, or a canvas gesture?
- Does grouping represent actual containment or only visual organization? Resolve before slice 6.
- Candidate Type names and refinements require review and explicit adoption before becoming established.

### Measurement and verification

The completed clock evaluation is preserved. The `interactive-canvas-editor-milestone` record in [devenv-value-evaluation.json](./devenv-value-evaluation.json) tracks the new first milestone with all five existing metrics. Its ID is a bookkeeping identifier, not an adopted domain Term. Keep unknown measures unknown and do not record completion until acceptance is verified. Track subsequent eligible slices separately as they begin, retaining their links in the workflow registry.

For each production slice: Red-Green-Refactor, public-interface tests, 100% statement/branch/function/line coverage for changed modules, Type review, an appropriate client build, and real browser/pointer checks. Tests mock external boundaries and do not mutate the real filesystem. Record acceptance evidence, elapsed time, observed decision points, and unresolved user outcomes without inferring active effort or AI credits.

The detailed plan remains in this existing Markdown checkpoint under the maintained workflow convention. Workflow selection/status and evaluation measures remain authoritative in their existing Typed JSON sources. No source migration or universal plan schema is introduced by saving this plan.
