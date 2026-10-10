# Agent Essentials

Use the phase skills below when applicable. They guide behavior; these references do not enforce runtime invocation.

- [Understand](.agents/skills/understand/SKILL.md)
- [Explore](.agents/skills/explore/SKILL.md)
- [Make](.agents/skills/make/SKILL.md)
- [Evaluate](.agents/skills/evaluate/SKILL.md)
- [Agent Phase Guide](.github/agents/agent-phase-guide.agent.md)

## 1. Verify the requested outcome

Before making changes, establish the requested outcome and observable success conditions. Clarify material ambiguity rather than guessing.

Verify those conditions directly. Passing tests, coverage or builds are not substitutes for checking the actual requirement. Use runtime/UI checks when needed, including relevant viewport sizes and interactions.

Report evidence, failures, unavailable checks and unknowns. Do not claim completion when the requested outcome remains unverified.

## 2. Follow an explicit work loop and TDD

1. **Understand:** establish intent, constraints and success conditions.
2. **Explore:** inspect relevant code, tests and callers; identify external boundaries and reuse existing contracts and mocks before writing tests. Choose an approach and resolve required approvals.
3. **Make:** for production behavior, follow the explicit [Red -> Green -> Refactor procedure and testing requirements](.agents/skills/tdd/SKILL.md). Observe Red before production changes, implement only enough for Green, then refactor with tests green. Report the applicable phase. Do not claim TDD for documentation or design alone.
4. **Evaluate:** compare the result with success conditions. Review practice compliance separately from test, coverage and build results. Record opted-in metrics and unknowns; decide the next step. Repeat as needed.

Checks during Make are not deferred until Evaluate. Scale the loop to the task; separate agents and four formal handoffs are not required.

## 3. Find and reuse boundary mocks before tests

Before writing or changing tests, follow the [boundary dependency check](.agents/skills/tdd/SKILL.md#before-writing-tests). Reuse existing contracts and plain mocks/fakes before introducing new ones.

Follow the [public-behavior and mocking requirements](.agents/skills/tdd/SKILL.md#public-behavior-and-mocking), including the permissions for boundary-adapter tests and the explanation required for necessary interception.

## 4. Fully cover changed production modules

Follow the [coverage requirements](.agents/skills/tdd/SKILL.md#coverage): 100% statement, branch, function and line coverage for each changed production module, through public behavior.

Do not expand coverage scope to unchanged dependencies or distort production code to raise coverage. Report uncovered code and blockers honestly. Full coverage does not replace requested-outcome verification.

## Repository safeguards

Retained repository safeguards for the isolated trial, separate from the four selected Agent Essentials practices and the exploration intents. These apply whether or not the coordinator is selected.

- Fully satisfy agreed scope; preserve unrelated work, intended behavior and stored formats. Ask before consequential expansion/destruction. Update stale tests for agreed changes; never weaken them to hide regressions.
- Keep one authoritative source, not independently maintained derived views. Prefer typed JSON with explicit interfaces and generated Markdown for structured data; retain narrative/native customization Markdown exceptions. Validate external input at appropriate runtime boundaries and reuse validated boundaries; interfaces are not runtime validation.
- Keep `@shared`, including dependencies and public exports, valid in browser and server runtimes; keep runtime-specific integrations outside shared.
- Ruleset changes require approval; do not change rules automatically. Preserve history and unknown activation dates; pin ruleset versions to committed content.
- For opted-in tracking/metrics, carry choices through follow-ups; record baseline and completion/follow-up evidence, leaving unknowns unknown. Save decisions, open questions and next step before pausing or switching tracked work.
- Commit only on explicit request and within authorized scope. Obtain approval of the exact short contribution-specific subject before committing; verify the resulting commit and worktree. No Copilot co-author trailer. Commit approval does not authorize push, merge, branch deletion or history rewriting.
- UI design review remains opt-in: use only on explicit request or agreement. Historical/customization archives are not active guidance.

Repository quick reference (informational):

- Angular client: `projects/client`; shared contracts: `projects/shared` (`@shared`); Express API: `projects/server`.
- Use the smallest relevant checks: `npm run test:client`, `npm run test:server` or `npm run test:all`; coverage scripts also exist.
- Production build: shared first (`npm run build -- --project shared`), then client (`npm run build -- --project client`). Server Angular build is unsupported with known errors.
- Dev: `npm run dev:client` / `npm run dev:server`; client consumes shared source. Windows: use `npm.cmd`/`npx.cmd` if wrappers are blocked.

## Intents to explore

The following preserve desired outcomes, not selected rules or the current implementation. Names, mechanisms and adoption remain open.

### 5. Trace work to its evaluations

Retain understandable links between work and its evaluations even when names change or one effort has several evaluations. Explore stable identity and history access without assuming the existing workflow/TODO/evaluation structure must transfer.

### 6. Capture baseline and completion evidence with little upkeep

Make observed changes, decisions and unknowns available across follow-ups. Explore a lightweight mechanism that reliably records opted-in evidence without repeated prompting or retrospective repair. Effort and user benefits must remain unknown when unmeasured.

### 7. Trial changes in isolation before broad adoption

Explore small, reversible trials with explicit success conditions and evaluation before wider adoption. Determine when isolation is worthwhile and how to measure benefit and overhead; do not require a separate preview or trial for every change.
