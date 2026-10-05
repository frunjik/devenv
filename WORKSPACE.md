# Workspace guide

This repository contains an Angular 20 client, shared Angular libraries, and an Express API implemented in TypeScript. Install dependencies from the repository root with `npm install`.

## Projects

- `projects/client`: Angular application. It consumes the shared and PPT libraries.
- `projects/ppt`: all shared types (`PPTFeature`, `PPTFeatureStatus`, `FeaturePriority`, file-system, git, test-run and response types). Import them from `@ppt`.
- `projects/shared`: shared services; it imports its types from `@ppt`.
- `projects/server`: Express API handlers, server startup, and server tests.

## Development

Run the API and client in separate terminals:

```bash
npm run dev:server
npm start
```

`npm run dev:server` executes `tsx watch projects/server/dev.ts`. `npm start` runs the local Angular CLI development server.

## Build

Build dependencies in order (`ppt` first, since `shared` depends on it), then build the client:

```bash
npm run build -- --project ppt
npm run build -- --project shared
npm run build -- --project client
```

The root `build` script forwards arguments to `ng build`; specify the project explicitly instead of running bare `npm run build`.

The workspace defines an Angular build target for `server`, but it currently fails on existing TypeScript issues, including unresolved `./core` imports under the server PPT sources. The shared, PPT, and client builds are the supported passing sequence.

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
