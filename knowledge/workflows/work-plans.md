# Work Plans

Generated from [work-plans.json](./work-plans.json). Edit the JSON source, not this view.

Hierarchy: WorkPlan > WorkTopic > WorkTask. IDs are unique across the registry.
WorkTask statuses: Pending, Active, Paused, Blocked, Completed.
WorkTask measurement: Undecided, Measured, NotMeasured. Decide before a task leaves Pending; Measured tasks link evaluation ledger IDs.

## WorkPlan: Canvas symbol rendering

Reusable vector symbols and an isolated preview inspired by the supplied architecture sketch.

### WorkTopic: Reusable symbol renderers

Artifact, system software, business role, product and actor symbols with hatching and labels.

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
