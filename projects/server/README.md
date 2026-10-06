# Server

The Express API behind DevEnv. `createApp(root, options)` builds the app; `startServer` listens on it.

## Layout

- `src/lib/handlers/`: one file per route group (files, git, tests, glossary, system plan, tickets).
- `src/lib/domain/`: pure domain rules with no I/O. `ticket-lifecycle.ts` holds `applyTicketCommand`, the ticket state machine (open, assigned, resolved, closed, duplicate).
- `src/lib/storage/`: the `TicketStore` port with `InMemoryTicketStore` (tests, and `createApp` by default) and `FileTicketStore` (one JSON file; `startServer` uses it at `<root>/.tickets.json`, or the path in `TICKETS_FILE`). The file store suits one server process only.
- `test/`: Jest specs. `ticket-store.contract.ts` is a reusable contract that every `TicketStore` implementation must pass.

Server code imports only types from `@shared`; the shared package re-exports Angular services, so runtime logic belongs here.

## Ticket API

Tickets are stored on the server behind the `TicketStore` port (SC-028 in `design/problem-inquiry-system/concerns.md`). Responses wrap results as `{ data }` or `{ error: { message } }`.

| Route | Purpose |
|-------|---------|
| `GET /tickets` | List stored tickets. |
| `POST /tickets` | Body `{ ticket, dataKind? }` (`sample` by default, or `real`). Creates an open, version 1 ticket. Returns 201. |
| `POST /tickets/:id/changes` | Body `{ command, expectedVersion }`. 200 with `{ ticket, event }`; 404 unknown ticket; 409 stale version (the current ticket is in `error.current`); 422 refused by the lifecycle; 400 malformed. |
| `POST /tickets/:id/edits` | Body `{ content, expectedVersion }`, where content is the title, report, problem frame, scope, and optional estimate (it replaces all of them). Same answers as `changes`; 422 also for blank text or an edit that changes nothing. |
| `GET /tickets/:id/history` | State changes and content edits for a ticket, in order. An edit has `kind: 'edit'` with the content before and after. |

The actor of a change is the authenticated principal, or `anonymous` when no authentication is configured.

## System plan API

| Route | Purpose |
|-------|---------|
| `GET /system-plan` | Reads and parses the concern register at `design/problem-inquiry-system/concerns.md`; returns each concern's id, title, kind, status, prerequisites, and opening description, plus user acceptance for validated concerns, in `{ data }`. |

## Tests

```bash
npm run test:server
npm run test:server:coverage
```

Coverage is held at 100% (principle P-004).
