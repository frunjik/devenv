# Repository guidance

User-approved reduced ruleset. Items are grouped, not execution-ranked.

## Must - essentials

- Fully satisfy agreed scope; preserve unrelated work, intended behavior and stored formats. Ask before consequential expansion/destruction. Update stale tests for agreed changes, never weaken them to hide regressions.
- Production behavior: focused failing test first, minimal passing implementation, then refactor as needed with tests green.
- Tests must not mutate real files or contact external services. Reads, console logging, test-local memory/DOM and runner reports/caches are allowed; application-data writes are not. Boundary-adapter/mock tests may use spies/fake time.
- Verify exact requested outcomes with relevant tests, type-check/build and affected API producers/consumers; use UI/runtime checks when needed. Report failed/unavailable checks and uncertainty. Expose errors, never disguise failures as success.
- Keep one authoritative source, not independently maintained derived views. Validate external input at appropriate runtime boundaries; reuse validated boundaries. Interfaces are not runtime validation.
- For opted-in tracking/metrics, carry choices through follow-ups; record baseline and completion/follow-up evidence, leaving unknowns unknown. Save decisions, open questions and next step before pausing/switching tracked work.
- Commit only on explicit request and within authorized scope; verify scope and resulting worktree. No Copilot co-author trailer.
- Ruleset changes require approval; do not change rules automatically.
- Keep `@shared`, including dependencies and public exports, valid in browser and server runtimes; keep runtime-specific integrations outside shared.

## Should - applicable defaults

Applicable defaults, not completion gates; briefly justify meaningful deviations.

- For ruleset/versioning work, default to a version pinned to committed content; preserve history and unknown activation dates. Consult the scoped `versioningPolicy` in [practice-set-versions.json](./knowledge/practices/practice-set-versions.json) when applicable.
- Aim for 100% statement/branch/function/line coverage in changed production modules; explain meaningful gaps.
- Test requirements through public behavior with concise fixtures preserving tested distinctions, not live-record copies. Identify boundaries first; reuse simple boundary mocks/injection, avoiding framework internals. Justify internal-unit tests or necessary interception.
- After Green, review duplication/function cohesion; extract real responsibilities/reuse, not forced abstractions. Avoid coverage/testability distortions; justify legitimate refactors or proven unreachable-code cleanup.
- Review missing/refinable Types and evidence-backed complexity when concepts/representations change, using meaning, constraints and genuine examples. Report only meaningful findings/alternatives. Discuss consequential names; keep unapproved names provisional without local-name approval gates.
- Prefer Typed JSON with explicit interfaces and generated Markdown for structured data; retain narrative/native customization Markdown exceptions.
- Interface for grouped records; type for values/choices and named structured-union alternatives. Follow nearby UI conventions; keep feature details local. No automatic correct-code rewrites. Relevant UI details: [local conventions](./agent-practices.md).
- Jest: import used helpers from `@jest/globals` on the first line. Primary concern commits: `SystemConcern-NNN:` plus the specific contribution.
- Ask separately about new-task tracking/metrics when useful unless specified; honor choices without re-asking. After commit requests, seek exact short-subject approval.
- Check maintained guidance when uncertain or consequential; explain consequential departures from credible practice.

## Could - only on request or after agreement

- [Example-Led Knowledge Modeling](./knowledge/practices/example-led-knowledge-modeling.md) and [RICE](./reviews/rice-prioritization.md). RICE requires suitable comparable contexts and evidence-backed estimates; scores do not override constraints or dependencies.
- UI Design Review skill; informational commit-subject suggestions, never commit initiation.

## Excluded from active guidance

Only ranked non-Won't [ledger](./knowledge/practices/ruleset-review.json) items are selected. All unranked/Won't items are excluded as standalone practices or customizations; already-folded safeguards remain in selected rules. [Originals/history](./knowledge/practices/archives/reference-snapshot-c35d399.zip) are outside discovery, never mandatory indirect reading. Ledger/archive and historical-example links are unavailable in curated clones. Historical examples do not activate excluded procedures.

## Repository quick reference

Informational context, not additional practices.

- Angular client: `projects/client`; shared contracts: `projects/shared` (`@shared`); Express API: `projects/server`.
- Tests: `npm run test:client`, `npm run test:server`, or `npm run test:all`; coverage scripts also exist. Use the smallest relevant check.
- Production build: shared first (`npm run build -- --project shared`), then client (`npm run build -- --project client`). Server Angular build is unsupported with known errors.
- Dev: `npm run dev:client` / `npm run dev:server`; client consumes shared source. Windows: `npm.cmd`/`npx.cmd` if wrappers are blocked. Setup: [README](./README.md).
