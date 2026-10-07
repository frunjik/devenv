# TODO View (DevEnv system layer)

**Registered:** 2026-10-07. Pending; implementation not started.

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

**Next:** Step 1 when selected. The title and pending status are user-approved. Glossary Refinement remains active.

No UI, API, Type, storage format, or source-file change is authorized beyond the requested workflow registration yet. Resolve implementation choices before coding.
