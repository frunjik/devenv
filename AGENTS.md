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

- For production code, use Red-Green-Refactor as defined in `.github/agents/test-driven-developer.agent.md`.
- When doing TDD, explicitly mention the current state: Red, Green, or Refactor. See P-001.
- After each TDD slice reaches Green, review changed code for duplication and extract a cohesive reusable function when it clarifies a responsibility or provides meaningful reuse; avoid abstraction for coincidental similarity. See P-020.
- At the defined checkpoints, review the domain and implementation for missing or refinable Types using `.github/agents/type-detector.agent.md`; report justified Type convictions and unresolved candidates to the user.
- Before completing a TypeScript coding task, run an appropriate TypeScript-aware type-check or build for the changed code and resolve type errors; report any check that could not run.
- For in-scope production code, require 100% line, statement, branch, and function coverage using domain-derived tests through public interfaces; allow simple mocks only at boundaries. Do not change production code for testability except after proving code is unreachable and cannot otherwise be covered, as detailed in the principle register.
- At stable checkpoints, verify that tests are green, in-scope production code has 100% coverage on all four metrics, and no Type cleanup or refactoring remains. Leave changes uncommitted unless the user explicitly requests a commit; then present the drafted commit message (short, subject-only by default) for approval before running the commit. Pause for any requested user review; see P-005 in the principle register.
- Whenever stopping, pausing, or requesting commit approval, include a `Status: Stable` or `Status: Not stable` line grounded in tests, 100% four-metric coverage, and a passing type-check/build; distinguish build verification from actually running the application. See P-021.
- Do not change or remove surrounding code without user permission. If a specific, non-generic surrounding-code constraint blocks a sound solution, explain why a narrow change is needed and its likely impact, then ask first; see P-006 in the principle register.
- In every test file created or modified for this system, import each used Jest helper from `@jest/globals` on the first line; do not rely on ambient Jest globals. See P-007 in the principle register.
- Tests must have zero external side effects, including real filesystem mutations and real network activity, directly or through setup, cleanup, or application/subprocess behavior. Localhost servers, socket listeners, and loopback requests are not exempt; use simple Boundary Mocks at external I/O boundaries. Console logging, read-only filesystem access, isolated test-local memory/DOM changes, and test-runner coverage reports/caches are allowed. Existing filesystem/network suites require migration under SC-053; passing coverage does not establish compliance. A dedicated test logger remains a candidate, not an adopted requirement. See P-014.
- If work takes more than three minutes, pause at the next stable point and ask before continuing. Wait for explicit permission; if granted, record any new user-provided rule in this guidance and the principle register before resuming. Repeat this gate for each further period of ongoing work; see P-008 in the principle register.
- When reviewing note or Problem descriptions, assess whether their concepts or wording warrant a Glossary entry, a new or refined Type, or another general system concern. Do not silently treat candidates as agreed domain meaning; see P-009 in the principle register.
- After working for a while, at the same stable points as the three-minute gate, consider whether there is knowledge worth noting at the meta level (for example improving the SC-NN numbering, or noticing the same thing being done repeatedly in different shapes). If so, add a note under "Meta Notes" in `knowledge/domain-models/problem-inquiry-system/concerns.md`. After roughly every 10 implemented feature slices, also step up to a meta-meta evaluation of whether the whole system of principles and conventions is still serving this project's purpose as a learning sandbox; see P-010 in the principle register.
- When a commit's subject is one or more System Concerns, use `SystemConcern-NNN:` as the prefix (for example `SystemConcern-044:`), followed by a short phrase describing this specific commit's contribution, not a restatement of the concern's stable Title. `SC-NNN` remains the register identifier, not the current commit-subject prefix; see P-011.
- Before drafting any commit message for approval, read P-005 and P-011 in the principle register and check the current naming preference, scope-specific subject, and attribution preference. Omit the Copilot `Co-authored-by` trailer until the user says otherwise. User approval follows this check; it does not replace it. Do not add automated enforcement for this preference without a separate user decision.
- When a candidate name for a Type, Term, or mapping surfaces from either direction — I consider it mid-reasoning, or the user proposes it — check it against existing names for consistency and either ask the user or report an honest assessment before it is adopted; see P-012 in the principle register.
- Glossary entries explain Terms, not reference policies. The current example-qualified Term name is `SubjectDomain (WMS AI)`; use it when referring to that example. This supersedes the earlier `SubjectDomain (WMS)` reference preference without rewriting historical WMS context. See P-012.
- For concepts we introduce, including process names and Terms, include a named concrete instance from the actual system or meta practice, such as `SubjectDomain (WMS)` or `KnowledgeStatement (commit-attribution)`, to improve reader understanding. Do not equate the concept with its example or invent an instance; state when none is known. Keep this reference policy separate from abstract Glossary definitions; see P-012.
- Prefer Term examples from SubjectDomain (WMS), DevEnv, or our meta practices. Use a clear, genuine fit rather than inventing domain facts; these preferred contexts do not establish separate formal Domains. See P-012.
- For knowledge-transfer modeling, follow [Example-Led Knowledge Modeling](./knowledge/practices/example-led-knowledge-modeling.md): meaning -> concrete Markdown example -> candidate Type -> JSON -> check preserved meaning. Ask for names before adoption and test a contrasting example before choosing the authoritative representation; see P-002.
- Do not initiate commits or commit-approval prompts. Leave changes uncommitted until the user explicitly requests a commit; after that request, verification and subject approval still apply. This supersedes the earlier automatic checkpoint-commit instruction; see P-005.
- Maintain resumable work in the [Workflow TODO List](./knowledge/workflows/workflow-todo-list.md). Before switching, save decisions, open questions, and the next step in the detailed workflow document; update selection/status in the list without duplicating progress. Read the selected checkpoint before resuming.
