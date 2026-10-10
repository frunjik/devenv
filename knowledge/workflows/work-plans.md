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

**Status:** Pending

**Measurement:** Undecided

Inspect existing filesystem and HTTP test mocks/fakes. Reuse or create reusable test doubles that can be used in both client and server tests, without introducing real filesystem writes or network I/O in tests.

## WorkPlan: WorkPlan Tooling

Make the repository-backed WorkPlan registry easier to inspect and use.

### WorkTopic: WorkPlan visibility

Show WorkPlans, WorkTopics and WorkTasks in the client once the generated Markdown view is no longer sufficient.

#### WorkTask: Add a read-only WorkPlans page

**Status:** Pending

**Measurement:** Undecided

Add a read-only client route beside workflow-todo and workflow-evaluations that shows the WorkPlan hierarchy, task status and measurement decision, validated with validateWorkPlanRegistry and validateWorkPlanEvaluationLinks from @shared, linking Measured tasks to their evaluations. Start when several plans or active tasks make the Markdown view insufficient; editing is out of scope.
