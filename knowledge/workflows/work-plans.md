# Work Plans

Generated from [work-plans.json](./work-plans.json). Edit the JSON source, not this view.

Hierarchy: WorkPlan > WorkTopic > WorkTask. IDs are unique across the registry.
WorkTask statuses: Pending, Active, Paused, Blocked, Completed.
WorkTask measurement: Undecided, Measured, NotMeasured. Decide before a task leaves Pending; Measured tasks link evaluation ledger IDs.

## WorkPlan: Canvas symbol rendering

Reusable vector symbols and an isolated preview inspired by the supplied architecture sketch.

### WorkTopic: Reusable symbol renderers

Artifact, system software, business role, product and actor symbols with hatching and labels.

#### WorkTask: Anchor right-side actions above canvas

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-editor-bottom-actions`

Completed bottom-anchored right-side removal and connection buttons with top-aligned list. Verified empty/populated lists at 320, 360, 768 and 1280px; desktop buttons align with toolbar bottom, mobile panel flow preserved, no overflow. Client build passes. Tracking and measurement retained. Next step: user review and optional commit approval.

#### WorkTask: Align half-width connections list with left fields

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-editor-top-list`, `canvas-editor-half-list`

Completed right-side Connections panel starting at Label/Type height above mobile. User corrected width to half the page: list spans six global columns, with removal and connection actions below; left fields/Add and stacked picture loading remain on the left. Mobile list spans both control columns. Verified exact width/top alignment at 768/1280px, mobile at 320/360px, 12rem cap, no overflow and client build. Tracking and measurement retained. Next step: user review and optional commit approval.

#### WorkTask: Align label and type in the left half

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-editor-left-fields`, `canvas-editor-picture-order`

Completed side-by-side Label/Type within the left half above mobile, matching Load overview width, with Add beneath. Follow-up stacks Technical picture above Load overview in the same left-side grid space. Mobile two-column controls preserved. Runtime edge/stacking assertions pass at 320, 360, 768 and 1280px without overflow; 123 editor tests and client build pass. Tracking and measurement retained. Next step: user review and optional commit approval.

#### WorkTask: Show a scrollable connection selection list

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-editor-connection-list`

Completed always-visible checkbox list above Remove selected, capped at 12rem with vertical scrolling. Multiple selection and removal preserved. Verified list dimensions and scrolling at 320, 360, 768 and 1280px, checked last-row removal, 123 editor tests, client build without style-budget warning and clear diagnostics. Tracking and measurement retained. Next step: user review and optional commit approval.

#### WorkTask: Place connections beside removal

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-editor-removal-placement`, `canvas-editor-removal-alignment`

Completed Connections picker beside Remove selected and right-aligned toward that action, with Connect/Cancel beneath toward the same right edge. Verified actual row/edge alignment at 320, 360, 768 and 1280px without overflow; 123 editor tests passed before CSS-only follow-up and final client build passes without style-budget warning. Existing actions, responsive sizing and canvas preserved. Next step: user review and optional commit approval.

#### WorkTask: Tighten Actor interaction bounds

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-editor-actor-bounds`, `canvas-editor-actor-top-margin`

Completed tight Actor bounds, including follow-up top clearance: 60x100 interaction box with 10px extra room above and below the unchanged 60x80 drawing area. Shared geometry drives hit-testing, selection outlines, connections and picture boundaries; other shapes remain 180x80. Follow-up Red/Green verified 123 editor tests, 100% coverage, TypeScript check, client build and live screenshot with top/label clearance. Initial and follow-up evidence retained in linked evaluations. Next step: user review and optional commit approval.

#### WorkTask: Use small and grid-filling wide editor buttons

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-editor-button-variants`, `canvas-editor-button-growth`

Completed wide Add/Remove/picture actions and responsive small Connect/Cancel: fill grid cells above 42rem, content-sized on mobile. Replacement controls, 36px minimum height and canvas unchanged. Initial variants passed 122 editor tests. Follow-up runtime assertions pass at 320, 360, 672, 673, 768 and 1280px; client build passes and no overflow. Next step: user review and optional commit approval.

#### WorkTask: Unify selected part and connection removal

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-editor-unified-removal`

Completed one Remove selected action for the selected part, its incident connections, directly selected canvas connection and checked connections. Reuses existing cleanup and preserves unrelated items. Verified 122 editor tests, 100% changed-module coverage, TypeScript check, client build and live combined/direct connection removal with one button and no mobile overflow. Next step: user review and optional commit approval.

#### WorkTask: Arrange canvas editor controls on the global grid

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-editor-controls-grid`, `canvas-editor-controls-compact`

Completed name/type-before-Add global-grid ordering and compact-controls follow-up. Mobile controls use two equal columns, scoped only to the toolbar; canvas layout and global page grid remain unchanged. Editor buttons are content-sized and 36px high across tested viewports. Verified 120 editor tests, client production build, live dimensions at desktop/tablet/360/320px, no document overflow and mobile creation/selection/connect/cancel/removal. At 360px toolbar height reduced from 600.375px to 288.375px. Initial and follow-up evidence retained in linked evaluations. Next step: user review and optional commit approval.

#### WorkTask: Use generic architecture symbols in the canvas editor

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-symbol-editor`

Completed artifact, system software, business role, product and actor choices in the canvas editor. Existing label input edits the name; box symbols keep their fixed heading and show the name inside angle brackets, while actor names appear below a centered figure. Rectangle default, loaded pictures, selection bounds, dragging, connections and deletion preserved. Verified 143 focused tests, 100% coverage of both changed production modules, TypeScript check, shared/client builds and live creation, movement, relabeling, connection and removal. Narrow controls have no document overflow. Baseline and completion evidence are in the linked evaluation. Next step: user review and optional commit approval.

#### WorkTask: Render architecture symbols with a sample canvas preview

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `canvas-symbol-preview`

Completed reusable deterministic Canvas 2D renderers and the isolated /canvas-symbol-preview route. Verified all five symbol types, green/orange styling, clipped hatch fills, corner icons, labels, connections, narrow/wide layout, cleanup and visible errors. Existing editor and stored formats preserved. Tracking and measurement approved; baseline and completion evidence are in the linked evaluation. Next step: user review and optional commit approval; editable symbol integration and pixel-identical handwriting remain out of scope.

## WorkPlan: Work effort reporting

Assess how observed work time is distributed between Problem/Domain delivery and Meta/DevEnv work, retaining source evidence and uncertainty.

### WorkTopic: Problem/Domain versus Meta/DevEnv effort

Build an evidence-backed comparison without equating elapsed sessions, commit gaps or agent execution time with human active effort.

#### WorkTask: Create an evidence-backed Problem/Domain versus Meta/DevEnv time report

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `report-domain-versus-meta-time`

Agree the reporting period and classification criteria before implementation. Proposed categories: Problem/Domain for work delivering or investigating the supported problem/domain; Meta/DevEnv for tooling, agent rules, workflows, test infrastructure, measurement and environment upkeep. Classify by intended outcome, not merely file path, and retain mixed/unclassified work rather than forcing a binary allocation. Gather as much available evidence as possible from WorkPlans and linked evaluations, knowledge/workflows/devenv-value-evaluation.json, workflow checkpoints and reports, timestamped user/assistant turns, session metadata and tool-execution records where accessible, Git commits/diffs and explicit user time records. Link every classification and time interval to its source and distinguish direct observations, estimates and unknowns. Report human active effort separately from elapsed delivery windows, waiting and agent/tool execution; never infer active effort from commit gaps, message gaps or whole-session duration. Avoid double counting overlapping tasks/sessions and parallel tool or agent activity; document allocation assumptions and missing evidence. Produce a report with category totals and proportions only where supported by comparable evidence, per-task breakdown, evidence coverage, mixed/unclassified time, limitations and reproducible derivation. Use authoritative typed JSON with generated Markdown for structured report data; agree any UI separately. Initial evidence inventory on 2026-10-10: the evaluation ledger has 46 evaluations, 38 with both startedAt/completedAt and 34 with a non-null delivery-flow-and-effort value; values may describe wall-clock time with active effort unknown, so inspect each rather than summing them blindly. Recent commits c7fcf3a, 57ce107 and 74d351d cover AgentPhaseGuide rules/glossary/export; e748394, b074703, ad87c42, d07e878 and e5f827f cover test infrastructure and planning, providing classification leads and commit timestamps but not durations. Cloud and local session-store queries over the last seven days returned no rows in this session; treat history availability as unresolved, not proof that no work occurred. This conversation also provides timestamped evidence of generic-core refinement, tracking-rule decisions and an in-memory export dry run; preserve accessible turns/checkpoints when the task starts. Success: a source-traceable comparison that explicitly reports unknown active effort and demonstrates no overlap double counting; do not present unsupported totals as measured time.

## WorkPlan: Test Boundary Mocks

Provide reusable test doubles for external boundaries shared by client and server tests.

### WorkTopic: Cross-runtime test boundaries

Inventory existing test doubles and reuse or add suitable fakes/mocks for filesystem and HTTP boundaries that work in both client and server test suites.

#### WorkTask: Create or reuse filesystem and HTTP test doubles

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `reusable-filesystem-http-test-doubles`

Inspect existing filesystem and HTTP test mocks/fakes. Reuse or create reusable test doubles that can be used in both client and server tests, without introducing real filesystem writes or network I/O in tests.

### WorkTopic: Remaining test isolation

Follow-ups from reusable-filesystem-http-test-doubles: remove the remaining real filesystem writes, port binding and ad hoc boundary mocks from server tests.

#### WorkTask: Test server startup without binding a real port

**Status:** Pending

**Measurement:** Undecided

server-startup.spec.ts still calls startServer(root, 0) and startServer(root, -1), which bind or attempt to bind a real port. Cover the default HTTP listener through an injected or faked listener boundary instead, keeping startup error propagation covered. Note: server-startup.spec.ts and file-ticket-store.spec.ts share an identical ~20-line in-memory node:fs/promises mock (mkdir/readFile/rename/writeFile); extract it to test/support only when a third spec needs it.

#### WorkTask: Remove real temp-directory writes from server specs

**Status:** Pending

**Measurement:** Undecided

Some server specs (for example test-runner.spec.ts) create, write and remove real directories with mkdtemp/writeFile/rm. Replace them with injected filesystem boundaries or in-memory fakes so tests do not mutate real files.

#### WorkTask: Provide a reusable double for DevEnvCloneFileSystem

**Status:** Pending

**Measurement:** Undecided

The async DevEnvCloneFileSystem boundary in projects/server/src/lib/handlers/devenv-clone.ts (realpath, lstat, mkdtemp, cp, ...) has no shared fake. Decide whether to align it with TextFileSystem or add a dedicated in-memory fake, and adopt it in devenv-clone.spec.ts.

#### WorkTask: Remove the unused supertest devDependency

**Status:** Pending

**Measurement:** Undecided

No spec imports supertest after the requestApp migration. Uninstall supertest and @types/supertest and update package-lock.json once removal is approved.

#### WorkTask: Replace real filesystem reads in tests with mocks

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `replace-real-fs-reads-in-tests`

Some specs still read real repository files (for example agent-essentials-markdown.spec.ts reading knowledge/practices JSON) or real temp files. Inventory these reads and replace them with concise fixtures served through injected boundaries or in-memory fakes such as createMemoryTextFileSystem. This goes beyond the current test-isolation rule, which permits read-only filesystem access; decide whether that rule should change and keep any intentional source-consistency checks explicit.

## WorkPlan: WorkPlan Tooling

Make the repository-backed WorkPlan registry easier to inspect and use.

### WorkTopic: WorkPlan visibility

Show WorkPlans, WorkTopics and WorkTasks in the client once the generated Markdown view is no longer sufficient.

#### WorkTask: Add a read-only WorkPlans page

**Status:** Completed

**Measurement:** NotMeasured

Add a read-only client route beside workflow-todo and workflow-evaluations that shows the WorkPlan hierarchy, task status and measurement decision, validated with validateWorkPlanRegistry and validateWorkPlanEvaluationLinks from @shared, linking Measured tasks to their evaluations. Start when several plans or active tasks make the Markdown view insufficient; editing is out of scope.

## WorkPlan: AgentPhaseGuide export

Make the AgentPhaseGuide setup importable into another system without DevEnv-specific rules.

### WorkTopic: Generic core and project profile

Separate the generic AgentPhaseGuide rules from DevEnv-specific paths, commands and stack rules.

#### WorkTask: Separate the generic core from the DevEnv project profile

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `separate-generic-core-from-devenv-profile`

Move DevEnv-specific rules (@shared runtime, TypeScript style, UI grid layout, Jest import, repository quick reference, WorkTask registry paths, SystemConcern commit subjects) from AGENTS.md, the agent and the tdd skill into .github/instructions/project-profile.instructions.md, keep the JSON mirrors in sync, and add a tested export script that copies the generic core plus a profile template with a commit-pinned manifest.

#### WorkTask: Package the exported Guide so it can clone itself

**Status:** Completed

**Measurement:** Measured

**Evaluations:** `self-cloning-agent-guide-package`

Include a minimal package.json with tsx and self-contained TypeScript clone scripts. Preserve the current profile and glossary, copy only Guide files, work without DevEnv or Git, reject existing/overlapping destinations and explain inherited provenance. Verify isolated clone and subsequent clone using public behavior.
