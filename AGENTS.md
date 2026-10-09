# Agent guidance

## Repository overview

This workspace contains an Angular client and libraries, plus an Express API:

- `projects/client`: Angular application.
- `projects/shared`: runtime-neutral API contracts and validation, imported as `@shared`.
- `projects/server`: Express API and server tests.

Keep changes scoped to the relevant project and follow the existing patterns in nearby files.

## Development

Install dependencies from the repository root with `npm install`. Run the client and API in separate terminals:

```bash
npm run dev:client
npm run dev:server
```

Client development resolves `@shared` from source through `projects/client/tsconfig.app.dev.json`; no separate shared build/watch process is required. Production builds still use the packaged library.

## Build and test

Build shared contracts before the client that consumes them:

```bash
npm run build -- --project shared
npm run build -- --project client
```

The root build script requires an explicit Angular project. The `server` Angular build target has known TypeScript errors and is not part of the supported passing build sequence.

Run the relevant Jest suite after changing code:

```bash
npm run test:client
npm run test:server
```

Use `npm run test:all` when changes affect both client and server. The maintained test suites use Jest; prefer these package scripts over `ng test`.

## Change guidelines

- Prefer short, cohesive functions; split at meaningful functional boundaries rather than arbitrary line counts. Extract responsibilities that make sense on their own, avoid trivial forwarding helpers, and preserve behavior during refactoring. See P-018.
- Inspect nearby components before editing. Angular components use external `.html` templates via `templateUrl` and external `.scss` styles via `styleUrl`, not inline `template` or `styles` in TypeScript. Existing inline templates/styles are not evidence of the preferred convention; migrate them only within agreed scope.
- Treat requests to change a view as presentation-only by default: preserve underlying domain/shared/API Types and source data unless the user separately asks to change them. See P-024.
- When an existing Type makes the current behavior disproportionately complex, report it as a refactoring candidate with evidence and concrete alternatives; do not silently work around or refactor it without agreement. See P-002 and P-027.
- Reuse the shared palette variables in `projects/client/src/styles.scss` for matching visual roles instead of duplicating their color literals. Keep feature layouts and intentional color variants local.
- Use the opt-in `.accent-card` class for matching dark card surfaces with an accent border; keep padding, corner radius, and layout in the component stylesheet.
- Material meta toolbars opt into `.meta-toolbar` for their shared background and text colors through Material theme variables; keep layout, sizing, and responsive rules in the component stylesheet.
- Light Problem Ticket cards define dark body and heading text locally rather than inheriting the global dark theme's light text. Ticket-list controls have a minimum 44px width and height; preserve wrapping and narrow-screen fit when adding controls.
- Native text controls can opt into the global `.form-field` label/control layout and `.form-control` appearance. Keep feature spacing local; do not apply these classes indiscriminately to Material controls, radios, or specialized editor controls.
- Prefer shared API contracts in `projects/shared` and import them from `@shared`.
- `@shared` should contain only code valid in both the browser client and Node server, including its transitive dependencies. Keep runtime-specific integrations in their respective projects. The unused Angular scaffold exports and runtime peers have been removed; Angular CLI/ng-packagr remains build tooling only. See P-019.
- Use `type` for a named value or choice and `interface` for properties grouped into a record. Define structured union alternatives as named interfaces, then combine them with a `type` union instead of inline anonymous records. Derived types still use `type`; preserve discriminated-union constraints. This is a declaration convention, not runtime validation or a reason to rewrite existing code. See P-017 in the System Task Principles.
- When changing API behavior, check both its server implementation and related client/shared callers and tests.
- Prefer structured data storage in this order: Typed JSON (JSON with an explicit interface), then YAML, then Markdown. Unless otherwise specified, generate human-readable Markdown from the authoritative structured source, not the reverse; do not maintain two independent sources of truth. Interfaces do not replace runtime validation. Record justified exceptions and preserve existing sources unless migration is agreed. See P-015 in the System Task Principles.
- Preserve existing feature-store formats and workflows documented in `README.md`.
- Avoid unrelated edits; run the smallest relevant tests and builds, and report any known or newly encountered failures.
- Before acting, check applicable established processes and confirm relevant good practices against maintained project guidance, official documentation, or other credible evidence. If a user proposal/action or the assistant's own approach conflicts with good practice or differs from an existing process, give a concise report stating the observation, evidence, likely impact, and recommended alternative. Distinguish a harmful practice from a legitimate process variation and uncertainty from confirmed facts. Raise consequential conflicts before acting; do not silently override policy or expand scope. See P-016.
- When choosing among competing optional work candidates, assess whether RICE fits and, if so, ask whether the user wants to apply it before scoring. Use comparable contexts and evidence-backed estimates; do not invent inputs, rank mandatory rules by RICE, or let scores override dependencies or agreed constraints. See P-016 and [RICE prioritization guidance](./reviews/rice-prioritization.md).

## System task principles

Follow the maintained [system task principles](.agents/system-task-principles.md) for work that designs or implements this system. The register is additive: preserve existing principles when adding new ones, and surface conflicts for resolution rather than silently overriding them.

### Focused work loop

1. **Select:** Continue the one explicitly active workflow; state the requested outcome and acceptance condition. Before a new substantive task, ask whether to add it to the Workflow TODO List as resumable work and, if it is an eligible coding slice, whether to record a WorkEvaluation (P-026). Ask separately and wait for the user's choices before implementation; do not repeat this prompt when continuing the task. For an opted-in eligible slice, record the lightweight baseline before work.
2. **Implement:** Keep changes within that outcome. For production code, follow Red-Green-Refactor and report the current TDD phase. Defer optional adjacent work instead of silently expanding scope.
3. **Verify:** Run the smallest relevant tests; for production modules changed by the task, verify all four coverage metrics as defined in P-004. For TypeScript, run the appropriate type-check/build. Review duplication and applicable Type candidates, reporting disproportionate existing-Type complexity for refactoring with concrete suggestions; do not run unrelated broad checks by default.
4. **Close or pause:** Record actual evidence and unknowns. Update the workflow checkpoint and global list only when pausing, switching, or completing tracked work. Briefly check for a concrete meta-level lesson; do not manufacture one.
5. **Report:** At each applicable stopping point, give the `Status:` result and a compact complete global workflow/status and evaluation-metrics report. When work is stable and a subject can reasonably be proposed, include an informational suggested commit subject; it is not a commit request or approval. At a three-minute active-work gate, ask whether to continue before resuming. Commit only when explicitly requested, then obtain approval of the commit subject.

- Apply the focused work loop in order. Its detailed, scope-specific gates are: TDD and phase reporting (P-001), duplication review (P-020), Type review and provisional naming (P-002/P-012/P-022), type-checking (P-003), coverage (P-004), and stop/report/commit rules (P-005/P-021/P-023). Follow each principle's full criteria where it applies; do not run unrelated checks.
- Do not change or remove surrounding code without user permission. If a specific, non-generic surrounding-code constraint blocks a sound solution, explain why a narrow change is needed and its likely impact, then ask first; see P-006 in the principle register.
- In every test file created or modified for this system, import each used Jest helper from `@jest/globals` on the first line; do not rely on ambient Jest globals. See P-007 in the principle register.
- Keep test samples distinct from live records: use concise, clearly named transformed examples that preserve only the tested distinctions and invariants; see P-025.
- Tests must have zero external side effects, including real filesystem mutations and real network activity, directly or through setup, cleanup, or application/subprocess behavior. Localhost servers, socket listeners, and loopback requests are not exempt; use simple Boundary Mocks at external I/O boundaries. Console logging, read-only filesystem access, isolated test-local memory/DOM changes, and test-runner coverage reports/caches are allowed. Existing filesystem/network suites require migration under SC-053; passing coverage does not establish compliance. A dedicated test logger remains a candidate, not an adopted requirement. See P-014.
- When reviewing note or Problem descriptions, assess whether their concepts or wording warrant a Glossary entry, a new or refined Type, or another general system concern. Do not silently treat candidates as agreed domain meaning; see P-009 in the principle register.
- When a commit's subject is one or more System Concerns, use `SystemConcern-NNN:` as the prefix (for example `SystemConcern-044:`), followed by a short phrase describing this specific commit's contribution, not a restatement of the concern's stable Title. `SC-NNN` remains the register identifier, not the current commit-subject prefix; see P-011.
- Before drafting any commit message for approval, read P-005 and P-011 in the principle register and check the current naming preference, scope-specific subject, and attribution preference. Omit the Copilot `Co-authored-by` trailer until the user says otherwise. User approval follows this check; it does not replace it. Do not add automated enforcement for this preference without a separate user decision.
- When a candidate name for a Type, Term, or mapping surfaces from either direction — I consider it mid-reasoning, or the user proposes it — check it against existing names for consistency and either ask the user or report an honest assessment before it is adopted; see P-012 in the principle register.
- Glossary entries explain Terms, not reference policies. The current example-qualified Term name is `SubjectDomain (WMS AI)`; use it when referring to that example. This supersedes the earlier `SubjectDomain (WMS)` reference preference without rewriting historical WMS context. See P-012.
- For concepts we introduce, including process names and Terms, include a named concrete instance from the actual system or meta practice, such as `SubjectDomain (WMS)` or `KnowledgeStatement (commit-attribution)`, to improve reader understanding. Do not equate the concept with its example or invent an instance; state when none is known. Keep this reference policy separate from abstract Glossary definitions; see P-012.
- Prefer Term examples from SubjectDomain (WMS), DevEnv, or our meta practices. Use a clear, genuine fit rather than inventing domain facts; these preferred contexts do not establish separate formal Domains. See P-012.
- For knowledge-transfer modeling, follow [Example-Led Knowledge Modeling](./knowledge/practices/example-led-knowledge-modeling.md): meaning -> concrete Markdown example -> candidate Type -> JSON -> check preserved meaning. Ask for names before adoption and test a contrasting example before choosing the authoritative representation; see P-002.
- Maintain resumable work in the [Workflow TODO List](./knowledge/workflows/workflow-todo-list.md). Before switching, save decisions, open questions, and the next step in the detailed workflow document; update selection/status in the list without duplicating progress. Read the selected checkpoint before resuming.
- While the [DevEnv Value Evaluation](./knowledge/workflows/devenv-value-evaluation-workflow.md) pilot is active, capture lightweight pre-work and completion measures for eligible coding slices when the user opts in; treat engineering checks as implementation evidence, not proof of user or team value.
