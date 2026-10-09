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
- Each workflow has `name`, `primaryWorkPurpose`, `status`, `resumeLabel`, `resumePath`, and `relatedConcern`. The view displays the name, purpose, status, and related concern; resume references remain in the source/API but are not shown in the view. Status remains descriptive text, not a newly agreed lifecycle Type.
- Concrete example: `TODO View (DevEnv system layer)`, `Pending`, `Starting checkpoint`, `./todo-view-workflow.md#checkpoint`, `Not assigned`.
- The user approved a separate `Workflow TODO` toolbar link and a read-only table/document view, retaining the existing `TODO.md` link.
- Resume buttons load the complete workflow Markdown document and display the checkpoint reference. They do not jump to a heading, edit, or switch workflows.
- JSON is derived live by `GET /workflow-todo`; no generated JSON snapshot is maintained.

### Remaining decisions

- No existing concern was identified as directly covering this workflow view; it remains unassigned rather than attributing it to glossary scope SC-027. A new register entry remains a separate decision.

Type review: `WorkflowTodoList` is justified as the shared API representation of the existing list. No additional status or lifecycle Type is adopted. The row Type name remains to be agreed if a separately named Type is needed.

The row structure is inline in `WorkflowTodoList`; no additional name was needed for this slice. Glossary Refinement is paused with its existing checkpoint preserved.

## Follow-up checkpoint: work-purpose API and view compatibility

**Status:** Implementation and verification complete; user review remains separate.

The workflow register gained a `Primary work purpose` column, while the `/workflow-todo` parser still required the previous four-column table. This caused the reported missing-header error. The Markdown register remains authoritative; the endpoint derives its response from it, and no global TODO JSON source was added.

The parser and shared API contract now accept and validate the five-column schema, and the API response carries `primaryWorkPurpose`. The workflow view displays that field in a labelled table column. Red was observed against focused direct-handler and client tests before their respective changes. The direct-handler suite passes all seven tests and the client component suite all twelve; each changed production module has 100% statement, branch, function, and line coverage. The server scoped TypeScript check and shared and client builds pass. `git diff --check` passes.

The existing API Supertest suite was not run because it uses localhost/socket activity that is outside the current test boundary policy. Its fixture was updated to the five-column format; direct handler tests exercise the parser and current Markdown without network activity.

`WorkflowWorkPurpose` is a supporting API Type for the two existing labels (`Product work` and `Meta work`). No conflicting existing Type was found; the name accurately distinguishes the value from workflow status and describes its purpose in the API contract. This does not establish a new Glossary Term or a broader domain Type beyond the two registered labels. No global list authority change is proposed.

**Next:** User review of the updated read-only view and its purpose column.

## Follow-up checkpoint: JSON authority migration

**Status:** Implementation and verification complete; user review and commit approval remain separate.

The user approved making Typed JSON authoritative for the global Workflow TODO list. The [workflow-todo-list.json](./workflow-todo-list.json) now contains the 12 workflow records and the prior register's introductory, classification, maintenance, switching, and status guidance. [workflow-todo-list.md](./workflow-todo-list.md) is regenerated as the human-readable view. The `/workflow-todo` handler now reads and runtime-validates the JSON rather than parsing Markdown. The active selection is this workflow; DevEnv Value Evaluation is paused with its next diagram-editor slice preserved in its detailed checkpoint.

Added an explicit `WorkflowTodoList` interface/runtime validator, a deterministic renderer and generator command (`npm run generate:workflow-todo:markdown`), and focused direct-handler/renderer tests. All 30 focused server tests pass; the handler, validator, and exporter each have 100% statement, branch, function, and line coverage. The server TypeScript check and shared/client builds pass; 12 client tests pass. Regenerating twice produced byte-identical Markdown (SHA-256 `FE548BFE247EE56431B883B542DBAD056E1D2F7B3A0A65C39745410F70ADFC74`), 13 local links resolve, and `git diff --check` passes. The prior API Supertest tests were replaced with direct handler tests that do not start a network listener; the repository-backed test reads the JSON source (read-only).

Runtime follow-up: `tsx watch` could not resolve the handler's runtime `@shared` import because the repository alias points to `dist/shared` and is not available to this Node runtime. The handler now imports the validator from the shared source by a relative path. The dev server started successfully and `GET /workflow-todo` returned the validated JSON list.

**Architecture follow-up:** The server currently imports the shared validator directly from the shared source file. This is a compatibility workaround, not the desired package boundary. Improve server runtime module resolution so it can consume the supported `@shared` package entry point consistently in development and production, then remove the direct source-file import. Keep this separate from the JSON-authority migration.

**Follow-up:** The user requested removing `Resume reference` from the workflow view. The UI table now contains workflow, purpose, status, and related concern only; document-opening UI and its loading state were removed. Resume paths remain in the authoritative JSON and API for checkpoint navigation data, but are not presented by this view.

**Next:** User review of the reduced workflow view.

No global list authority remains in Markdown or API parsing. `WorkflowTodoList` is the already-approved shared Type name. `WorkflowWorkPurpose` has two constrained values; the record shapes remain inline rather than adding a separate row Type.

## Follow-up checkpoint: separate end-user and meta work

**Status:** Implementation and verification complete; user review remains separate.

The user requested visually separating DevEnv meta workflows from end-user tools/capabilities, with meta work last. The view now renders two labelled sections in that order. It filters the existing workflow array only for presentation; source order, JSON records, and shared/API Types are unchanged. Sections are both visible rather than using tabs so users can compare the groups at once.

The focused client suite passes (9 tests), and the component has 100% statement, branch, function, and line coverage. The client build and `git diff --check` pass. Browser visual verification was not performed.

**Next:** User review of the grouped presentation.

## Follow-up checkpoint: separate evaluation details

**Status:** Implementation and verification complete; user review remains separate.

The user requested moving full evaluation details into a separate page/view and showing a metrics summary on the workflow page. The summary now presents each metric's count of recorded versus unknown evaluations and links to `/workflow-evaluations`. That route displays metric definitions and complete per-evaluation context and measures from the existing authoritative JSON. The source data and shared/API Types are unchanged.

Focused workflow/evaluation/route tests pass (20 total), with 100% statement, branch, function, and line coverage for both changed production components. The client source type-check and client build pass. Browser visual verification was not performed.

**Next:** User review of the split presentation.

### Follow-up: direct evaluation navigation

The user asked whether the evaluation route was available in the menu and approved adding it. The toolbar now links directly to `/workflow-evaluations` beside Workflow TODO; the existing in-page link remains. The toolbar and route suites pass (12 tests), toolbar component coverage is 100% for statements, branches, functions, and lines, and the client build passes.

### Follow-up: completed evaluation duration

The evaluations view derives elapsed wall-clock duration for completed records from their existing `startedAt` and `completedAt` values. Incomplete records omit the duration; completed records with missing or invalid timestamps show an explicit unavailable/unknown value. This does not alter the JSON schema or imply active human effort. The display and error cases are covered through the component's public view.

The combined focused suites pass (25 tests); route, toolbar, workflow, and evaluations components each have 100% statement, branch, function, and line coverage. The client development TypeScript check and client build pass. Browser visual verification was not performed.

**Next:** User review of the combined workflow/evaluation presentation. Changes remain uncommitted.

### Follow-up: completed durations on workflow view

The user clarified that completed-item durations should appear on the workflow items themselves, not in a separate list beneath the metric summary. The view now displays each associated completed evaluation title and derived elapsed wall-clock duration in a new column on the corresponding workflow row, using the same formatter as the evaluation detail page. The two current presentation mappings associate Diagram selection and movement with Minimal Typed Diagram Editor and Show current evaluation metrics on the Workflow TODO view with TODO View (DevEnv system layer). Unmatched workflows show no associated evaluated item; incomplete evaluations are not associated. The source data and Types are unchanged.

The focused workflow/evaluation suites pass (14 tests); the workflow component, evaluation component, and shared duration formatter have 100% statement, branch, function, and line coverage. The client development TypeScript check, client build, and `git diff --check` pass. No browser visual verification was performed.

**Next:** User review of the inline workflow-row presentation. Changes remain uncommitted, separate from commit `7bc3cc2`.

### Follow-up: align grouped workflow columns

The user requested aligning the Product and Meta table columns. The two separate tables were replaced with one semantic table containing separate Product and Meta row groups. This makes both groups share exactly one set of columns rather than depending on independently sized tables. The group order, labels, row content, and narrow-screen horizontal scrolling are preserved.

The focused workflow component suite passes (10 tests) with 100% statement, branch, function, and line coverage. The client development TypeScript check and client build pass.

**Next:** User review of the shared-table presentation. This presentation-only follow-up remains uncommitted.

### Follow-up: use full page width

The user requested that the workflow table stretch across the page. Removed the Workflow TODO content area's 76rem maximum width, set it to the available width with box-sizing applied, and retained responsive side padding. The table remains 100% width of this expanded content area; narrow screens keep the existing horizontal scroll behavior.

The focused workflow component suite passes (10 tests), the component has 100% statement, branch, function, and line coverage, and the client development TypeScript check and build pass. Browser visual verification was not performed.

**Next:** User review of the full-width workflow table. Changes remain uncommitted.
