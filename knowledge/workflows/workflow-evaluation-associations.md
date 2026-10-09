# Workflow Evaluation Associations

## Checkpoint

**Status:** Completed.

**Goal:** Move the evaluation association out of the Workflow TODO component's display-name mapping into authoritative workflow data, and allow multiple evaluations to be shown for one workflow.

**Baseline:** `workflow-todo.component.ts` maps three display names to evaluation IDs. The map can become stale when a display name changes and can associate only one evaluation with a workflow. Workflow records in `workflow-todo-list.json` do not declare links.

**Model decision:** Add required `evaluationIds: string[]` to each workflow record. This reuses the existing stable evaluation `id` values, gives a workflow zero or more evaluations, and avoids creating a new Type solely for a list of references. `evaluationIds` is a clearer fit than a new `WorkflowId`: the association is stored on its workflow record, while no other consumer needs workflow identity. `Principle Register Organization and Priority Review` is a concrete association; an evaluation such as Glossary client search that has no corresponding registered workflow is the contrasting unassociated case.

**Progress:** The earlier duration-view fix was isolated and committed as `12c212e`. The multiple-evaluation public-interface test first failed against the name mapping and now passes. The shared workflow contract/runtime validator and authoritative JSON use schema version 2 with explicit `evaluationIds`. The client renders all completed linked evaluations and reports unknown referenced IDs. Workflow Markdown has been regenerated. Focused client (64 tests) and server (33 tests) suites pass. Shared and client builds pass. The changed workflow component, template, and shared workflow validator each meet 100% statement, branch, function, and line coverage.

**Next step:** No further work planned. Reopen this workflow if the association model or presentation requirements change.

**Open question:** None. The selected relationship allows multiple evaluation IDs per workflow; each association uses the existing evaluation ID.
