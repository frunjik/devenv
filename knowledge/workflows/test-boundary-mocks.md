# Test Boundary Mocks

**Registered:** 2026-10-09. Pending; design and implementation not started.

## Goal

Design and introduce small, reusable test doubles and consumer-derived interfaces that keep tests from accessing real external systems while preserving meaningful application behavior under test.

## Scope

- Prioritize filesystem and network boundaries, where the current test suites have concrete external-side-effect risks.
- Review command execution, time/ID/environment access, and logging as narrower follow-on candidates.
- Reuse existing test tools and injected boundaries where they already meet the need.
- Keep test doubles limited to the behavior exercised by tests. Do not reproduce the full API of Node.js, Angular, or another external system.
- Do not introduce a universal `TestMocks` interface or change production behavior solely to make a mock convenient.

## Initial boundary inventory

These are candidates to review, not adopted Type names or approved production refactors.

| Boundary | Existing evidence | Candidate direction |
| --- | --- | --- |
| Filesystem | `FileTicketStore` and the test-run cache call `node:fs/promises` directly. Ticket-store and server-startup tests repeat map-backed `mkdir`/`readFile`/`writeFile`/`rename` mocks. `DevEnvCloneFileSystem` already expresses a consumer-specific role. | Define only the filesystem operations needed by each consumer and reuse a focused map-backed fake. Preserve observable missing-file, write-failure, and rename/atomic-replacement behavior. Do not force clone, ticket persistence, and folder listing into one broad interface if their needs differ. |
| Client network | `BackendService` uses Angular `HttpClient`; its tests already use `HttpTestingController`. | Continue using Angular's testing boundary. No parallel client HTTP abstraction is currently justified. |
| Server HTTP | Many server suites use Supertest; `server-startup.spec.ts` creates HTTP servers. Project principle P-014 prohibits real listeners and network requests in tests. | Prefer handler-level request/response fakes for handler behavior. If route composition needs coverage, find an in-memory seam that does not open a listener. |
| Command execution | Git handlers inject executor functions; the test runner has a streaming `TestCommandExecutor`. | Reuse the existing injection seams. Keep command results and streaming events distinct unless a real consumer proves a shared contract useful. Tests must never invoke real Git, npm, or other subprocesses. |
| Time, IDs, and process environment | `FileTicketStoreOptions` already accepts `now` and `newId`; the test runner reads `process.env`, process paths, and the current time. | Add narrow injection only where deterministic tests need it. Avoid a general runtime/context object. |
| Logging | Client `LoggerService` wraps console errors; console logging is allowed by P-014. | Capture or stub logging only where assertions need it; lower priority than filesystem and network isolation. |

## Constraints and decisions to preserve

- P-014 requires tests to avoid real filesystem mutation and all real network activity, including loopback listeners and requests. Coverage reports and the existing test-runner cache exception remain narrowly allowed by that principle.
- Keep actual domain and application logic under test; replace only external I/O at its boundary.
- Preserve error paths and behavior such as atomic save/rollback, missing files, subprocess failures, and HTTP failure responses. A fake must not make a failed operation look successful.
- Keep client-only and server-only test support in their respective projects; do not place runtime-specific APIs in `@shared`.
- Derive each role interface from the operations its consumer actually needs. Existing `DevEnvCloneFileSystem` and `TicketStore` are useful precedents, not instructions to consolidate unrelated roles.
- Agree candidate names before adopting new Types, following P-012 and P-022.

## Steps

1. Recheck the server and client test suites for real filesystem mutations, listeners, loopback requests, and real subprocess execution; distinguish intentional reads from side effects.
2. Map each affected production consumer to the smallest required external operations and existing injection seams.
3. Propose the reusable test-support location and the first bounded migration slice. Prefer the server filesystem fake and migrate a focused consumer/test group before broad reuse.
4. Obtain agreement on any new interface or helper names and on the first implementation scope.
5. Implement in bounded Red-Green-Refactor slices. Add a public-behavior test first, keep the mock at the boundary, and preserve domain behavior and explicit failures.
6. Migrate the relevant suites so their test scenarios no longer mutate the real filesystem, open listeners, make network requests, or start real subprocesses.
7. Verify the affected suites, TypeScript-aware checks, and 100% four-metric coverage for changed production modules. Confirm any allowed infrastructure writes are limited to P-014's explicit exceptions.
8. Report remaining noncompliant suites, unknown behavior, and the next scoped migration step; update this checkpoint and the Workflow TODO List when pausing or completing.

## Acceptance conditions

- The selected tests use small fakes or established testing tools at external boundaries and do not exercise real filesystem mutations, network activity, or subprocesses.
- The fake models only required behavior but covers meaningful success and failure outcomes.
- The real application/domain behavior under test remains exercised through its public interfaces.
- Each completed implementation slice passes its relevant tests, type check/build, and required production coverage.
- Unmigrated suites and explicit infrastructure exceptions are identified rather than reported as compliant.

## Checkpoint

**Status:** Pending. The initial inventory and migration direction are recorded; no interfaces, helpers, or production seams have been adopted or changed.

**Type review:** `DevEnvCloneFileSystem` and `TicketStore` demonstrate consumer-derived role interfaces. Candidate filesystem roles should remain separate where their operations and invariants differ; a universal filesystem mock is not justified by structural overlap. The client network tests already have `HttpTestingController`, a concrete contrasting case where a new abstraction would duplicate an existing boundary. Candidate names for future interfaces and test helpers remain unresolved until a concrete migration slice is selected.

**Next:** Step 1, starting with the suites already observed to create temporary directories or start listeners, then confirm the broader server-suite inventory before selecting the first slice.

**Commit note:** Workflow registration only; no implementation or commit is authorized until the user requests it. Leaving the active Diagram Editor workflow unchanged.
