# DevEnv Export (sibling or hosting system)

**Registered:** 2026-10-07. Clone/export implementation is in progress; broader integration architecture remains undecided.

## Scope

Explore making DevEnv available alongside another system or as its hosting environment. This concerns the DevEnv system, not merely the [MetaExport knowledge example](./meta-export.md). What "export" includes remains to be agreed.

### Agreed clone trial (2026-10-07)

- Provide a DevEnv UI action that asks the local server to copy a curated DevEnv package into a destination folder.
- Include the client/server/shared source, reusable scripts and configuration, root/project documentation, `.agents`, `.glossary.json` and generated `.glossary`.
- Exclude the root `knowledge` (formerly `design`) and `reviews` folders, Git history, dependencies, build/test caches, local runtime data, credentials, and unrelated WMS application-specific projects.
- **Scope override (user, 2026-10-07):** Do not export `design` or `reviews`. This supersedes their earlier inclusion. Design-backed features such as System Plan and Workflow TODO require recipient-provided documents; existing links and scripts referencing excluded documents are not rewritten by the clone.
- Replace the contents of an existing destination folder when the user explicitly selects it.
- This trial packages resources for folder-based export only; it does not choose sibling/hosting integration, recipient adoption, deployment, or external transmission.
- Success means the UI can request the export, the local server copies the agreed package to the selected destination, replacement behavior is explicit and safe, and the resulting folder contains no excluded local/runtime resources.

## Steps

1. Clarify the receiving-system example, intended use, and exported scope: application, reusable capabilities, configuration, knowledge, or a combination. **Complete for the clone trial above; broader receiving-system integration remains undecided.**
2. Compare sibling and hosting arrangements. Define boundaries, navigation, integration contracts, ownership, deployment, and data isolation; do not assume either arrangement is preferred.
3. Inspect current architecture and dependencies. Identify reusable versus project-specific parts, necessary Types, and the related SystemConcern.
4. Agree a bounded trial and measurable success criteria before implementation.
5. If authorized, implement and validate the trial using repository principles, then document limitations and recipient setup.
6. Review the outcome and remaining steps. External transmission and commits require separate permission.

## Checkpoint

**Status:** Paused after restoring full test coverage. Implementation is wired through the UI; the export trial's remaining safety and running-UI verification is not complete.

**Verification scope override (user, 2026-10-07):** Continue until all tests are green; 100% coverage is not required at this checkpoint. This does not complete the later full-coverage checkpoint.

**Agent discovery/export follow-up (2026-10-08):** Agents now reside in `.github/agents`, and skills in `.agents/skills`. The curated export includes `.github/agents` and `.agents`, and no longer attempts to copy the obsolete root `skills` directory. The package regression failed before the allowlist fix; all 8 focused clone tests and the server test TypeScript check then passed. Focused clone-handler coverage is 78.04% statements/lines, 82% branches, and 87.5% functions. The user explicitly approved committing this migration/export fix with that coverage exception; the deferred full-coverage work remains required and the export trial is not complete. No real export was performed.

**Decisions:** The user selected a curated package, UI-to-local-server invocation, and replacing existing destination contents. The package boundary and exclusions are recorded above. Destination is a server-local folder, entered through the UI; the implementation must reject unsafe paths, including the source tree, before any replacement. Require a clear in-UI confirmation before replacing existing contents.

**Progress:** Added `DevEnvCloneRequest` and `DevEnvCloneResult` shared contracts, a staged server-side copier with a curated allowlist and path-overlap checks, and `POST /devenv/clone`. The copier stages before swapping an existing destination and attempts to restore it if installation fails. The toolbar action, application dialog wiring and `BackendService` method are implemented. The dialog requires replacement acknowledgement and displays success, API errors and cleanup warnings. Corrected the test collection types and nullable DOM access reported by the client test type-check.

**Verification (2026-10-07):**

- `npm run test:all`: all 36 client suites / 345 tests and all 23 server suites / 229 tests pass.
- `tsc --noEmit --project projects/client/tsconfig.spec.json`: passes.
- `tsc --noEmit --project projects/server/tsconfig.spec.json`: passes.
- Client production build passes; the shared contracts were rebuilt before verification.
- No 100% coverage claim is made at this milestone, per the user's explicit scope.
- No real export destination was written during this milestone; new clone tests use boundary mocks.
- Type review: the agreed request/result contracts remain appropriate; no new domain Type is proposed at this checkpoint.

**Next:** Before treating the export trial as complete, review protected destinations beyond source overlap (such as the user's home), source symlinks, concurrent exports, and the curated package's runnable configuration/dependency completeness, and validate the UI/export outcome. Copier rollback, cleanup outcomes, API error responses, and full-coverage verification are now tested as recorded below. Broader sibling/hosting architecture remains undecided.

### Overall coverage restoration checkpoint (2026-10-09)

- The user requested restoring overall test coverage to 100%; coverage thresholds and collection scope remain unchanged.
- Added public-interface clone tests for invalid requests, destination resolution failures, package exclusions, installation/rollback failures, cleanup failures and warnings, API refusal/error responses, and default filesystem wiring. Filesystem writes use the existing boundary mock; default filesystem tests only read and reject the source as a destination.
- Full server coverage now passes: 23 suites, 264 tests, and 100% statements, branches, functions, and lines. Server test TypeScript checking and `git diff --check` pass.
- Client baseline: 37 suites and 351 tests passed, with 99.81% statements, 98.85% branches, 99.66% functions, and 99.8% lines. Added public-interface tests for duplicate submission/closing during export, malformed HTTP error responses, response-processing and transport failures, and shared service construction through Angular injection. HTTP failures use boundary mocks.
- Final `npm run test:all:coverage` passes: client 38 suites / 362 tests and server 23 suites / 264 tests, each with 100% statements, branches, functions, and lines. The script persisted the successful result in `test-run-cache/last-test-run.json`.
- Client and server test TypeScript checks and `git diff --check` pass.
- No production code or coverage configuration changed. No new domain Type is needed for these existing failure scenarios. Changes remain uncommitted.
- **Resume next:** Coverage restoration is complete. Remaining export work is the separate safety and UI review above, not further coverage changes.
- These coverage results do not complete the export trial's separate safety and running-UI review above.

### Test duplication review (2026-10-09)

- Removed repeated package-exclusion assertions already protected by the focused exclusion cases. Consolidated the three source-overlap cases into a parameterized test, preserving equal, descendant, and ancestor destinations with no copying allowed.
- Merged duplicate-submission and pending-close checks into the existing successful replacement test with two additional calls, retaining the single-request and no-close assertions.
- Removed two API cases rejected by Express's strict JSON parser before reaching the clone handler. Missing-body and permissively parsed scalar-body tests still exercise the handler's input guards.
- Repeated test titles in other suites cover distinct services or assignment/edit workflows, not interchangeable behavior; those tests remain. This was a targeted review, not proof that every suite is duplication-free.
- Final combined coverage passes unchanged at 100% on all four metrics: client 38 suites / 361 tests, server 23 suites / 263 tests. Both test TypeScript checks pass. No production code, coverage scope, or thresholds changed; the successful combined result is cached.

### Client HTTP boundary migration (2026-10-09)

- Investigated the router Promise-like deprecation: Angular's Zone.js replaces the global Promise constructor, while native async Express handlers return native promises. The router's constructor check warns in Angular-hosted Express tests; the Node clone API suite does not reproduce it.
- With user approval, migrated the backend service, file browser, and file editor client suites to `HttpTestingController`. These tests no longer start Express, create temporary files, or mock internal backend methods. Existing server suites retain API integration coverage.
- Client assertions now verify HTTP methods, request bodies, response unwrapping, encoded ticket IDs, logged/preserved errors, navigation, editor shortcuts, and user feedback. The unrelated-shortcut test no longer depends on a file written by a preceding test.
- Full combined coverage passes at 100% statements, branches, functions, and lines: client 38 suites / 363 tests, server 23 suites / 263 tests. Client test type-check and diff formatting pass; the successful combined result is cached.
- All 37 tests in the three migrated suites also pass with `--silent=false`, with zero router Promise-like deprecation warnings. No client spec imports the server public API or Node filesystem/HTTP modules.
- No production code, Promise implementation, warning suppression, coverage scope, or thresholds changed. No new domain Type was needed. Changes remain uncommitted, alongside the preceding test-duplication cleanup.

### Clone dialog feedback follow-up (2026-10-07)

- Added an indeterminate Material progress bar while the export request is pending; the API does not report a measurable completion percentage.
- Successful exports close the dialog automatically and show a snackbar using the existing success styling. Cleanup warnings remain explicit in a persistent warning snackbar, rather than disappearing with the dialog.
- Export failures leave the dialog open for retry. No new Type was needed; this is presentation behavior using the existing request/result contracts.
- Validation: 42 focused dialog/application tests pass, client test type-check passes, and the client production build passes. Full-coverage verification remains deferred at the previously agreed checkpoint.
