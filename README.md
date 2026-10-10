# DevEnv

DevEnv helps product teams—including developers, testers, salespeople, and project managers—make intended outcomes explicit and support the work of achieving them. Inspired in part by the strategy-to-technology connection described in Gregor Hohpe's [*The Software Architect Elevator*](https://architectelevator.com/book/), DevEnv connects Goals to the problems, decisions, work, evidence, and changes that contribute to those outcomes. Its central concern is what the System is meant to achieve; the software and tools are means to that end.

In this README, **Glossary**, **Term**, **Type**, and **Contract** are defined terms; see the [project glossary](./.glossary) for their meanings.

DevEnv is currently implemented as an Angular client and Express API.

See the [Project Knowledge Index](./knowledge/index.md) for the locations and roles of our decisions, learning, principles, vocabulary, design explorations, and reviews.

The root `.glossary.json` is the authoritative Glossary data source, with `term`, `definitions`, `examples`, and `domains` fields. The Glossary UI and API read these structured records directly; legacy `.terms` content is not used as a fallback. An empty `domains` array means usage is unknown or unrecorded, not confirmed absent. These labels record occurrence, not defining-Domain ownership.

Generate the human-readable `.glossary` Markdown view from the JSON source with `npm run generate:glossary:markdown`. The command reads `.glossary.json` and overwrites only `.glossary`; edit the JSON source, not the generated Markdown. Invalid records and file read/write errors fail the command.

Generate a derived Markdown view of the experimental MetaExport JSON with `npm run export:meta:markdown`. It reads `knowledge/knowledge-transfer/meta-export-example.json` and overwrites only `knowledge/knowledge-transfer/meta-export-example.generated.md`, leaving the hand-written example untouched. It preserves all revisions and escapes Markdown syntax in recorded text. Invalid shapes, duplicate identities/revisions, empty text, and unknown fields are rejected before writing; read/write errors fail the command. The generator does not select current instructions or establish recipient adoption.

## Agent skills

The **Tools -> Agent guide** link opens `/agent-guide`, a read-only preview of
AgentPhaseGuide, its phase-skill JSON and seven proposed Copilot files: `AGENTS.md`,
one custom agent, four phase skills and a separate TDD skill. Each generated file has
its own tab showing raw Markdown; source JSON remains available above the tabs.
Each file tab offers **Preview / Source**, with Preview initially selected. The reusable Markdown preview accepts a
string input and renders through a pure `markdown-it` function and Angular HTML
sanitization. YAML frontmatter is a labelled code block; raw HTML and external
images are not rendered. The preview does not fetch Markdown or execute embedded
content. Code and tables scroll within the preview on narrow screens.
Pure functions generate
the preview in memory; the page does not export, write or activate customizations.
Phase definitions are authoritative in `knowledge/workflows/agent-phase-skills.json`;
the guide and selected testing requirements remain in their existing JSON sources.
Folder exports include only the six JSON/type dependencies needed by this preview,
not the full knowledge folder or its archives. Runtime invocation and toggle
enforcement remain unimplemented; generated file contents are proposals.

Custom agents live in [`.github/agents`](./.github/agents), the standard project-level
Copilot agent discovery location. Their YAML metadata declares names, descriptions,
and tool permissions. The Diligent Coder coordinates implementation using the
repository's TDD and Type Detector skills. Folder exports include this specific
directory, not unrelated GitHub configuration. Copy complete agent files to the same
location in another project and verify them in the receiving client's agent picker.

Repository skills live in [`.agents/skills`](./.agents/skills), a standard project-level
discovery location. Each skill has its own named folder containing `SKILL.md` and any
supporting resources. DevEnv folder exports already include this directory through
the `.agents` package entry.

To reuse selected skills in another project, copy their complete folders into that
project's `.agents/skills` directory. For personal use across projects, copy them into
`%USERPROFILE%\.copilot\skills` on Windows (or `~/.copilot/skills` on other systems).
Use a Copilot client with Agent Skills support, open a fresh chat, and verify discovery
in its skill/slash-command list before relying on invocation. Copying files alone does
not verify that a receiving client supports or has enabled skills.

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

Feature-specific UI guidance: light Problem Ticket cards define dark body and heading text locally rather than inheriting the global dark theme's light text. Ticket-list controls have a minimum 44px width and height; preserve wrapping and narrow-screen fit when adding controls. These requirements belong to this example feature, not the general meta concept.
The System Plan link is in the meta toolbar and is hidden when the meta layer is disabled; this does not change the default route.
The System Plan supports case-insensitive search by concern ID, title, or displayed description. Search filters the list only; progress totals still describe the full register.

The meta toolbar's **Workflow TODO** link opens `/workflow-todo`, a read-only workflow table. `GET /workflow-todo` derives its JSON from the authoritative `knowledge/workflows/workflow-todo-list.md` on each request; no duplicate JSON list is maintained. Resume buttons show the complete workflow Markdown document and its checkpoint reference, without editing, changing workflow selection, or jumping to a heading. The existing **TODO** file-browser link remains separate. List and document loading failures are shown explicitly.

The secondary navigation's **Diagram** link opens `/diagram`, currently an empty workspace.
The shared document contract supports Rectangle, Ellipse, Note, and undirected connections,
with explicit runtime validation of versioned JSON. Creating items and browser import/export
are not implemented yet; see the [diagram editor checkpoint](knowledge/workflows/diagram-editor-workflow.md#checkpoint).

The separate `/interactive-canvas` editor offers **Load DevEnv overview** for the purpose sketch
and **Technical picture** for local development architecture. The technical view derives nine
parts, directed relationships, technologies and Browser/Development host boundaries from the
authoritative [architecture draft](./projects/client/src/app/system/interactive-canvas/devenv-c4.json).
Loading either view over existing parts requires confirmation. Edits affect an in-memory copy,
not the architecture source; new connections in the technical view are directed, while purpose
sketch connections remain undirected. Boundaries follow their original members during dragging
and disappear when empty; newly added boxes have no boundary membership. Larger views scroll.
Expand the technical notes for responsibilities and deployment caveats. This does not change
the shared undirected document contract or the existing `/diagram` editor.

The **Visual foundations** link beside Canvas in the meta navigation opens `/visual-foundations` to compare trial typography,
semantic color roles, control states and an illustrative diagram using the current font and
palette. It reads the global CSS tokens rather than maintaining a separate palette. Selection
and input samples stay local to the page; nothing is saved. Trial typography, warning and
selection treatments are not applied to existing screens or adopted as repository conventions.

The meta toolbar's **Clone DevEnv** action opens a folder-export dialog (under **More** on mobile).
Enter an absolute folder path on the API server's machine; its parent must already exist.
The dialog requires acknowledgement that existing destination contents will be replaced.
The server stages the curated package before replacing the destination, rejects source/destination overlap
and existing symbolic-link destinations, and attempts restoration if installation fails.
The package includes client/server/shared source, scripts, configuration, documentation, agents,
skills and glossary, including `agent-practices.md`, the scoped
`knowledge/practices/practice-set-versions.json` policy, and the opt-in
`knowledge/practices/example-led-knowledge-modeling.md` and `reviews/rice-prioritization.md` processes. It otherwise excludes
the root `knowledge` and `reviews` folders, including practice archives, Git history, dependencies, build output,
cache folders, workspace-specific task/input/scratch resources and `.env` files.
Design-backed features such as System Plan and Workflow TODO require recipient-provided resources;
the export does not recreate those excluded documents or rewrite references to them.
Historical review-ledger, reference-archive and modeling-example links are unavailable in clones;
they are provenance references, not required guidance or active procedures.
An indeterminate progress bar is shown while exporting. Success closes the dialog automatically
and shows a success snackbar. Export errors keep the dialog open for retry; any failure to remove
the previous destination is included in a persistent warning snackbar after the successful export.
The [DevEnv Export checkpoint](./knowledge/workflows/devenv-export-workflow.md#checkpoint) records the current
green-tests milestone and the remaining safety and full-coverage verification before the export trial is complete.

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
