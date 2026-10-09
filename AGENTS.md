# Agent guidance

## Required work checkpoints

Use this checklist in order. Before acting, read the [detailed repository practices](./agent-practices.md) and the applicable [system task principles](./.agents/system-task-principles.md). They remain binding; this summary does not waive requirements, exceptions or approval gates.

1. **Start or resume:** Read the saved workflow checkpoint and state the outcome and acceptance condition. Before a new substantive task, ask separately whether to track resumable work and whether to keep WorkEvaluation metrics; wait for both choices. Explain ineligibility where applicable. Do not infer consent from scope approval or repeat the questions for a same-task follow-up (P-026). Record the agreed choices.
2. **Implement:** Check established practice, scope and external boundaries before editing. Reuse contracts and mocks. Apply the relevant TDD/phase, Type/naming, test-I/O and duplication checks. Surface conflicts before acting; do not silently skip a required check because a change is small or presentation-only.
3. **Verify:** Test the requested outcome, not a proxy. Run the smallest relevant tests, required all-four coverage and TypeScript-aware checks. Review practice compliance separately from test results. Report failures, unavailable checks and unknowns honestly.
4. **Pause or finish:** Save evidence, decisions and the next step in the opted-in workflow; maintain the global list as required. Clear owned phase state. Consider a concrete meta lesson. At each three-minute active-work gate, pause and ask before continuing.
5. **Report:** Include the required global workflow/status and available evaluation-metrics summary (P-021/P-023), plus the task's tracking and metrics choices and validation limitations. End with a blank line, a `Status:` line, and an informational `Suggested commit subject:` line when relevant (P-005). A suggested subject is not a commit request.
6. **Commit only on request:** Read P-005/P-011, verify scope and current naming/attribution preference, present the subject for approval, then wait. Never initiate a commit or approval prompt without an explicit user request. Omit the Copilot co-author trailer under the current standing waiver.

## Repository essentials

- Angular client: `projects/client`; runtime-neutral shared contracts/validation: `projects/shared`, imported as `@shared`; Express API: `projects/server`.
- Follow nearby patterns. Angular templates/styles are external files. View requests preserve Types, APIs and source data unless separately approved. Reuse palette and layout tokens where roles match.
- Use maintained Jest scripts: `npm run test:client`, `npm run test:server`, or `npm run test:all` for both. Build shared before client: `npm run build -- --project shared`, then `npm run build -- --project client`. The server Angular build target has known unsupported errors. On Windows use `npm.cmd`/`npx.cmd` when PowerShell script policy blocks the wrappers.
- Development: `npm run dev:client` and `npm run dev:server`; client development consumes shared source without a separate shared watch.
- Preserve existing feature-store workflows and structured-source authority. Follow the detailed practices for storage, runtime validation, UI conventions and scope-specific gates.

## Trial

This is a reading-order and repetition-reduction trial, not a policy relaxation. For the next new task, same-task follow-up and requested commit, record whether tracking/metrics prompts and the stable-summary subject were correctly handled. Outcomes are unknown until observed; a fresh chat is needed to assess the new entry point rather than assuming this conversation has reloaded it.
