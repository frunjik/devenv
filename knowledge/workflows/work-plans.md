# Work Plans

Generated from [work-plans.json](./work-plans.json). Edit the JSON source, not this view.

Hierarchy: WorkPlan > WorkTopic > WorkTask. IDs are unique across the registry.
WorkTask statuses: Pending, Active, Paused, Blocked, Completed.
WorkTask measurement: Undecided, Measured, NotMeasured. Decide before a task leaves Pending; Measured tasks link evaluation ledger IDs.

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

server-startup.spec.ts still calls startServer(root, 0) and startServer(root, -1), which bind or attempt to bind a real port. Cover the default HTTP listener through an injected or faked listener boundary instead, keeping startup error propagation covered.

#### WorkTask: Remove real temp-directory writes from server specs

**Status:** Pending

**Measurement:** Undecided

Some server specs (for example test-runner.spec.ts) create, write and remove real directories with mkdtemp/writeFile/rm. Replace them with injected filesystem boundaries or in-memory fakes so tests do not mutate real files.

#### WorkTask: Replace ad hoc jest.mock(fs) setups with a shared fake

**Status:** Pending

**Measurement:** Undecided

13 server specs define their own jest.mock('fs') or jest.mock('node:fs/promises') doubles. Inventory the operations they need and replace the duplicates with a reusable fake behind an injected boundary where handlers allow it.

#### WorkTask: Provide a reusable double for DevEnvCloneFileSystem

**Status:** Pending

**Measurement:** Undecided

The async DevEnvCloneFileSystem boundary in projects/server/src/lib/handlers/devenv-clone.ts (realpath, lstat, mkdtemp, cp, ...) has no shared fake. Decide whether to align it with TextFileSystem or add a dedicated in-memory fake, and adopt it in devenv-clone.spec.ts.

#### WorkTask: Remove the unused supertest devDependency

**Status:** Pending

**Measurement:** Undecided

No spec imports supertest after the requestApp migration. Uninstall supertest and @types/supertest and update package-lock.json once removal is approved.

#### WorkTask: Replace real filesystem reads in tests with mocks

**Status:** Pending

**Measurement:** Undecided

Some specs still read real repository files (for example agent-essentials-markdown.spec.ts reading knowledge/practices JSON) or real temp files. Inventory these reads and replace them with concise fixtures served through injected boundaries or in-memory fakes such as createMemoryTextFileSystem. This goes beyond the current test-isolation rule, which permits read-only filesystem access; decide whether that rule should change and keep any intentional source-consistency checks explicit.

## WorkPlan: WorkPlan Tooling

Make the repository-backed WorkPlan registry easier to inspect and use.

### WorkTopic: WorkPlan visibility

Show WorkPlans, WorkTopics and WorkTasks in the client once the generated Markdown view is no longer sufficient.

#### WorkTask: Add a read-only WorkPlans page

**Status:** Completed

**Measurement:** NotMeasured

Add a read-only client route beside workflow-todo and workflow-evaluations that shows the WorkPlan hierarchy, task status and measurement decision, validated with validateWorkPlanRegistry and validateWorkPlanEvaluationLinks from @shared, linking Measured tasks to their evaluations. Start when several plans or active tasks make the Markdown view insufficient; editing is out of scope.
