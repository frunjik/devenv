# DevEnv

DevEnv helps product teams—including developers, testers, salespeople, and project managers—make intended outcomes explicit and support the work of achieving them. Inspired in part by the strategy-to-technology connection described in Gregor Hohpe's [*The Software Architect Elevator*](https://architectelevator.com/book/), DevEnv connects Goals to the problems, decisions, work, evidence, and changes that contribute to those outcomes. Its central concern is what the System is meant to achieve; the software and tools are means to that end.

In this README, **Glossary**, **Term**, **Type**, and **Contract** are defined terms; see the [project glossary](./.glossary) for their meanings.

DevEnv is currently implemented as an Angular client and Express API.

See the [Project Knowledge Index](./knowledge/index.md) for the locations and roles of our decisions, learning, principles, vocabulary, design explorations, and reviews.

The root `.glossary.json` is the authoritative Glossary data source, with `term`, `definitions`, `examples`, and `domains` fields. The Glossary UI and API read these structured records directly; legacy `.terms` content is not used as a fallback. An empty `domains` array means usage is unknown or unrecorded, not confirmed absent. These labels record occurrence, not defining-Domain ownership.

Generate the human-readable `.glossary` Markdown view from the JSON source with `npm run generate:glossary:markdown`. The command reads `.glossary.json` and overwrites only `.glossary`; edit the JSON source, not the generated Markdown. Invalid records and file read/write errors fail the command.

Generate a derived Markdown view of the experimental MetaExport JSON with `npm run export:meta:markdown`. It reads `knowledge/knowledge-transfer/meta-export-example.json` and overwrites only `knowledge/knowledge-transfer/meta-export-example.generated.md`, leaving the hand-written example untouched. It preserves all revisions and escapes Markdown syntax in recorded text. Invalid shapes, duplicate identities/revisions, empty text, and unknown fields are rejected before writing; read/write errors fail the command. The generator does not select current instructions or establish recipient adoption.

Generate practice-history and Agent Essentials views with
`npm run generate:practice-set-versions:markdown` and `npm run generate:agent-essentials:markdown`.
These commands and `export:meta:markdown` use thin TypeScript entry scripts run by `tsx`, with typed renderers and runtime
validation. They retain the existing JSON inputs and Markdown output paths; edit
the authoritative JSON, not the generated views.

## Canvas symbol preview

Open `/canvas-symbol-preview` in the client for a read-only sample inspired by
the architecture sketch: green artifacts and system software, orange business
roles and products, and a cross-hatched developer figure.

The reusable Canvas 2D functions in
[canvas-symbols.ts](./projects/client/src/app/system/interactive-canvas/canvas-symbols.ts)
accept logical-pixel bounds and labels and restore canvas drawing state.
They use clipped hatch fills and vector corner icons, without image or font
downloads. The preview uses a single column on narrow screens and preserves the
stored diagram formats. This is a vector interpretation,
not a pixel-identical reproduction of handwriting.

In `/interactive-canvas`, the Type picker offers Rectangle, Artifact, System
software, Business role, Product and Actor. Choose a shape and enter a name before
adding a part, or change the shape of a selected part. The shared label input edits
only the name: an artifact named `AI Workflow` displays `Artifact:` and
`<AI Workflow>`. Actor names appear below the figure.
Actor selection and hit bounds are 60x100 logical pixels, with 10px of extra
room above and below the original rendering area, around the figure and
label, rather than the 180x80 box bounds; connection endpoints use these bounds.
Shapes support the existing selection, dragging, connection and removal controls. Overview and technical
pictures continue to load as rectangles; edits remain in-memory sketches.
Controls align to the global grid: name and type come before Add.
The canvas shows only the diagram, without a clock or periodic clock refresh.
Use **Ctrl+wheel** over the canvas to zoom between 25% and 400%, anchored at
the pointer. Ordinary wheel scrolling remains unchanged. **Ctrl+left-drag**
starting outside parts and connection lines pans freely without moving diagram
elements or clearing selection. Dragging a part moves all selected parts by
the same delta, preserving their relative positions. An unselected part joins
the selection when its drag starts. Connections follow their endpoint parts;
selecting a connection does not add its endpoints to the moving group.
Ordinary left-drag starting outside parts and connection lines draws a dashed
selection rectangle. On release, fully enclosed parts and connection segments
are added to the current selection; partly enclosed items are excluded.
Reverse dragging works too. A stationary empty click still clears selection,
and cancelling the gesture preserves the original selection.
Confirmed picture loading resets zoom and pan; cancelled replacement preserves
the view. Zoom and pan are session-only viewport transforms, not stored geometry.
The editor delegates geometry and hit-testing to `sketch-geometry.ts`, drawing
to `sketch-renderer.ts`, and ordered multi-selection to `SketchSelection` in
`sketch-selection.ts`. Their shared records are defined in `sketch.types.ts`.
Angular bindings, pointer lifecycle and picture-loading orchestration stay in
the component.
**Default template** loads an editable CompassDevEnv workflow based on the
reference sketch: four actors, system software, six Tech process symbols,
artifacts, products and business roles (25 parts and 28 connections).
The initial canvas remains empty. The main diagram is included without the
bottom legend/note; the reference's curved link uses the editor's straight
connections. AI Workflow and Locus remain unconnected, as in the reference.
The authoritative template geometry and symbol assignments live in
`projects/client/src/app/system/interactive-canvas/default-template.json`.
Loading it uses the same replacement confirmation as other pictures and creates
a fresh editable copy. Its 2040x1080 workspace scrolls on smaller screens.
Above the mobile breakpoint, name and type share the left half side by side,
matching Load overview's width, with Add beneath them.
Technical picture is stacked above Load overview on the left, with both
buttons anchored to the bottom of the toolbar above the canvas.
Above the mobile breakpoint, the canvas Items panel starts at the same height
as Label and Type on the right. Its list fills the right half (six global grid
columns), with removal and connection actions below. On mobile the list spans
both control columns.
The right-side actions anchor to the bottom of the toolbar above the canvas,
while the Items list stays aligned with the top of the left fields.
All canvas parts and connections appear in an always-visible checkbox list above
Remove selected, with parts first and connections second. The heading shows total
parts, total connections and the number selected. The list and canvas share one
multi-selection: checking a row or clicking an unselected item selects it and
makes it active for label/type editing. Clicking a selected item without dragging,
or unchecking its row, deselects it; editing falls back to the most recently
selected remaining item. Dragging keeps the part selected and makes it active.
All selected items are highlighted on the canvas. Clicking empty canvas clears
the selection outside connection-creation mode, which retains its existing
destination-picking behavior. The list has
a scrollbar when it exceeds its 12rem maximum height. Item rows
use compact text and a 28px minimum height, expanding when labels wrap. Connect and Cancel
sit below toward the same right edge, followed by picture loading. Narrow screens use two
control columns without splitting the canvas. Wide buttons (Add, Remove selected
and picture loading) fill their assigned grid space. Small toolbar buttons
(Connect and Cancel) use content-sized widths on mobile and fill their grid
cells above the 42rem mobile breakpoint. Replacement confirmation stays
content-sized. Both variants
retain a compact 36px minimum height.
One **Remove selected** action removes all selected parts and their incident
connections, and all selected connections. Confirming picture replacement
clears both kinds of checkbox selection; cancelling preserves them.

## Work time evidence

The [Problem/Domain versus Meta/DevEnv report](./knowledge/workflows/work-effort-report.generated.md)
compares the union of recorded evaluation delivery windows, not human hours worked.
Its summary shows category durations in hours:minutes:seconds alongside minutes,
a Problem + Meta subtotal, and the total observed union across all categories.
Human active effort, waiting and agent/tool execution remain unknown where no direct
observations exist. Same-category overlap counts once; cross-category overlaps stay
separate, and missing intervals are not converted to zero effort.

Run `npm run generate:work-effort:report` to refresh the typed
[JSON evidence snapshot](./knowledge/workflows/work-effort-report.json) and its generated
Markdown view from the current ledger, [reviewed classifications](./knowledge/workflows/work-effort-classifications.json),
workflow/WorkPlan sources, tracked workflow timing statements and all reachable `HEAD`
commit events. The snapshot records source hashes and the Git inventory commit.
The command also prints the same duration summary and totals in the terminal,
with space-padded columns, left-aligned labels and right-aligned numeric values.
Run `npm run generate:work-effort:slices` to refresh the same evidence files and
print only the aligned per-slice table instead of the category summary.
It lists every recorded evaluation as a slice, with its ID/title, category,
elapsed duration and minutes. Untimed or unfinished slices show `unknown`.
Slices are ordered by category, linked WorkPlan topic, then title and ID.
Displayed slice descriptions (ID and title) are capped at 64 characters,
including a trailing `...` when truncated; full descriptions remain in the evidence files.
Topic and category totals count recorded windows once. Topic totals exclude
cross-topic overlaps; category totals include those overlaps but exclude
cross-category overlaps. Both kinds of overlap have explicit rows.
Untimed or unfinished intervals are excluded from totals; groups with no complete
intervals retain unknown totals. Unlinked evaluations stay under
`No linked WorkPlan topic`; multiple topic links form one explicit combined group.
Individual slice windows overlap and must not be summed; use the category summary
for overlap-safe totals. This inventory does not cover historical work without
evaluation records.
Commit gaps are not durations; older commit outcomes remain unclassified until supported
by additional evidence. Changing classifications requires reviewing intended outcomes,
not inferring them from paths or existing Product/Meta labels.

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
The runtime-neutral `generateAgentGuidePreview` function exported by `@shared`
accepts guide, phase-skill, essentials and testing records and generates the
preview in memory. Browser and server consumers can use the same function; the
client wrapper only supplies saved JSON. Shared generation imports no repository
JSON, Angular or Node integrations. The page does not export, write or activate
customizations.
Phase definitions are authoritative in `knowledge/workflows/agent-phase-skills.json`;
the guide and selected testing requirements remain in their existing JSON sources.
Folder exports include only the six JSON/type dependencies needed by this preview,
not the full knowledge folder or its archives. Runtime invocation and toggle
enforcement remain unimplemented; generated file contents are proposals.
The guide also previews work continuity and measurement intent across its phases:
resuming work, retaining decisions, comparing outcomes with baselines and assessing
tracking overhead. These are exploration intents, not an adopted replacement for
the current workflow TODO and evaluation system.
The preview-only notice is a static page label, not part of any generated file.

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

The generic AgentPhaseGuide setup (`AGENTS.md`, the Agent Phase Guide and the six skills)
contains no DevEnv-specific rules. Its applicable defaults include TypeScript conventions:
use `interface` for grouped records and `type` for values, choices and named union alternatives.
DevEnv paths, commands and project-specific conventions live in the
[project profile](./.github/instructions/project-profile.instructions.md), which VS Code loads
for all files. Run `npm run export:agent-phase-guide` to export to the sibling folder
`devenv-agent-guide`, or `npm run export:agent-phase-guide -- <destination>` to choose
another destination. The command copies the generic
core into another folder, with [a profile template](./knowledge/practices/project-profile.template.md)
in place of the DevEnv profile and an `agent-phase-guide.manifest.json` pinned to `HEAD`.
The export includes a portable `README.md` explaining installation, the work loop,
defaults, optional tracking/measurement and limitations. Its narrative source is
[the export README](./.agents/agent-phase-guide.README.md); edit that source rather
than maintaining a separate explanation in the destination. It also includes
a minimal `package.json` with `tsx` plus standalone TypeScript scripts. From the
exported folder, run `npm install` and `npm run clone -- <new-destination>` to copy
the current Guide, including adapted profile/glossary and the cloning tooling itself,
without Git or DevEnv. The clone rejects existing or overlapping destinations and
does not copy unrelated project files. Its manifest remains inherited origin provenance.
It also derives a focused `.glossary.json` and its Markdown `.glossary` from entries
tagged with the `AgentPhaseGuide` domain in the [main glossary](./.glossary.json).
Edit definitions and examples only in the main source; the export selects and renders
them without maintaining a second glossary. Unrelated domain entries are excluded.
The export refuses to run while any exported source has uncommitted changes, and the
destination must be outside this repository.

**Optional tracking and measurement:** Tracking records task progress, decisions,
blockers and next steps in a project-profile registry. Measurement separately records
baseline, outcome evidence and observed metrics in a configured evaluation ledger.
For each new implementation task without a retained choice, the agent asks once
whether to track it, then separately whether to measure it if tracking is enabled.
Explanations, quick lookups, documentation-only changes and ongoing tasks do not
trigger a fresh tracking prompt.

Choices carry through follow-ups. Requests such as "tracking on/off" and
"measurement on/off" change the current task's conversational choices, not UI or
runtime-enforced switches. Measurement requires tracking: enabling measurement
while tracking is off requires agreement to enable tracking first; disabling tracking
also stops measurement, while disabling measurement leaves tracking on. Existing
records and evidence are preserved; measurements for disabled periods are not invented.
Importing projects can omit tracking configuration; missing storage must be resolved
before either practice can be enabled. DevEnv keeps its existing registry and ledger.

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
Runtime-neutral specs in `projects/shared/src` run in both the client
(jsdom) and server (Node) suites, so shared contracts are checked in both
environments without duplicating their test cases. Filesystem export tests
remain in the server suite and use the in-memory filesystem fake.

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
