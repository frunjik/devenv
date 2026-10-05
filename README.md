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

Client and server release versions are maintained in `projects/client/package.json` and `projects/server/package.json`.
The status toolbar displays both versions, and the API exposes the server version at `GET /version`.

## Build

Build the Angular libraries before the client that consumes them. `ppt` comes first because `shared` and the client import its types:

```bash
npm run build -- --project ppt
npm run build -- --project shared
npm run build -- --project client
```

Pass an explicit Angular project to `npm run build`; the root script does not select a default project.

The Angular `server` library target currently has known TypeScript errors, including unresolved PPT `./core` imports. It is not part of the passing build sequence.

## Features workflow

Features are tracked as one JSON object per line (the PPTFeature type from @ppt) in three stores at the repository root:

- .features: all features that are not being worked on or archived (Questions, Wished, Backlog, Queued, Committed, Done). Features added from the client default to Wished. Legacy .wishlist, .backlog and .delivered files are merged into .features on first read and removed. Denied records are moved to .archived on feature-list refresh.
- .current: the features being worked on; set to Done when delivered. Done records move from .current into .features on feature-list refresh and before commit, preserving their IDs and replacing any existing copy.
- .archived: archived features, with status Archived, plus denied features whose status remains Denied. Legacy text lines are converted to JSON on first read.
- DEVENVOPDEV.md: the task list of features actively being worked on (written when a feature is started from the client).
- .history: a one-line entry per delivered feature.

The client Features page lists them in four tabs, filtered by status: Open, Queued (Queued and Committed), Done and Archived. Denying a feature moves it to .archived and removes its copies from .features, .current and the active task list. The selected tab is kept in the URL (?tab=). The Done tab can archive a feature or all Done features at once (POST /features/:id/archive, POST /features/archive-done). Legacy comment-style lines are converted to JSON when read.
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
