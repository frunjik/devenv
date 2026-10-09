# Workflow TODO List

Generated from [workflow-todo-list.json](./workflow-todo-list.json). Edit the JSON source, not this view.

Repository-wide navigation for resumable work. This list does not replace SystemConcerns, application tickets, or the detailed workflow documents.

**Active workflow:** None.

## Workflows

| Workflow | Primary work purpose | Status | Resume reference | Related concern |
| --- | --- | --- | --- | --- |
| MetaExport | Meta work | Paused | [Current checkpoint and remaining steps](./meta-export.md#resumable-workflow) | SC-049 |
| Glossary Refinement (KnowledgeArea, MetaLayer, SubjectDomain) | Meta work | Completed | [Implementation and review checkpoint](./glossary-refinement.md#checkpoint) | SC-027; SC-049 for the subsequent export example |
| Full Glossary Export | Product work | Completed | [Implementation and verification checkpoint](./full-glossary-export-workflow.md#checkpoint) | Not assigned |
| TODO View (DevEnv system layer) | Meta work | Completed | [Implementation and review checkpoint](./todo-view-workflow.md#checkpoint) | Not assigned |
| Show active workflow on TODO view | Meta work | Completed | [Implementation and verification checkpoint](./active-workflow-view-workflow.md#checkpoint) | Not assigned |
| UI Design Review Fixes | Product work | Completed | [Implementation and verification checkpoint](./ui-design-review-workflow.md#checkpoint) | Not assigned |
| Term Editing (DevEnv glossary UI) | Product work | Pending | [Starting checkpoint](./term-editing-workflow.md#checkpoint) | Not assigned |
| DevEnv Export (sibling or hosting system) | Product work | Paused | [Full-coverage checkpoint and remaining verification](./devenv-export-workflow.md#checkpoint) | Not assigned |
| Portable Practices and Glossary | Meta work | Pending | [Preparation checklist and checkpoint](../practices/portable-practices-checklist.generated.md#checkpoint) | Not assigned |
| Knowledge Organization Migration | Meta work | Completed | [Migration checkpoint](./knowledge-migration.md#checkpoint) | Not assigned |
| Principle Register Organization and Priority Review | Meta work | Completed | [Approved cross-reference update and verification](./principle-register-review.md#checkpoint) | Not assigned |
| Minimal Typed Diagram Editor | Product work | Paused | [Connection workflow checkpoint](./diagram-editor-workflow.md#checkpoint) | Not assigned |
| DevEnv Value Evaluation | Meta work | Paused | [Measurement-feasibility pilot](./devenv-value-evaluation-workflow.md#checkpoint) | Not assigned |
| Workflow Evaluation Associations | Meta work | Completed | [Association model and verification checkpoint](./workflow-evaluation-associations.md#checkpoint) | Not assigned |
| Test Boundary Mocks | Meta work | Pending | [Starting checkpoint](./test-boundary-mocks.md#checkpoint) | Not assigned |
| Copilot AI Credit Estimator | Meta work | Completed | [Implementation and verification complete](./ai-credit-estimator-workflow.md#checkpoint) | Not assigned |

**Registration:** Only workflows explicitly registered here are tracked. Open concerns and historical explorations are not automatically active workflows.

## Classifying Work Purpose

Classify each workflow by its primary intended outcome, not by the files changed, implementation method, or whether the work is measured:

- **Product work** primarily adds or changes a capability intended for DevEnv users. Example: the Diagram Editor lets users create and manipulate diagrams.
- **Meta work** primarily develops, describes, governs, operates, or evaluates DevEnv itself or its development practices. Example: DevEnv Value Evaluation measures the development process and DevEnv's own upkeep.

For work with both effects, record the dominant agreed outcome. Being measured does not turn product work into meta work: diagram selection and movement is product work even though it is part of the evaluation pilot. Conversely, a user-visible tool may be meta work when its primary purpose is to inspect or govern DevEnv's own process, as with the TODO View. Revisit the classification if the intended outcome changes; do not imply that either class is more valuable.

These work-purpose labels are not workflow lifecycle statuses and are not the Glossary Term `MetaLayer`: they classify the intended outcome of a work item, while `MetaLayer` describes a perspective on a system or activity.

## Maintaining and Switching

1. Before switching, save the current workflow's decisions, open questions, and exact next step in its detailed document.
2. Mark it paused here, unless completed or blocked. For a blocker, record the reason in its detailed document.
3. Select the requested workflow, mark it active, and update the active-workflow line. Keep at most one active workflow; none is allowed.
4. Read its linked checkpoint and current source rules before resuming. Selection does not authorize unresolved decisions, expanded scope, or commits.
5. At a pause or completion, update its detailed checkpoint and this list. Retain completed entries for reference.
6. The detailed document owns steps and progress; this list owns selection and status. Resume references link to the current checkpoint rather than duplicating step numbers that can drift.

Use `Pending` for registered work not yet started, and `Active`, `Paused`, `Blocked`, or `Completed` as document labels, not new domain Types. Add workflows when requested or when resumable work is explicitly established. Ask for clarification if a resume request has multiple possible targets and none is selected.
