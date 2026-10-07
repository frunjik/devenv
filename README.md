# DevEnv

DevEnv exists to help make intended outcomes explicit and support the work of achieving them. It is a workspace for connecting Goals to the work, project artifacts, tests, and changes that contribute to those outcomes. Its central concern is what the System is meant to achieve; the software and tools are means to that end.

In this README, **Glossary**, **Term**, **Type**, and **Contract** are defined terms; see the [project glossary](./.glossary) for their meanings.

DevEnv is currently implemented as an Angular client and Express API.

See the [Project Knowledge Index](./design/knowledge-index.md) for the locations and roles of our decisions, learning, principles, vocabulary, design explorations, and reviews.

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
npm run dev:client
```

The client is served by Angular CLI; `npm start` remains an alias for the client command. The API process uses `tsx watch` and restarts when server source files change.
Client development resolves `@shared` directly from source, so shared edits are watched by Angular without a separate library watcher or an initial shared build. Production client builds still consume the packaged shared library and require the build order below. Restart an already-running client dev server after changing its configuration.

The client opens Problem Inquiry by default: `/` redirects to `/problem-inquiry`. The System Plan remains available at `/system-plan`, and the file browser at `/browse`.

Problem Inquiry opens on the **Notes** tab (input conversion and accepted notes). The **Tickets** tab contains ticket framing and the ticket list. Switching tabs preserves unsaved form content, ticket filters, and open editors; accepting notes or saving tickets does not switch tabs automatically. The sample-data toggle and storage errors remain visible above both panels. Each panel uses paired columns at widths of at least 70rem and stacks on narrower screens. Use Left/Right arrow keys to switch tabs, Home/End to select the first/last tab, and Tab to enter the active panel's controls.
The System Plan link is in the meta toolbar and is hidden when the meta layer is disabled; this does not change the default route.
The System Plan supports case-insensitive search by concern ID, title, or displayed description. Search filters the list only; progress totals still describe the full register.

Client and server release versions are maintained in `projects/client/package.json` and `projects/server/package.json`.
The status toolbar displays both versions, and the API exposes the server version at `GET /version`.


## Server API

See [projects/server/README.md](projects/server/README.md) for the server layout and the ticket API.

## Build

Build the shared library before the client that consumes its API contracts:

```bash
npm run build -- --project shared
npm run build -- --project client
```

Pass an explicit Angular project to `npm run build`; the root script does not select a default project.

The Angular `server` library target has known TypeScript errors and is not part of the supported build sequence.

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
