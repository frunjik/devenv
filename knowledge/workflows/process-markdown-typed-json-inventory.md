# Process Markdown Typed JSON Inventory

## Checkpoint

**Status:** Completed — read-only inventory; no authority changes or migrations performed.

**Purpose:** Starting from the top-level `AGENTS.md`, inventory repository Markdown process/guidance documents and report whether each has a matching authoritative Typed JSON source and an explicit TypeScript interface.

**Scope:** Read-only assessment of content and existing sources. Do not migrate files, create interfaces, or change source-of-truth authority.

**Method:** Enumerate repository Markdown files; identify process/guidance documents and their references from `AGENTS.md`; cross-check corresponding JSON and explicit TypeScript interfaces. Distinguish exact counterparts from partial or merely related structured data.

## Findings

The repository contains 71 Markdown files (including this checkpoint), excluding dependencies, build output, and Git internals. Starting at the top-level `AGENTS.md`, its process/guidance links lead to agent instructions, principles, skills, project practices, and workflow checkpoints. These must not be conflated with generated data views, research, review records, examples, or scratch notes.

### Complete Typed JSON and generated Markdown

These are established examples with a JSON source, an explicit TypeScript interface/type, and a generated Markdown view:

- `knowledge/practices/portable-commit-process.generated.md` — `portable-commit-process.json`; `CommitProcessConfiguration` in `portable-commit-process.types.ts`. This is a saved proposal, not activated local policy.
- `knowledge/practices/portable-practices-checklist.generated.md` — `portable-practices-checklist.json`; `TodoList` in `portable-practices-checklist.types.ts`. The extraction is proposed, not adopted policy.
- `knowledge/practices/practice-set-versions.generated.md` — `practice-set-versions.json`; `PracticeSetVersion` and `PracticeCustomizationVersion` in `practice-set-versions.types.ts`.
- `knowledge/workflows/workflow-todo-list.md` — `workflow-todo-list.json`; `WorkflowTodoList` in `projects/shared/src/lib/workflow-todo.types.ts`, with runtime validation and a deterministic generator.

### JSON exists, but the Markdown is not backed by a complete explicit Type

- `knowledge/architecture/devenv-c4.md` and `devenv-c4.generated.md` use `devenv-c4.json` as authority, but no explicit TypeScript interface was found for that JSON model.
- `knowledge/knowledge-transfer/meta-export-example.md`, `meta-export-example.generated.md`, and `glossary-meta-export-example.md` have related JSON examples/trials, but no explicit TypeScript interface. The examples explicitly remain non-authoritative; the Glossary example's meaningful distinctions remain narrative and its candidate structure was deferred.
- `knowledge/workflows/meta-export.md` links to candidate JSON examples, not a typed authoritative representation of the process or its unresolved modeling questions.

### Typed JSON covers related data, not the Markdown process/checkpoint

- `knowledge/workflows/workflow-todo-list.md` is the generated, fully typed registry view. Its `WorkflowTodoList` JSON/interface also records status, work purpose, resume reference, and optional evaluation IDs for each of the 17 workflow checkpoint Markdown files; it does not represent their detailed procedures, evidence, decisions, or next steps.
- `knowledge/workflows/devenv-value-evaluation-workflow.md` has metric/evaluation records in `devenv-value-evaluation.json` typed by `EvaluationMetric`, `WorkEvaluation`, and `WorkEvaluationDataset`; the pilot's narrative process, limitations, and decisions remain Markdown.
- `knowledge/workflows/active-workflow-view-workflow.md`, `ai-credit-estimator-workflow.md`, `diagram-editor-workflow.md`, `principle-register-review.md`, `todo-view-workflow.md`, and `workflow-evaluation-associations.md` link to relevant WorkEvaluation records in that same JSON. The records measure slices; they do not encode the complete workflow checkpoints.
- `knowledge/workflows/full-glossary-export-workflow.md` and `glossary-refinement.md` concern glossary data represented in `.glossary.json` and `GlossaryEntry` (`projects/shared/src/lib/glossary.types.ts`), but those process narratives are not generated from that data.
- `knowledge/practices/commit-process.md` is related to the typed portable commit-process proposal, but is a distinct local process description and is not generated from it.

### Process/guidance Markdown without a complete typed JSON counterpart

- Root/project guidance: `AGENTS.md`, `WORKSPACE.md`, `README.md`, `TODO.md`, `TODO-RAW.md`, `TODO_meta.md`, and `DEVENVOPDEV.md`.
- Agent customization and governing rules: `.agents/system-task-principles.md`, all five `.agents/skills/*/SKILL.md` files, and both `.github/agents/*.agent.md` files.
- Practices: `knowledge/practices/example-led-knowledge-modeling.md`.
- Workflow checkpoints without complete structured counterparts: `devenv-export-workflow.md`, `knowledge-migration.md`, `process-markdown-typed-json-inventory.md`, `term-editing-workflow.md`, `test-boundary-mocks.md`, and `ui-design-review-workflow.md`. (The other workflow records are classified above as partial or fully generated.)
- Operational documentation: `projects/server/README.md` and `projects/shared/README.md`.

Other Markdown files outside these guidance/process, generated-view, and related-data categories are knowledge indexes/theory, domain models, research and exploration notes, dated reviews, examples, historical documentation, and scratch files. They have no corresponding complete Typed JSON source/interface; any topic-adjacent JSON is not by itself proof that the Markdown is represented or should become a generated view.

**Overall:** Four generated views meet the full Typed JSON/interface criterion. The C4 model and MetaExport example views have JSON but no explicit interface; several workflow and Glossary documents have only related data. The remaining process/guidance documents are Markdown-only. This audit does not decide that every such document is suitable for lossless conversion; process and narrative distinctions, provenance, unresolved questions, and examples need to survive any future reviewed migration.

**Authority:** Unchanged. This inventory is an audit; it does not migrate sources, adopt proposed policy, or create new interfaces.
