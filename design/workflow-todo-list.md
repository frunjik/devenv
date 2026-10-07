# Workflow TODO List

Repository-wide navigation for resumable work. This list does not replace SystemConcerns, application tickets, or the detailed workflow documents.

**Active workflow:** None selected. MetaExport is saved for resumption.

## Workflows

| Workflow | Status | Resume reference | Related concern |
| --- | --- | --- | --- |
| MetaExport | Paused | [Current checkpoint and remaining steps](./meta-export.md#resumable-workflow) | SC-049 |

Only workflows explicitly registered here are tracked. Open concerns and historical explorations are not automatically active workflows.

## Maintaining and Switching

1. Before switching, save the current workflow's decisions, open questions, and exact next step in its detailed document.
2. Mark it paused here, unless completed or blocked. For a blocker, record the reason in its detailed document.
3. Select the requested workflow, mark it active, and update the active-workflow line. Keep at most one active workflow; none is allowed.
4. Read its linked checkpoint and current source rules before resuming. Selection does not authorize unresolved decisions, expanded scope, or commits.
5. At a pause or completion, update its detailed checkpoint and this list. Retain completed entries for reference.

The detailed document owns steps and progress; this list owns selection and status. Resume references link to the current checkpoint rather than duplicating step numbers that can drift.

Use `Active`, `Paused`, `Blocked`, or `Completed` as document labels, not new domain Types. Add workflows when requested or when resumable work is explicitly established. Ask for clarification if a resume request has multiple possible targets and none is selected.
