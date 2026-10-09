# Minimal typed diagram editor for DevEnv

## Problem and approach

Add a small generic diagram editor inside the existing Angular application. Users choose predefined items, drag them onto a workspace, move and edit them, and connect them with lines.

Use Angular HTML elements for items, an SVG layer for connections, and the already-installed Angular CDK for dragging. "Canvas" describes the interactive workspace, not an HTML canvas bitmap. Keep the document and its operations independent of CDK, DOM, SVG, and any future diagram library.

## Checkpoint

**Status:** Pending implementation. The plan is saved in the repository; implementation has not started.

**Authority:** This document is the maintained plan. The session-local plan points here rather than maintaining a separate copy.

**Decisions:** The agreed scope, model, and behavior are recorded below.

**Open questions:** None blocking the agreed minimal scope. Future ports, viewport state, and diagram-library selection remain outside this plan.

**Next step:** On an explicit request to start implementation, read this checkpoint and current project guidance, then begin the document-contract todo with a failing test.

## Confirmed decisions

- A generic editor inside DevEnv, not a WMS-specific model or standalone application.
- Start with minimal HTML/SVG and existing CDK, while preserving a growth path to zoom, pan, connection handles, and a possible diagram library.
- Fixed starter palette: Rectangle, Ellipse, Note.
- Editable labels; Note also has editable text. No arbitrary property dictionary or property-schema editor.
- Fixed item sizes for the first version; shapes differ in presentation, not domain meaning.
- Selectable, labeled, undirected straight connections.
- No self-connections; at most one connection between any unordered pair of items.
- Deleting an item also deletes all connections attached to it.
- Export/import JSON files, without API changes, repository writes, or browser autosave.
- Treat a successfully initiated export as saved. Display "download started", not a claim that the file was retained.
- Confirm before leaving, importing a replacement, or clearing a diagram with unexported changes. Canceling or invalid import preserves the current document.
- Agreed Type names: DiagramDocument, DiagramElement, DiagramPoint, DiagramConnection, DiagramSelection, DiagramInteraction.

## Observable goals

1. Create a diagram: dragging a palette entry into the workspace creates a new instance, without removing the palette entry; dropping outside does not create an item.
2. Manipulate items: selecting, moving, and editing updates the typed document and the visible diagram consistently.
3. Express relationships: connecting two items creates one selectable line; movement updates its geometry and deletion cannot leave dangling references.
4. Preserve work: exported JSON can be imported to reproduce all document content; malformed or unsupported content is rejected explicitly without replacing current work.
5. Grow later: rendering and view changes do not alter stable item identities, property meaning, or stored positions.

## Minimal model

The following is a design sketch, not production code:

```ts
interface DiagramPoint {
    x: number;
    y: number;
}

type DiagramElement =
    | {
        id: string;
        kind: 'rectangle' | 'ellipse';
        label: string;
        position: DiagramPoint;
    }
    | {
        id: string;
        kind: 'note';
        label: string;
        text: string;
        position: DiagramPoint;
    };

interface DiagramConnection {
    id: string;
    sourceElementId: string;
    targetElementId: string;
    label: string;
}

interface DiagramDocument {
    schemaVersion: 1;
    title: string;
    elements: DiagramElement[];
    connections: DiagramConnection[];
}

type DiagramSelection =
    | { kind: 'none' }
    | { kind: 'element'; elementId: string }
    | { kind: 'connection'; connectionId: string };

type DiagramInteraction =
    | { kind: 'idle' }
    | { kind: 'connecting'; sourceElementId: string };
```

### Meaning and invariants

- DiagramDocument is the complete transferable diagram, not a screen snapshot.
- DiagramElement separates palette definitions from independently editable instances. A Note requires text; Rectangle and Ellipse do not acquire arbitrary note-only properties.
- DiagramPoint stores an item's top-left position in diagram coordinates. Values must be finite and non-negative in v1.
- DiagramConnection refers to stable item IDs, not pixels, DOM elements, or CDK references. Source/target are storage endpoint names and do not imply arrows or directional meaning.
- DiagramSelection distinguishes selecting an item from selecting a line, with no ambiguous optional IDs.
- DiagramInteraction represents the source-selected/target-pending connection workflow and makes cancellation explicit.
- IDs must be non-empty and unique within their respective element/connection collections.
- Every connection endpoint must exist, endpoints must differ, and unordered endpoint pairs must be unique.
- Known kinds, schema version, required fields, and property types are checked at runtime. Reject unsupported fields rather than silently losing information during import.
- Labels, title, and Note text are plain strings; empty text is allowed and rendered safely as text, never as HTML.
- Selection and interaction references must remain valid after deletes, clear, and import.
- Exported content does not include selection, hover, drag previews, connection previews, dirty state, or calculated SVG geometry.
- Types document structure; validation and public operations enforce cross-reference and numeric invariants.

No actual DiagramDocument or DiagramElement instance exists in this system yet. A future demonstration may label items with existing DevEnv concepts, such as Problem and Inquiry, but that would be a drawing example, not a new formal domain relationship. Contrast: a Note is annotation text, not a ProblemTicket or a GlossaryEntry.

### Type review conclusions

- Justified: separate saved document, item, relationship, position, selection, and connection interaction concepts. They have distinct obligations or prevent ambiguous state.
- Reuse existing shared-contract and discriminated-union conventions, not existing ProblemTicket or GlossaryEntry shapes.
- No justification yet for a generic graph framework, extensible property system, branded IDs, formal ports, viewport persistence, or command/event hierarchy.
- Ports and viewport state remain future candidates, not adopted Types. Review their names and semantics when their features are requested.
- The checked shared Types and Glossary contain no conflicting diagram names.

## UI and behavior

- Add a `/diagram` route and a "Diagram" link in the DevEnv toolbar's secondary navigation.
- Page: palette, scrollable workspace, selected-item/connection properties, and New/Clear, Import, Export actions.
- Palette dragging creates a fresh item at the drop position; offer a click-to-add action for keyboard/non-drag use.
- Move items with CDK free dragging. Convert browser coordinates to diagram coordinates accounting for workspace offset and scrolling; do not treat list ordering as canvas positioning.
- The document owns final positions. Temporary drag state can drive live line updates and is reconciled or reset after drop, avoiding double-applied CSS transforms.
- Workspace extent includes its items and provides a usable initial empty area. Do not introduce an arbitrary item-count limit.
- Connect workflow: select an item, activate Connect, select a different item. Escape/Cancel exits the workflow. Show a temporary preview and a clear instruction while choosing a target.
- Lines attach at item boundaries using derived geometry. They update while dragging and after a move. Give lines a wider transparent hit target for reliable selection.
- Selecting an element edits its label and, for Note, its text; selecting a connection edits its label.
- Provide explicit delete controls; editing text must not accidentally trigger item deletion or dragging.
- Provide numeric position inputs for a non-drag repositioning alternative. Invalid coordinates show an error without changing valid document state.
- Clear and import reset obsolete selection and connection interaction.
- Invalid actions and import/export failures produce visible messages; no silent repair or success-shaped fallback.
- Use external HTML/SCSS, existing palette variables, and matching opt-in shared styling classes. Preserve narrow-screen wrapping and accessible labels/focus.

## Import, export, and unexported-change safeguards

- Export writes the DiagramDocument as formatted JSON through the browser, with a filename such as `diagram.json`.
- Import reads a user-selected JSON file as unknown input, parses and validates the complete candidate, then replaces the document atomically after any required discard confirmation.
- Parsing failure, unsupported version, invalid coordinates, wrong fields, duplicate IDs/pairs, and dangling connections leave current work unchanged.
- Track a clean document snapshot after initial empty state, successful import, clear/new, and successfully initiated export. Compare document content, not view state; canceled/no-op operations do not dirty it.
- Dirty import/clear and Angular route departure require confirmation. Browser close/reload uses the native beforeunload mechanism, subject to browser restrictions; do not promise customized dialog text or universal prompting.
- Use an Angular CanDeactivate guard scoped to the diagram route, not a global navigation change.
- Do not mark clean when initiating export fails. A initiated download is the user-agreed saved boundary, not proof of durable storage.
- Browser file reading, download, confirmation, and unload behavior are external boundaries for tests. Tests must not create or alter actual user files.

## Growth and migration boundary

- Keep all persisted positions in diagram coordinates from the start. Initially the view has scale 1 and no pan.
- Later zoom/pan adds view transforms and inverse pointer conversion; stored positions remain unchanged.
- Store relationships by item ID now. Later connection handles may initially use the same endpoints; multiple named ports require an explicit schema version and migration.
- Keep the canvas renderer separate from document validation and operations. A future library may replace that renderer and translate its events into the existing operations.
- No speculative plugin interfaces or abstraction-heavy adapter framework now.
- Migration is possible, not free or guaranteed: a chosen library's coordinate, endpoint, and interaction conventions still need evaluation and mapping.
- Resizing, persisted routing points, ports, or new item-specific properties must be introduced intentionally through model review and versioned JSON migration, not library payloads embedded in the document.

## Components and files

- `projects/shared/src/lib/diagram.types.ts`: agreed document Types and runtime validation; export through the existing `index.ts`/public API chain.
- `projects/client/src/app/system/diagram/`: feature-local pure document operations, page component with external HTML/SCSS, dedicated canvas renderer with external HTML/SCSS, and browser file/dirty-route handling as needed.
- Keep the properties panel in the page template initially; extract only if implementation warrants it.
- `projects/client/src/app/app.routes.ts` and its tests: diagram route and scoped departure guard.
- `projects/client/src/app/navigation-toolbar/navigation-toolbar.component.html` and its tests: only the agreed secondary navigation link.
- Tests under the existing client Jest roots, including tests importing shared validation via `@shared`; no new shared test runner.
- `README.md`: describe entry point, supported interactions, JSON file workflow, limitations, and saved-boundary semantics.
- This workflow is registered as Pending in [Workflow TODO List](./workflow-todo-list.md). During implementation, maintain this checkpoint and its selection/status in the list. Preserve other workflows.
- Update the authoritative `.glossary.json` only for agreed diagram-domain meanings, using the existing generator for its Markdown view. Do not turn every UI helper Type into a Glossary entry.

These route/menu changes are explicitly part of the proposed feature scope. No unrelated navigation, API, feature-store, or surrounding-code changes are authorized.

## Implementation todos

1. **Defining the document contract:** Write failing domain-derived tests, then implement shared Types, runtime validation, and exports.
2. **Implementing document operations:** Test then implement create, move, edit, connect, delete, and clear operations; enforce invariants and preserve state on refusal.
3. **Building canvas interactions:** Test then implement palette creation, selection, dragging, derived line geometry, connection workflow, and cancellation.
4. **Adding properties and file workflow:** Test then implement editing, JSON round-trip, explicit errors, dirty tracking, discard confirmations, and browser boundary handling.
5. **Integrating DevEnv navigation:** Add the route, scoped guard, and secondary toolbar link, preserving current routes and responsive navigation.
6. **Recording documentation and checkpoints:** Update directly related documentation, justified Glossary meanings, and the resumable workflow.
7. **Verifying the complete editor:** Validate behavior, exact in-scope coverage, type safety, and the running UI.

Dependencies: document operations follow contract; canvas follows operations; properties/file workflow follows canvas; navigation follows the page/file workflow; documentation follows integrated behavior; final verification follows integration and documentation.

## Verification and working rules

- Follow Red-Green-Refactor for each production behavior; a plan/model sketch is not TDD execution.
- Import every used Jest helper from `@jest/globals` on the first line of touched test files.
- Derive cases from public workflows, using simple mocks only at browser/system boundaries. No internal collaborator mocks or real filesystem mutations.
- Test valid and contrasting invalid documents, undirected duplicate detection in either order, references, finite positions, missing/extra fields, unsupported versions, edits, canceled/no-op interactions, cascade deletion, round-trip preservation, dirty baselines, and failure atomicity.
- Include CDK event integration tests and a running-browser check for palette drops, scroll-coordinate mapping, live connection alignment, focus, line selection, and narrow layouts.
- Test that existing routes/menu actions remain unchanged.
- Run the smallest focused client Jest selectors during development. Run focused coverage with all newly added and touched in-scope production modules explicitly included; require 100% statements, branches, functions, and lines.
- Build shared before client:
  - `npm run build -- --project shared`
  - `npm run build -- --project client`
- Run the full client suite if targeted integration results require escalation. No server suite/build is required because server behavior is unchanged; the known server Angular build failures are outside this scope.
- Review Types after workflow discovery, exception handling, and before completion. Report remaining candidates instead of silently adopting them.
- Observe the repository's continuation gates at stable points and record any new user-provided rules only if given.
- Leave all changes uncommitted unless the user explicitly requests a commit.

## Out of scope

- Zoom/pan, resizable items, named ports/connection handles, custom routing, arrow semantics, and nested diagrams.
- Undo/redo, multi-selection, copy/paste, collaboration, autosave, and API/repository persistence.
- Image/PDF/SVG export, custom item-definition editors, domain rules for WMS, and formal links to existing tickets/Glossary entries.
- New diagram-library dependencies or framework-wide abstractions.

## Evidence and considerations

- Existing Angular 20 application uses standalone components with external HTML/SCSS; Angular CDK is already a dependency.
- Angular CDK's official drag-drop guide documents free dragging and emphasizes that interaction events do not automatically update application data: https://angular.dev/guide/drag-drop
- Shared public Types and runtime validation patterns already exist; the client Jest configuration maps `@shared` to source.
- P-001/P-004 require TDD and exact coverage; P-002/P-012 require evidence-backed Type/name review; P-014 prohibits filesystem-mutating tests; P-015 prefers Typed JSON; P-016 requires checking practices.
- Repository status was clean during planning. No existing diagram implementation was found in the checked projects.
- HTML/SVG plus CDK is a scoped design recommendation, not a universal standard. A mature diagram library becomes worth reassessing if advanced interactions dominate the next agreed scope.
- No general meta-practice addition is justified by this planning slice; preserve repository guidance rather than adding speculative policy.
