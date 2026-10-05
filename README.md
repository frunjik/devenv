# DevEnv

An experimental Angular client and Express API workspace.

## Requirements

- Node.js and npm

Install the project dependencies from the repository root:

```bash
npm install
```

## Run locally

Start the API and client in separate terminals:

```bash
npm run dev:server
```

```bash
npm start
```

The client is served by Angular CLI. The API process uses `tsx watch` and restarts when server source files change.

## Build

Build the Angular libraries before the client that consumes them:

```bash
npm run build -- --project shared
npm run build -- --project ppt
npm run build -- --project client
```

Pass an explicit Angular project to `npm run build`; the root script does not select a default project.

The Angular `server` library target currently has known TypeScript errors, including unresolved PPT `./core` imports. It is not part of the passing build sequence.

## Test

The repository uses Jest for client and server tests:

```bash
npm run test:client
npm run test:server
npm run test:all
```

Coverage commands:

```bash
npm run test:client:coverage
npm run test:server:coverage
npm run test:all:coverage
```

See [WORKSPACE.md](./WORKSPACE.md) for project structure and workflow details.
