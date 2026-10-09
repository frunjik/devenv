# Show Active Workflow on TODO View

## Checkpoint

**Status:** Completed.

**Purpose and success condition:** Make the currently selected active workflow immediately visible on the Workflow TODO page. The page must identify the active workflow from the authoritative `WorkflowTodoList.activeWorkflow` value and clearly show when no workflow is active, without changing workflow selection or status.

**Baseline:** The page renders the workflow table and highlights an Active row, but does not render the authoritative top-level active-workflow selection. The selection is currently null. The shared validator already checks that a non-null selection matches exactly one workflow whose status is Active.

**Evaluation:** See the `active-workflow-on-todo-view` record in [the authoritative value-evaluation JSON](./devenv-value-evaluation.json).

**Implementation:** The view renders a dedicated Active workflow callout sourced from the validated `activeWorkflow` value after the list loads successfully and displays "No active workflow" when it is null. It hides the callout during loading and load errors. This is presentation-only; it does not alter workflow selection or status.

**Verification:** All 14 focused Workflow TODO component tests pass. The changed component has 100% statement, branch, function, and line coverage. Shared and client builds pass. A browser check of `/workflow-todo` displayed the selected active workflow by name.

**Limitations:** Follow-up usability and rework are unknown; active human effort was not measured.
