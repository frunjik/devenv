# Agent guidance

## Repository overview

This workspace contains an Angular client and libraries, plus an Express API:

- `projects/client`: Angular application.
- `projects/shared`: shared API contracts and Angular services, imported as `@shared`.
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

- Inspect nearby components before editing. Angular components use external `.html` templates via `templateUrl` and external `.scss` styles via `styleUrl`, not inline `template` or `styles` in TypeScript. Existing inline templates/styles are not evidence of the preferred convention; migrate them only within agreed scope.
- Reuse the shared palette variables in `projects/client/src/styles.scss` for matching visual roles instead of duplicating their color literals. Keep feature layouts and intentional color variants local.
- Use the opt-in `.accent-card` class for matching dark card surfaces with an accent border; keep padding, corner radius, and layout in the component stylesheet.
- Material meta toolbars opt into `.meta-toolbar` for their shared background and text colors through Material theme variables; keep layout, sizing, and responsive rules in the component stylesheet.
- Light Problem Ticket cards define dark body and heading text locally rather than inheriting the global dark theme's light text. Ticket-list controls have a minimum 44px width and height; preserve wrapping and narrow-screen fit when adding controls.
- Native text controls can opt into the global `.form-field` label/control layout and `.form-control` appearance. Keep feature spacing local; do not apply these classes indiscriminately to Material controls, radios, or specialized editor controls.
- Prefer shared API contracts in `projects/shared` and import them from `@shared`.
- When changing API behavior, check both its server implementation and related client/shared callers and tests.
- Preserve existing feature-store formats and workflows documented in `README.md`.
- Avoid unrelated edits; run the smallest relevant tests and builds, and report any known or newly encountered failures.

## System task principles

Follow the maintained [system task principles](.agents/system-task-principles.md) for work that designs or implements this system. The register is additive: preserve existing principles when adding new ones, and surface conflicts for resolution rather than silently overriding them.

- For production code, use Red-Green-Refactor as defined in `.agents/test-driven-developer.agent.md`.
- At the defined checkpoints, review the domain and implementation for missing or refinable Types using `.agents/type-reviewer.agent.md`; report justified Type convictions and unresolved candidates to the user.
- Before completing a TypeScript coding task, run an appropriate TypeScript-aware type-check or build for the changed code and resolve type errors; report any check that could not run.
- For in-scope production code, require 100% line, statement, branch, and function coverage using domain-derived tests through public interfaces; allow simple mocks only at boundaries. Do not change production code for testability except after proving code is unreachable and cannot otherwise be covered, as detailed in the principle register.
- At stable checkpoints, verify that tests are green, in-scope production code has 100% coverage on all four metrics, and no Type cleanup or refactoring remains. Leave changes uncommitted unless the user explicitly requests a commit; then present the drafted commit message (short, subject-only by default) for approval before running the commit. Pause for any requested user review; see P-005 in the principle register.
- Do not change or remove surrounding code without user permission. If a specific, non-generic surrounding-code constraint blocks a sound solution, explain why a narrow change is needed and its likely impact, then ask first; see P-006 in the principle register.
- In every test file created or modified for this system, import each used Jest helper from `@jest/globals` on the first line; do not rely on ambient Jest globals. See P-007 in the principle register.
- Tests must not mutate the real filesystem, directly or through application/subprocess behavior; use simple Boundary Mocks. Reads are allowed, as are test-runner coverage reports and caches. Existing write-based suites are tracked for migration in SC-053; see P-014.
- If work takes more than three minutes, pause at the next stable point and ask before continuing. Wait for explicit permission; if granted, record any new user-provided rule in this guidance and the principle register before resuming. Repeat this gate for each further period of ongoing work; see P-008 in the principle register.
- When reviewing note or Problem descriptions, assess whether their concepts or wording warrant a Glossary entry, a new or refined Type, or another general system concern. Do not silently treat candidates as agreed domain meaning; see P-009 in the principle register.
- After working for a while, at the same stable points as the three-minute gate, consider whether there is knowledge worth noting at the meta level (for example improving the SC-NN numbering, or noticing the same thing being done repeatedly in different shapes). If so, add a note under "Meta Notes" in `design/problem-inquiry-system/concerns.md`. After roughly every 10 implemented feature slices, also step up to a meta-meta evaluation of whether the whole system of principles and conventions is still serving this project's purpose as a learning sandbox; see P-010 in the principle register.
- When a commit's subject is one or more System Concerns, use `SystemConcern-NNN:` as the prefix (for example `SystemConcern-044:`), followed by a short phrase describing this specific commit's contribution, not a restatement of the concern's stable Title. `SC-NNN` remains the register identifier, not the current commit-subject prefix; see P-011.
- Before drafting any commit message for approval, read P-005 and P-011 in the principle register and check the current naming preference, scope-specific subject, and attribution preference. Omit the Copilot `Co-authored-by` trailer until the user says otherwise. User approval follows this check; it does not replace it. Do not add automated enforcement for this preference without a separate user decision.
- When a candidate name for a Type, Term, or mapping surfaces from either direction — I consider it mid-reasoning, or the user proposes it — check it against existing names for consistency and either ask the user or report an honest assessment before it is adopted; see P-012 in the principle register.
- Glossary entries explain Terms, not reference policies. The current example-qualified Term name is `SubjectDomain (WMS AI)`; use it when referring to that example. This supersedes the earlier `SubjectDomain (WMS)` reference preference without rewriting historical WMS context. See P-012.
- For concepts we introduce, including process names and Terms, include a named concrete instance from the actual system or meta practice, such as `SubjectDomain (WMS)` or `KnowledgeStatement (commit-attribution)`, to improve reader understanding. Do not equate the concept with its example or invent an instance; state when none is known. Keep this reference policy separate from abstract Glossary definitions; see P-012.
- Prefer Term examples from SubjectDomain (WMS), DevEnv, or our meta practices. Use a clear, genuine fit rather than inventing domain facts; these preferred contexts do not establish separate formal Domains. See P-012.
- For knowledge-transfer modeling, follow [Example-Led Knowledge Modeling](design/example-led-knowledge-modeling.md): meaning -> concrete Markdown example -> candidate Type -> JSON -> check preserved meaning. Ask for names before adoption and test a contrasting example before choosing the authoritative representation; see P-002.
- Do not initiate commits or commit-approval prompts. Leave changes uncommitted until the user explicitly requests a commit; after that request, verification and subject approval still apply. This supersedes the earlier automatic checkpoint-commit instruction; see P-005.
- Maintain resumable work in the [Workflow TODO List](design/workflow-todo-list.md). Before switching, save decisions, open questions, and the next step in the detailed workflow document; update selection/status in the list without duplicating progress. Read the selected checkpoint before resuming.
