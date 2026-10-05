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
