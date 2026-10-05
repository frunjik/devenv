# Agent guidance

## Repository overview

This workspace contains an Angular client and libraries, plus an Express API:

- `projects/client`: Angular application.
- `projects/shared`: shared API contracts and Angular services, imported as `@shared`.
- `projects/server`: Express API and server tests.

Keep changes scoped to the relevant project and follow the existing patterns in nearby files.

## Development

Install dependencies from the repository root with `npm install`. Run the client and API in separate terminals:

```bash
npm start
npm run dev:server
```

## Build and test

Build shared contracts before the client that consumes them:

```bash
npm run build -- --project shared
npm run build -- --project client
```

The root build script requires an explicit Angular project. The `server` Angular build target has known TypeScript errors and is not part of the supported passing build sequence.

Run the relevant Jest suite after changing code:

```bash
npm run test:client
npm run test:server
```

Use `npm run test:all` when changes affect both client and server. The maintained test suites use Jest; prefer these package scripts over `ng test`.

## Change guidelines

- Prefer shared API contracts in `projects/shared` and import them from `@shared`.
- When changing API behavior, check both its server implementation and related client/shared callers and tests.
- Preserve existing feature-store formats and workflows documented in `README.md`.
- Avoid unrelated edits; run the smallest relevant tests and builds, and report any known or newly encountered failures.

## System task principles

Follow the maintained [system task principles](.agents/system-task-principles.md) for work that designs or implements this system. The register is additive: preserve existing principles when adding new ones, and surface conflicts for resolution rather than silently overriding them.

- For production code, use Red-Green-Refactor as defined in `.agents/test-driven-developer.agent.md`.
- At the defined checkpoints, review the domain and implementation for missing or refinable Types using `.agents/type-reviewer.agent.md`; report justified Type convictions and unresolved candidates to the user.
- Before completing a TypeScript coding task, run an appropriate TypeScript-aware type-check or build for the changed code and resolve type errors; report any check that could not run.
- For in-scope production code, require 100% line, statement, branch, and function coverage using domain-derived tests through public interfaces; allow simple mocks only at boundaries. Do not change production code for testability except after proving code is unreachable and cannot otherwise be covered, as detailed in the principle register.
- When tests are green, in-scope production code has 100% coverage on all four metrics, and no Type cleanup or refactoring remains, commit the completed scope before continuing. Pause instead if an explicit user review is requested; see P-005 in the principle register.
- Do not change or remove surrounding code without user permission. If a specific, non-generic surrounding-code constraint blocks a sound solution, explain why a narrow change is needed and its likely impact, then ask first; see P-006 in the principle register.
