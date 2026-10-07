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

**Status:** Paused at the requested green-tests milestone; implementation is wired through the UI, but the export trial's remaining safety and full-coverage verification is not complete.

**Verification scope override (user, 2026-10-07):** Continue until all tests are green; 100% coverage is not required at this checkpoint. This does not complete the later full-coverage checkpoint.

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

**Next:** Before treating the export trial as complete, review protected destinations beyond source overlap (such as the user's home), source symlinks, concurrent exports, and the curated package's runnable configuration/dependency completeness. Cover copier rollback and cleanup outcomes and API error responses, perform the deferred full-coverage verification, and validate the UI/export outcome. Broader sibling/hosting architecture remains undecided.

### Clone dialog feedback follow-up (2026-10-07)

- Added an indeterminate Material progress bar while the export request is pending; the API does not report a measurable completion percentage.
- Successful exports close the dialog automatically and show a snackbar using the existing success styling. Cleanup warnings remain explicit in a persistent warning snackbar, rather than disappearing with the dialog.
- Export failures leave the dialog open for retry. No new Type was needed; this is presentation behavior using the existing request/result contracts.
- Validation: 42 focused dialog/application tests pass, client test type-check passes, and the client production build passes. Full-coverage verification remains deferred at the previously agreed checkpoint.
