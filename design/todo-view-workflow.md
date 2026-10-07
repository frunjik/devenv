# TODO View (DevEnv system layer)

**Registered:** 2026-10-07. Read-only UI implemented and validated; user acceptance remains separate.

## Scope

Create a view of the repository's [Workflow TODO List](./workflow-todo-list.md) in DevEnv's system layer. Displaying workflows is requested; editing, switching workflows through the UI, and persistence changes remain undecided.

## Steps

1. Inspect existing system-layer navigation and document-loading patterns. Agree placement, displayed information, and read-only versus interactive scope.
2. Agree the source of truth and loading contract. Avoid a second hand-maintained workflow list; determine how checkpoint links can be opened from the application.
3. Review necessary Types and names with concrete examples. Identify any related SystemConcern before implementation; none is assigned by this registration.
4. Implement the agreed scope using Red-Green-Refactor and existing client/server patterns. Surface loading failures explicitly.
5. Validate with relevant tests, 100% coverage on all four metrics for in-scope production code, appropriate TypeScript checks/builds, and browser checks for navigation, accessibility, and responsive layout.
6. Update related documentation and save the result and remaining questions. User acceptance and commits remain separate decisions.

## Checkpoint

**Next:** User review of the implemented read-only slice. API and UI were implemented through Red-Green-Refactor: 12 API tests and 12 client/navigation tests pass; the new handler and component each have 100% coverage on all four metrics. Shared/client builds, the scoped server TypeScript check and editor diagnostics pass. No Type cleanup remains.

Browser verification: the existing client server still served old routes, so the production build was checked on an isolated local server. The hidden browser tab initially blocked normal clicks and visible event updates; making the test tab visible resolved this without application changes. Verified toolbar navigation from Problem Inquiry to the five-row TODO list, unchanged legacy TODO link, active status, and opening the DevEnv Export document with its checkpoint reference. At 320, 768 and 1440px, the table stays within its scroll container and document text wraps without document overflow. These checks are not screen-reader certification.

### Agreed representation

- Keep the Workflow TODO List Markdown authoritative; derive JSON rather than maintaining a duplicate list.
- The UI consumes that JSON. Do not display the unrelated commit-process KnowledgeStatements example as workflows.
- Approved shared Type name: `WorkflowTodoList`, containing `workflows`.
- Each workflow has `name`, `status`, `resumeLabel`, `resumePath`, and `relatedConcern`. Status remains descriptive text, not a newly agreed lifecycle Type.
- Concrete example: `TODO View (DevEnv system layer)`, `Pending`, `Starting checkpoint`, `./todo-view-workflow.md#checkpoint`, `Not assigned`.
- The user approved a separate `Workflow TODO` toolbar link and a read-only table/document view, retaining the existing `TODO.md` link.
- Resume buttons load the complete workflow Markdown document and display the checkpoint reference. They do not jump to a heading, edit, or switch workflows.
- JSON is derived live by `GET /workflow-todo`; no generated JSON snapshot is maintained.

### Remaining decisions

- No existing concern was identified as directly covering this workflow view; it remains unassigned rather than attributing it to glossary scope SC-027. A new register entry remains a separate decision.

Type review: `WorkflowTodoList` is justified as the shared API representation of the existing list. No additional status or lifecycle Type is adopted. The row Type name remains to be agreed if a separately named Type is needed.

The row structure is inline in `WorkflowTodoList`; no additional name was needed for this slice. Glossary Refinement is paused with its existing checkpoint preserved.
