# Server

The Express API behind DevEnv. `createApp(root, options)` builds the app; `startServer` listens on it.

## Layout

- `src/lib/handlers/`: one file per route group (files, git, tests, glossary, tickets).
- `src/lib/domain/`: pure domain rules with no I/O. `ticket-lifecycle.ts` holds `applyTicketCommand`, the ticket state machine (open, assigned, resolved, closed, duplicate).
- `src/lib/storage/`: the `TicketStore` port and `InMemoryTicketStore`. Tickets are lost on restart until a database store exists.
- `test/`: Jest specs. `ticket-store.contract.ts` is a reusable contract that every `TicketStore` implementation must pass.

Server code imports only types from `@shared`; the shared package re-exports Angular services, so runtime logic belongs here.

## Ticket API

Tickets are stored on the server behind the `TicketStore` port (SC-028 in `design/problem-inquiry-system/concerns.md`). Responses wrap results as `{ data }` or `{ error: { message } }`.

| Route | Purpose |
|-------|---------|
| `GET /tickets` | List stored tickets. |
| `POST /tickets` | Body `{ ticket, dataKind? }` (`sample` by default, or `real`). Creates an open, version 1 ticket. Returns 201. |
| `POST /tickets/:id/changes` | Body `{ command, expectedVersion }`. 200 with `{ ticket, event }`; 404 unknown ticket; 409 stale version (the current ticket is in `error.current`); 422 refused by the lifecycle; 400 malformed. |
| `GET /tickets/:id/history` | Change events for a ticket. |

The actor of a change is the authenticated principal, or `anonymous` when no authentication is configured.

## Tests

```bash
npm run test:server
npm run test:server:coverage
```

Coverage is held at 100% (principle P-004).
## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the library, run:

```bash
ng build server
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory:
   ```bash
   cd dist/server
   ```

2. Run the `npm publish` command to publish your library to the npm registry:
   ```bash
   npm publish
   ```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
