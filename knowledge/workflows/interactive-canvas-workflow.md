# InteractiveCanvas Prototype (provisional)

## Checkpoint

**Status:** Active - slices 1 through 4 complete, including undirected labelled sketch connections. Next is slice 5: architectural meaning, after agreeing what the sketch denotes.

**Purpose:** Explore an HTML Canvas foundation as a possible alternative to the current Diagram Editor. Keep this prototype isolated so the existing `/diagram` experience remains available for comparison.

**Names:** The user's approved separation on 2026-10-09 supersedes the earlier component name: CanvasDiagramEditor is the editor component, ICanvas is its canvas surface contract, InteractiveCanvas implements that contract, and MockCanvas implements it in editor tests. IBrowser and MockBrowser remain the underlying browser boundary and test implementation. `InteractiveCanvas Prototype` remains the provisional workflow name. Interface-name approval does not adopt an editor domain model.

**Agreed first-slice outcome:** Add a standalone canvas component on a separate client route. The canvas visibly renders the current time and refreshes once per second. This is an experiment, not yet a decision to replace the existing editor or a commitment to any future editor architecture.

**Evaluation:** The `interactive-canvas-clock-prototype` WorkEvaluation records the beneficiary, intended outcome, success condition, baseline, and start time. Active effort and post-delivery user outcome remain unknown until supported by evidence.

**Implementation:** Added a standalone component at the separate `/interactive-canvas` route. It draws the local time centered on a 640 × 360 canvas and redraws once a second; it reports an unavailable 2D context and clears its interval on destruction. The existing `/diagram` page was not modified.

**Verification:** The initial clock-render test failed before implementation because the component did not exist, then passed after implementation. Both focused suites pass (10 tests), and `interactive-canvas.component.ts` plus `app.routes.ts` have 100% statement, branch, function, and line coverage. The client build passes. The evaluation JSON validated, workflow registration tests pass (25 tests), the generated TODO view is deterministic, and `git diff --check` passes. Browser verification showed the clock on `/interactive-canvas`, detected changed canvas pixels after 1.1 seconds, and confirmed `/diagram` still loads the existing editor. The pixel-readback diagnostic emitted a Canvas2D performance warning during verification; it is not used by the application. Follow-up user outcome and rework remain unknown.

**Type review:** No domain Type is justified for this prototype. The actual canvas clock uses built-in `HTMLCanvasElement` and `CanvasRenderingContext2D`; the component's optional timer handle represents whether its view lifecycle installed an interval. Unlike the existing `DiagramDocument`, the clock has no persisted domain state, operations, or alternative selection states to model. Avoid adding a speculative editor model until concrete interactions are agreed.

**Next:** Slice 5: architectural meaning. Current parts and undirected connections are free-form sketches, not validated architectural facts. Agree any meaning/refinement before implementation; keep `/diagram` unchanged.

### Slice 4 checkpoint

- User chose current canvas editor rather than Morphic evaluation; undirected labelled sketch connections, created by selecting a part, pressing Connect, then clicking a second part. Approved local SketchConnection: numeric identity, two SketchPart references, label. One per distinct unordered pair; self/duplicate attempts report a visible message. Cancel exits mode; empty clicks retain it. Draw behind boxes, follow endpoint movement, HTML list for label/removal; removing a part removes incident connections. No persistence or formal architectural meaning.
- Existing shared DiagramConnection confirms distinct-pair semantics but uses persisted string ids, so retain separate approved sketch Type rather than adapting that format. Reuse MockCanvas and MockScheduler; expand drawing contract/mocks only for actual line operations. No Jest interception needed.
- New five-metric evaluation approved and registered before Red. First test: source selection, Connect, destination click creates a connection without dragging destination. Remaining: invalid attempts/cancel, label/remove list, geometry, incident cleanup, coverage/build/browser acceptance. Checklist trial slice 2 of 3.
- Time-gate checkpoint: first Red observed missing Connect control; minimal Green links source/destination without destination drag. Eleven editor tests pass. This is not slice acceptance: self/duplicate validation, cancellation, rendering, label/removal controls and incident cleanup are not implemented yet; no full coverage/build/browser acceptance claimed. Phase cleared. Resume with next failing validation/cancellation test, then rendering/controls; evaluation remains incomplete.
- Second time-gate checkpoint: validation/cancel, HTML label/removal list, incident cleanup, and straight border-to-border lines now implemented. Existing canvas/browser contracts and surface mocks expose path drawing operations; no new external dependency. Twenty-six tests across editor/surface/browser pass at 100% four-metric coverage for changed production modules. Tests caught cleanup accidentally placed in renamePart; moved to removal and added rename-preserves-connections regression. Two new test-sequence expectations corrected while Green. Remaining: final refactor/Type review, build/test-source diagnostics, desktop/narrow runtime acceptance and any responsive corrections, evaluation/checklist trial completion. Phase cleared; no commit.
- Acceptance (2026-10-09 23:23:44 CEST): 26 editor/surface/browser tests pass with 100% statements/branches/functions/lines for editor and changed drawing contracts. Client build passes; test-source check retains unrelated Glossary/Workflow TODO errors with no canvas diagnostics. No persistence, directed semantics, Morphic dependency, or changes to existing Diagram behavior.
- Visible desktop verifies real Connect creation, straight line ink between separated boxes, connection label uses, renaming a part without losing its connection, moved endpoint reference/position, self and duplicate messages, Cancel, and incident cleanup on part removal. Initial message counts sampled too early; repeat after UI update verifies the actual messages. Visible 320px/380px checks show matching backing size and no horizontal overflow; minimum 180px canvas permits document scrolling rather than collapsing. At page bottom, connection row bottom 638.719px is above toolbar top 688.688px (320px) / 702.219px (380px). Clock pixels change over 2.1 seconds; real Remove connection clears its row.
- Final Type review: SketchConnection references two existing SketchParts, not labels/positions copied at creation. Creation enforces distinct unordered pair uniqueness and sequential identity; part removal enforces reference lifetime. Tests contrast reversed duplicates, self attempts, endpoint moves, coincident positions and unrelated surviving connections. Optional connectionSource expresses awaiting destination; Cancel/completion/source removal end the mode. No additional state union or reusable graph Type justified in this bounded slice; no Glossary meaning adopted.
- Checklist trial slice 2 of 3: existing mocks/contracts reused before tests; no Jest interception or test external I/O; approvals, observed Red, full coverage/build and separate compliance review performed. No omitted practice identified in final review. Corrections: misplaced cleanup caught by tests, two new test-sequence expectations fixed, and final rendering test uses public renameConnection rather than assigning the label. Friction: browser visibility required user assistance; immediate status sampling required waiting for UI update; narrow controls require normal page scrolling. Active effort/overhead unknown. One trial slice remains; effectiveness not yet established.
- Evaluation completed with 8 minutes 20 seconds wall-clock including decisions, gates and browser visibility waits. Phase cleared and saved/API state verified at completion. Changes uncommitted. Next is slice 5; do not start automatically.

### Slice 3 checkpoint

- User approved generic Add part creation and evaluation in this existing workflow. Approved refinements: SketchPart has never-reused numeric id; parts array determines creation/drawing order; selectedPart is SketchPart or undefined; CanvasDrag owns the grabbed part. Labels Part 1, Part 2, etc.; creation offsets repeat over a small diagonal pattern. Newest draws and hit-tests on top; selection does not reorder. Remove selected clears selection and drag. No persistence or relationships.
- Pre-test dependency check: reuse existing ICanvas/MockCanvas and IScheduler/MockScheduler in editor tests; no new boundary or Jest interception. Current-time reading unchanged and tested around synchronous painting. Existing Diagram model is not adopted for free-form sketch semantics.
- Evaluation recorded before Red. First Red checks repeated Add part draws independently labelled boxes; remaining steps: identity/selection refinement, overlapping hit tests, drag ownership, remove lifecycle, full coverage/build and visible browser acceptance. Checklist trial slice 1 of 3 begins here; record actual misses/corrections/friction at completion.
- Continuation checkpoint: repeated creation and selection/removal tests failed before production changes. Green implements approved model and controls; nine editor tests pass with 100% statement/branch/function/line coverage. Phase cleared at time gate. Remaining: final Type/refactor review, stronger identity/order/placement assertions as needed, client build/test-source diagnostics, visible desktop/narrow acceptance, evaluation and trial completion. No commit.
- Acceptance (2026-10-09 23:11:10 CEST): ten editor tests pass with 100% statement/branch/function/line coverage. Exact assertions cover repeating four-position creation pattern, ids not reused after removal, topmost overlap hit, unchanged creation/drawing order on older-part selection, and selected border. Client build passes. Test-source check retains unrelated Glossary/Workflow TODO errors; no canvas diagnostics.
- Visible desktop: Part 2 selected over Part 1, dragged 20px right/30px down to approximately (68, 78.011), renamed DevEnv API, removed; remaining Part 1 unchanged and next created Part 3 has id 3. Selection/edit/remove controls disabled after removal. Backing matches CSS content. Visible 380px and 320px checks show no horizontal overflow, 44px buttons, matching backing dimensions, stable origin on selection and no toolbar overlap; clock pixels change over 2.1 seconds.
- Final Type review: approved SketchPart id separates identity from equal/changing labels; selectedPart reference denotes one existing in-memory part or no selection, and CanvasDrag retains that part and pointer ownership. Removal clears selection/drag; tests contrast absent selection with active overlap selection and removal mid-drag. No new Type, persisted format, architecture meaning, or generic collection abstraction justified.
- Checklist trial slice 1 of 3: dependency check reused both existing mocks before tests; no Jest interception or test external I/O; required design approvals, observed Red, coverage, build, and separate compliance review performed. No missed applicable checks identified in this review; no production correction/rework after first Green. Friction: shared browser location was unclear; opened an integrated page before resuming with permission. Existing test-source errors explicitly reported. Active effort and overhead unknown. Two trial slices remain; effectiveness not yet established.
- Evaluation completed; elapsed 4 minutes 27 seconds including decisions, gate and browser-location assistance. Phase cleared; changes uncommitted. This checkpoint supersedes historical next-step statements above; next is slice 4, not started.

### Editor/surface separation checkpoint

- Scheduler correction (2026-10-09 22:54 CEST): user approved reusing existing IScheduler/SCHEDULER for the editor's one-second invalidation, with cancellation and plain MockScheduler consumer tests. Preserve current-time reading; do not introduce IClock. Success: exact 1000ms registration, tick-driven redraw, cancellation on destruction, and no registration after failed surface initialization. Earlier deferral of this existing boundary was mistaken; correcting before committing.
- Correction complete (2026-10-09 22:55 CEST): Red observed missing scheduler registration (expected 1000, received undefined), then Green with injected SCHEDULER and optional cancellation callback. MockScheduler ticks verify redraw and cessation after destruction; failed initialization registers no recurring work. No Jest fake timers or time advancement remain in editor tests. Current-time output checked around synchronous painting without advancing wall time. Eight editor tests pass with 100% all-four coverage; client build and changed-file editor diagnostics pass. Existing IScheduler fits; no new Type or clock abstraction. No fresh live-browser check for this correction; earlier editor/surface acceptance remains separate evidence. Phase cleared; changes uncommitted.

- User approved CanvasDiagramEditor for the editor, ICanvas for its surface contract, InteractiveCanvas for the implementation, and MockCanvas for editor tests. Keep IBrowser below the real surface and retain the existing route, clock, and slice 2 behavior. No multi-part features in this refactor.
- Canvas initialization accepts an HTML canvas element and a content-render callback in logical pixels. Surface owns backing sizing/transform/clearing, coalesced redraws, pointer conversion/capture, and cleanup. Editor owns controls, sketch state, selection/hit testing, drag offset/ownership, label editing, and the demo clock.
- Evaluation canvas-editor-surface-separation registered before Red. Extraction, lifecycle/behavior tests, coverage, build, and browser regression now complete. Changes uncommitted.
- Surface extraction checkpoint: ICanvas and InteractiveCanvas exist; four surface tests pass at 100% on all four metrics. Editor component/template/styles renamed to canvas-diagram-editor and route rewired. Existing editor tests still reference the old component and must now be migrated to plain MockCanvas; the whole refactor is not yet verified. Phase cleared at continuation gate.
- Editor tests now inject plain MockCanvas through component-scoped CANVAS; browser mechanics tested separately via MockBrowser. Twenty-six editor/surface/browser/route tests pass; changed editor, surface, token, and routes have 100% four-metric coverage. Client build passes. Test-source check has no changed-file diagnostics but retains unrelated existing errors.
- Visible desktop acceptance: fresh route loads CanvasDiagramEditor with InteractiveCanvas surface; create, drag outside/back, rename, deselect, unchanged canvas origin, matching backing size, and clock pixel changes over 2.1 seconds verified. Narrow pointer test preserves layout and moves by intended offset, but backing-size check was hidden and is not acceptance evidence. Next: visible narrow resize/drawing check, final Type review, completion/metrics. Phase cleared at continuation gate; no commit.
- Completion (2026-10-09 22:52:09 CEST): subsequent visible 380px check verifies backing 320 x 301 matches CSS content, sketch ink, no horizontal overflow, and canvas bottom 639px above toolbar top 702.219px. Earlier hidden resize measurement is superseded, not used as acceptance. Live high-DPR change was verified in slice 1; current extraction's DPR behavior is covered by surface/adapter tests, not a new live DPR change.
- Final Type review: ICanvas is justified by the actual CanvasDiagramEditor collaboration; it exposes content rendering, invalidation, logical pointer conversion, capture, and cleanup without browser sizing details. Optional session groups element, redraw, and cleanup ownership: initialize rejects duplicates, operations reject absent sessions, destroy is idempotent and permits reinitialization. Tests contrast initialized use with before-initialize/after-destroy errors. Retain this representation; no extra session Type or generic canvas framework justified. Existing SketchPart/CanvasDrag unchanged; clock/scheduler boundary refinement deferred, not silently expanded into this refactor.
- Evaluation completed with verified acceptance and 5 minutes 30 seconds wall-clock; active effort, process overhead, and follow-up outcome remain unknown. Phase cleared and toolbar displays TDD: idle. No additional meta-level insight identified. Next: slice 3 naming/selection decisions; do not start automatically.

### Slice 2 acceptance (2026-10-09 22:42:03 CEST)

- One in-memory SketchPart can be created, selected, moved with pointer capture, and renamed through an HTML control. Add part is disabled after creation in this single-part slice. CanvasDrag preserves grab offset and owning pointer; release, cancellation, and lost capture end dragging without rolling back movement already applied.
- Real narrow-screen Red found that conditionally revealing the label editor shifted canvas origin by about 80px during drag. Kept the editor rendered but disabled without selection; tests assert this stable control lifecycle. Real repeat keeps canvas bounds unchanged and moves (24, 24) to approximately (44, 54.047) for a 20px-right/30px-down gesture.
- Desktop acceptance after fresh reload: real pointer travels outside the canvas and back while captured, finishes at approximately (44, 54.019), then renames to Client sketch. Ink readback confirms rendering; backing dimensions match content times DPR. Empty-space click deselects and disables editing; Add part remains disabled.
- Seventeen focused tests pass with 100% statement, branch, function, and line coverage for both production modules; client build passes. Test-source check has no canvas diagnostics; unrelated existing test errors remain. Clock and existing Diagram code preserved.
- Local approved Types are SketchPart (sketch label and logical position) and CanvasDrag (owning pointer and grab offset). Single-part selection is adequately represented by a boolean until multiple identities are introduced. No architecture reference, persistent model, or extra clock/scheduler abstraction introduced.
- Evaluation records acceptance and elapsed time; the structured record was added at this checkpoint rather than before Red. Outcome/baseline had been agreed in the saved plan and conversation, but this timing is a tracking gap, not retroactive evidence of a pre-work record. Active effort and follow-up usability unknown.
- TDD phase cleared after acceptance. Changes uncommitted. No additional meta-level insight identified.

### Slice 2 creation checkpoint (2026-10-09)

- User chose an Add part button that creates DevEnv client. Approved local Type names SketchPart (label and position) and CanvasDrag (pointer ownership and grab offset, not implemented yet). Fixed 180 x 80 logical-pixel dimensions for the first box; in-memory sketch only.
- Red confirmed missing Add part control. Green adds one box at (24, 24), labelled DevEnv client, using the existing coalesced drawing frame. Button disables after creation; later slices add multiple parts. Clock retained.
- Thirteen component/adapter tests pass with 100% four-metric coverage for both modules; client build passes. Drawing boundary adds strokeRect, recorded by plain MockBrowser.
- Runtime creation changes component state and disables the button. However, after hot reload the visible shared browser reports DPR 5 and CSS content 260 x 297 while backing remains 640 x 360; no ink was detected in the expected box area. Runtime drawing acceptance is pending, not claimed. Investigate this delivery/sizing discrepancy before expanding interactions; earlier foundation DPR transition evidence remains historical, not proof of this checkpoint.
- Selection, drag ownership/offset, pointer capture/cancellation, and HTML label editing remain unimplemented. No commit yet. Phase cleared at continuation gate.

### Slice 2 interaction checkpoint (2026-10-09)

- Selection, 3px selected border, HTML label input, grab-offset dragging owned by a pointer ID, capture, pointer release/cancellation/lost-capture cleanup implemented. Other pointers cannot move/end the active drag; secondary-button starts are ignored. Empty labels currently remain allowed.
- Seventeen focused tests pass with 100% four-metric coverage for both production modules; client build passes. Boundary-adapter pointer-capture test uses a Jest callback; component uses plain MockBrowser. No unsafe context casts.
- Fresh reload resolves the earlier hot-reload bitmap mismatch: live DPR 5 backing matches CSS dimensions. Add part creates state and disables its control. Full drag/rename runtime acceptance remains pending: fresh browser interaction stalled while waiting for a visible/stable Add part control.
- Before accepting drag behavior, check whether showing the label control moves the canvas during pointerdown on narrow screens; this could shift the coordinate origin despite a correct grab offset. If confirmed, keep editor layout stable across selection, with a disabled label control when unavailable, rather than ignoring coordinate changes.
- Next: restore visible browser, verify real dragging/rename/deselection/capture and narrow layout, add regression if needed, run test-source check and final tests/build. Slice 2 not complete. Phase cleared at continuation gate; changes uncommitted.

### High-density acceptance and correction (2026-10-09 22:34:13 CEST)

- Visible browser changed from DPR 1 to 3 without a CSS resize; this exposed stale 260 x 357 backing dimensions instead of 780 x 1071. Existing element/window resize listeners did not cover density-only transitions.
- Red adapter test confirmed no resolution-query subscription. Green added a resolution media-query change listener inside IBrowser.observeResize; it re-registers at the new density and triggers the existing sizing callback. Cleanup removes the current listener alongside element/window observation.
- Twelve component/adapter tests pass with 100% statement, branch, function, and line coverage for both production modules; client build passes. No canvas test-source diagnostics; unrelated existing test errors remain.
- Visible DPR 3 gives 780 x 1071 backing pixels and changing clock pixels. A subsequent live DPR 5 transition, with unchanged 260 x 357 CSS content size and no synthetic resize or reload, automatically gives 1300 x 1785. This verifies the actual density-change listener, not merely initialization.
- Type review: observation of size and density is one consumer sizing boundary; retain IBrowser and plain component MockBrowser. Resolution APIs are patched only in adapter tests. No new Type/name or broader timer change. Refactor review found no necessary cleanup. No new meta-level insight identified.
- Responsive-sizing evaluation is now complete. Foundation slice 1 accepted; no slice 2 production model adopted. TDD phase file cleared on completion. Changes remain uncommitted.

### Viewport stretch checkpoint (2026-10-09 22:03:56 CEST)

- User approved the narrow shared-shell layout change. The shell is now a viewport-minimum-height flex column with the existing bottom-toolbar reservation; long pages can still grow and scroll. The canvas fills the remaining route space after navigation, heading, padding, and optional meta framing, without a 640px cap or fixed aspect ratio.
- TDD browser Red at 1200 x 900 measured 642px canvas width against 1152px available width, and bottom 471.781px against expected 832px. A narrow-screen intrinsic-sizing feedback failure was also observed and corrected with a zero-pixel canvas flex basis. No bitmap attributes determine its CSS height.
- Visible-browser Green at DPR 1: 1200 x 900 gives 1150 x 720 content/backing pixels and bottom 832px; 380 x 800 gives 330 x 544 and bottom 688px. Both fill available width with no page overflow. Narrow meta mode gives 320 x 401 content/backing pixels, ending at 683px above the toolbar at 707.844px. The clock image changes after 1.1 seconds.
- Existing Diagram workspace still renders; Workflow TODO remains vertically scrollable with bottom padding retained. Focused canvas suites pass all 12 tests at 100% statement, branch, function, and line coverage; client build passes. Browser geometry is the layout acceptance evidence, not a jsdom/source-string proxy.
- Type review: CSS layout constraints do not justify a new domain Type or browser operation. Existing IBrowser sizing/observation continues to resize the backing bitmap. Real high-density rendering remains outstanding. No new meta-level insight identified.
- The browser became hidden during verification; those bitmap checks were not accepted as runtime evidence. After the user restored visibility, automatic resize and paint delivery were reverified. Elapsed time includes permission and visibility waits; active effort and follow-up outcome remain unknown. Changes remain uncommitted.

### Visible-browser verification (2026-10-09 21:57:38 CEST)

- After the user made the page visible, document visibility reported visible at DPR 1.
- Without synthetic resize events, viewport widths of 900 and 380 produced matching backing/display dimensions of 640 x 360 and 332 x 187. The canvas image changed over a 1.1-second wait, confirming real animation-frame delivery for clock updates.
- A real mouse move 101px right and 51px down from the canvas border emitted approximately (100, 50.068) content coordinates, within 0.1 CSS pixel of the intended (100, 50); fractional layout versus integer DOM dimensions accounts for rounding. The diagnostic subscription and attribute were removed afterward.
- Frame scheduling and pointer-coordinate evaluations now record verified completion and elapsed times. Real high-density rendering is still unverified; sizing evaluation and broader milestone remain incomplete. Tests cover DPR 2 and a subsequent DPR 1 change.

### Pointer conversion checkpoint (2026-10-09 21:56:12 CEST)

- IBrowser.canvasPoint converts viewport coordinates to content-relative logical CSS pixels, subtracting borders and accounting for axis-aligned display scaling. Device pixel ratio does not multiply pointer coordinates. Zero rendered area throws explicitly. Rotated/skewed transforms and padded canvas layouts are not supported by this slice; the current canvas has no padding or transform.
- The component exposes pointerMoved through a native pointermove template binding. Plain MockBrowser provides the coordinates in component tests; adapter tests cover position, border, scale, DPR independence, outside/border positions, and zero width/height.
- TDD Red confirmed missing conversion and output. Green: 12 tests, 100% four-metric coverage for both production modules, and passing client build. Test-source type-check has no canvas errors but retains existing errors in untouched test files.
- Type review: content-relative coordinates can be negative (for example at the border), unlike validated non-negative DiagramPoint. Keep the anonymous coordinate shape and reuse its return type in the output; a separately named coordinate-space Type remains a possible refinement if multiple spaces later interact. No new Type name or Glossary entry adopted.
- Reconciled scheduling elapsed time to its recorded green-checkpoint timestamp, not completion. Pointer conversion has 1 minute 39 seconds elapsed to this checkpoint; no active-effort estimate is inferred. Visible runtime acceptance remains outstanding. No new meta-level insight identified.

### Animation-frame checkpoint (2026-10-09)

- Initial rendering, resize notifications, and one-second clock ticks now request drawing through IBrowser.requestAnimationFrame. Multiple notifications share one pending frame; a completed frame returns the component to idle without scheduling another frame.
- Destruction cancels pending work, including a frame with ID zero, and retains timer/resize cleanup. The clock interval remains an invalidation source, not a rendering loop.
- TDD Red observed three immediate drawings instead of one deferred drawing. Green passes 8 component/adapter tests with 100% statement/branch/function/line coverage for both production modules; client build and editor diagnostics pass.
- Refactor/Type review: a browser frame handle plus undefined expresses the scheduled/idle lifecycle adequately. Plain MockBrowser controls paint delivery and records pending callbacks. Browser API spies remain confined to adapter tests. No new Type or Glossary entry is justified.
- Runtime frame delivery is not verified in the shared hidden tab. Do not equate automated scheduling acceptance with verified user responsiveness. No additional meta-level insight identified.

### Responsive sizing checkpoint (2026-10-09)

- Boundary refinement: component tests now inject a plain `MockBrowser` implementing the approved `IBrowser` interface via the `BROWSER` token. The drawing contract uses a narrow Pick of browser context operations/properties. Removed component-test prototype spies, global ResizeObserver replacement, property patches, jest.fn call recording, and unsafe double casts; Jest fake time remains for the actual clock/timer boundary.
- The real adapter owns browser context acquisition, displayed dimensions, pixel ratio, and resize subscription/cleanup. Adapter tests alone patch browser APIs; a typed observer fake models notifications and disconnect. Both suites pass (6 tests), both changed production modules have 100% four-metric coverage, the client build passes, and editor diagnostics show no errors. The separate test-source check caught a fake setTransform overload mismatch; corrected without casts, with no remaining canvas errors. Existing unrelated test errors remain. The browser shows non-empty drawn pixels and matching backing/display dimensions after explicit resize; visible automatic resizing remains outstanding.
- The completed `interactive-canvas-typed-boundary` evaluation preserves all five metrics and records 4 minutes 43 seconds elapsed including user waits, not active effort. The sizing and broader editor evaluations remain incomplete.
- Type review: the narrow consumer-derived interface is justified by the real canvas versus plain fake contrast and removes assertions claiming an incomplete object implements the entire rendering context. Resize subscription returns its cleanup action; naming alone does not guarantee lifecycle correctness, which remains tested. No further Type or Glossary addition is warranted.
- Added a Canvas link beside Diagram in the secondary navigation at the user's request, making the isolated prototype discoverable through the existing menu.
- Added CSS aspect ratio, bitmap dimensions derived from displayed dimensions and device pixel ratio, scaled drawing in CSS pixels, ResizeObserver and window-resize handling, and destruction cleanup.
- TDD Red confirmed missing scaling and observer cleanup; Green passes all 5 component tests with 100% statement/branch/function/line coverage. Refactor review found no necessary extraction or new domain Type.
- Client production build passes. The separate Jest-source TypeScript check reports existing errors in untouched Glossary and Workflow TODO tests, but none in the canvas test.
- In the shared hidden browser tab, explicit resize events produced matching bitmap/display sizes at 900px and 380px viewport widths (640 x 360 and 332 x 187 at DPR 1). Automatic resize/paint callbacks were not observed while the tab was hidden; do not treat this as visible-browser acceptance. DPR 2 and resize to DPR 1 are covered by boundary-mocked tests.
- Timer and observer lifecycle use existing browser Types; no new Glossary entry or Type is justified. No additional reusable meta-level insight identified.
- The new sizing WorkEvaluation retains unknown completion and user outcome until visible-browser acceptance. The broader milestone remains incomplete.

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

- **Agreed for the initial picture (2026-10-09):** In-memory free-form sketch first. Labels/layout are sketch data, not edits to architectural facts; no architecture linkage or persistence is introduced in slice 2. Persistence remains a later slice unless scope is revised.
- Are parts added with a palette, an Add button, or a canvas gesture?
- Does grouping represent actual containment or only visual organization? Resolve before slice 6.
- Candidate Type names and refinements require review and explicit adoption before becoming established.

### Measurement and verification

The completed clock evaluation is preserved. The `interactive-canvas-editor-milestone` record in [devenv-value-evaluation.json](./devenv-value-evaluation.json) tracks the new first milestone with all five existing metrics. Its ID is a bookkeeping identifier, not an adopted domain Term. Keep unknown measures unknown and do not record completion until acceptance is verified. Track subsequent eligible slices separately as they begin, retaining their links in the workflow registry.

For each production slice: Red-Green-Refactor, public-interface tests, 100% statement/branch/function/line coverage for changed modules, Type review, an appropriate client build, and real browser/pointer checks. Tests mock external boundaries and do not mutate the real filesystem. Record acceptance evidence, elapsed time, observed decision points, and unresolved user outcomes without inferring active effort or AI credits.

The detailed plan remains in this existing Markdown checkpoint under the maintained workflow convention. Workflow selection/status and evaluation measures remain authoritative in their existing Typed JSON sources. No source migration or universal plan schema is introduced by saving this plan.
