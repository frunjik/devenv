# Workspace guide

This repository contains an Angular 20 client, shared Angular libraries, and an Express API implemented in TypeScript. Install dependencies from the repository root with `npm install`.

## Projects

- `projects/client`: Angular application. It consumes shared API contracts from `projects/shared`.
- `projects/shared`: shared API contracts and Angular services, imported from `@shared`.
- `projects/server`: Express API handlers, server startup, and server tests.

## Development

Run the API and client in separate terminals:

```bash
npm run dev:server
npm start
```

`npm run dev:server` executes `tsx watch projects/server/dev.ts`. `npm start` runs the local Angular CLI development server.
The client development configuration uses `projects/client/tsconfig.app.dev.json` to resolve `@shared` from its source public API. Angular watches shared source in the same build graph as the client; a separate shared watcher or initial shared build is unnecessary. Production builds retain the packaged-library mapping and build order below.

## Build

Build the shared library before the client:

```bash
npm run build -- --project shared
npm run build -- --project client
```

The root `build` script forwards arguments to `ng build`; specify the project explicitly instead of running bare `npm run build`.

The workspace defines an Angular build target for `server`, but it is not part of the supported build sequence due to existing TypeScript issues.

## Tests

Jest is the test runner used by the repository's package scripts:

```bash
npm run test:client
npm run test:server
npm run test:all
```

Run coverage with:

```bash
npm run test:client:coverage
npm run test:server:coverage
npm run test:all:coverage
```

Use the package scripts rather than `ng test`: the Angular CLI test targets are configured for Karma, while the maintained client and server suites run with Jest.
