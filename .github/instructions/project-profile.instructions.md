---
applyTo: "**"
description: "DevEnv project profile: project-specific rules, paths and commands for the generic Agent Essentials and Agent Phase Guide."
---
# DevEnv project profile

Project-specific rules for the generic [Agent Essentials](../../AGENTS.md) and [Agent Phase Guide](../agents/agent-phase-guide.agent.md). These rules apply together with the generic ones; ruleset changes here also require approval.

## Safeguards

- Keep `@shared`, including dependencies and public exports, valid in browser and server runtimes; keep runtime-specific integrations outside shared.
- When a production source file exceeds 400 lines during a change, extract functions or classes at cohesive functional boundaries. Preserve behavior and verify the extraction with relevant tests; do not split arbitrarily just to meet the line limit. This rule does not apply to test files or generated files.

## Applicable defaults

Not completion gates; briefly justify meaningful deviations.

- **UI layout:** lay out new client views with the global grid in `projects/client/src/styles.scss`:
  - Use `.layout-page` for page padding.
  - Use `--layout-columns`, `--layout-gutter` and `--layout-space-*` for columns, gutters and spacing instead of local offsets.
  - Keep the single-column layout on narrow screens.
- **Jest:** import used Jest helpers from `@jest/globals` on the first line of created or modified Jest test files.

## WorkTask registry

- WorkTask registry: `knowledge/workflows/work-plans.json`.
- Evaluation ledger: `knowledge/workflows/devenv-value-evaluation.json`.
- Edit the JSON and regenerate with `npm run generate:work-plans:markdown`; generation rejects started tasks without a decision and unknown evaluation links.

## Commit subjects

- For primary SystemConcern work, use the current `SystemConcern-NNN:` contribution default unless separately changed.

## Repository quick reference

Informational.

- Angular client: `projects/client`; shared contracts: `projects/shared` (`@shared`); Express API: `projects/server`.
- Use the smallest relevant checks: `npm run test:client`, `npm run test:server` or `npm run test:all`; coverage scripts also exist.
- Production build: shared first (`npm run build -- --project shared`), then client (`npm run build -- --project client`). Server Angular build is unsupported with known errors.
- Dev: `npm run dev:client` / `npm run dev:server`; client consumes shared source. Windows: use `npm.cmd`/`npx.cmd` if wrappers are blocked.
