# Shared

Runtime-neutral API contracts and reusable validation for the browser client and
Node.js server, imported through `@shared`. Keep Angular integrations, browser-only
APIs, and Node-only modules in their respective projects.

The public API is exported through `src/public-api.ts` and `src/lib/index.ts`.
No Angular runtime peer dependencies are required. The existing Angular CLI and
ng-packagr tooling remains the package build mechanism; it does not make exported
code Angular-specific.

## Build

From the repository root:

```bash
npm run build -- --project shared
npm run build -- --project client
```

The shared package is generated in `dist/shared`. Client development resolves
`@shared` from source; production builds consume the built package.

## Tests

Use the maintained client and server Jest suites from the repository root:

```bash
npm run test:all:coverage
```

Client tests cover shared validation through the public API. The server shared
runtime suite verifies Node execution and the absence of the removed Angular
scaffold exports and runtime peers. Tests use boundary mocks for external I/O.
