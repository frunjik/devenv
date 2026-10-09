# DevEnv Value Evaluation

## Purpose

Test whether DevEnv's practices, tools, and workflows help teams clarify goals, choose valuable work, achieve intended outcomes efficiently, and learn from evidence. DevEnv must use its own process to evaluate this claim.

## Checkpoint

**Status:** Paused — measurement-feasibility pilot.

**Scope:** First dogfood the existing coding workflow. This can test whether we can capture useful evidence with reasonable effort; it cannot by itself prove value for developers, testers, salespeople, project managers, or teams using different workflows.

**Current process:** TDD links behavior to tests; coverage, type-checks/builds, runtime checks, and workflow checkpoints record implementation and verification evidence. We do not consistently record pre-work success conditions, a comparable baseline, decision/delivery elapsed time, human effort, process overhead, or post-delivery outcomes.

**Next step:** The Principle Register Organization and Priority Review is complete: its approved narrow P-026 cross-reference was added to `AGENTS.md`, with no register or policy changes. Selection and movement are complete and recorded. The streamed test-run extraction from client `BackendService` is complete and committed as `e1c2418`; the evaluation-duration presentation follow-up is implemented and awaits user review. After that review, resume the next planned diagram-editor slice (the connection workflow) with a pre-work record before implementation. Continue the existing TDD and verification process; add only the measurement record below. Review measurement feasibility after three consecutive eligible coding slices. Treat this small sample as descriptive, not proof of improved performance.

**Open limits:** Historical slices lack consistent start/end and effort records, so do not invent a retrospective baseline. The first prospective records describe the current DevEnv-supported coding process; they are not a without-DevEnv control group and cannot show causal improvement. Coding-task evidence does not establish product impact after deployment. A later comparison with a credible alternative workflow and evidence from other product roles is required for broader claims.

## Measures

Record a small set of complementary measures. Do not combine them into a single score. The [value-evaluation JSON](./devenv-value-evaluation.json) is the authoritative source for metric definitions and individual `WorkEvaluation` records. Each evaluation has one measure for every defined metric; use JSON `null` when a value or its evidence is unknown.

The JSON contains a completed example (diagram selection and movement) and a completed meta-work evaluation (this metrics view). These records preserve unknown measures without inventing outcomes. The meta-work record is useful for tracking measurement and upkeep overhead, but is not counted as an eligible regular coding slice in the three-slice feasibility pilot.

The `/workflow-todo` page shows a compact recorded/unknown count for each metric and displays completed evaluation titles with elapsed durations in their associated workflow rows; `/workflow-evaluations` displays metric definitions and full evaluation records read-only. Both views derive elapsed wall-clock duration from `startedAt` and `completedAt`; this is not active effort, which remains separately recorded or unknown. The workflow-row associations are presentation-only and explicitly keyed in the view; unmapped workflows show no associated evaluated item. Missing or unusable timestamps are shown explicitly. Neither view adds application instrumentation or automatic collection. Continue to record measures manually and update the JSON source.

Do not use completed tasks, tool usage, test count, or coverage alone as value measures. They show activity or implementation assurance. Preserve missing data and uncertainty explicitly; collect only role or product information needed for the evaluation.

## Integration with the coding workflow

1. **Before TDD Red:** identify the user/team outcome and observable acceptance condition; record available starting-state/baseline evidence and start date/time. If a baseline is unavailable or any outcome is unclear, record that rather than silently making it up.
2. **During TDD:** keep Red-Green-Refactor unchanged. Existing tests, coverage, type checks, builds, and runtime checks provide implementation evidence. Note significant decision points and blocked time only when observable.
3. **At a stable completion or pause:** record completion time, acceptance result, evidence links, approximate active effort and DevEnv process overhead if participants can estimate them, and unresolved user-outcome evidence.
4. **After the pre-agreed follow-up window:** update defects/rework and user outcome evidence; do not treat immediate test success as sustained value.
5. **After three consecutive eligible slices:** review completeness, collection burden, missing measures, and whether any comparison is credible. Adapt or stop collection if burden exceeds the likely learning.

Existing coding-process affordances make this feasible as a manual pilot, but there is no current baseline instrument, reliable effort tracking, or post-deployment outcome link. No application instrumentation or dashboard is authorized by this pilot.

## Maintenance and visualization

- Keep workflow purpose, process, limitations, and next steps in this Markdown document. Maintain metric definitions and individual work records only in the [value-evaluation JSON](./devenv-value-evaluation.json); do not duplicate them here.
- The JSON has an explicit `schemaVersion` and is checked at runtime against the shared interfaces and validator in [value-evaluation.types.ts](../../projects/shared/src/lib/value-evaluation.types.ts). Update the validator and its tests when intentionally changing the data contract.
- Maintain metric definitions, time boundaries, follow-up window, source, sample size, missingness, and any definition changes.
- First visualize results in a compact scorecard: show a baseline only where one is credible and comparable; otherwise mark it unavailable. Include sample size, period, outcome evidence, effort, overhead, and unknowns.
- Show elapsed-time distributions or trends only when repeated observations make them interpretable. Segment by role or work type only with enough comparable observations; do not rank individuals.
- Do not claim causation from this single-team, small-sample dogfood study. To assess product value beyond coding-process feasibility, later include real team workflows, beneficiaries, and a credible comparison.

## Type review

`WorkEvaluation` is the agreed name for one unit-of-work evaluation, independent of its size. `EvaluationMetric` and `WorkEvaluationDataset` are provisional supporting names pending review. The shared contracts are implementation representations; the JSON validator enforces field sets, references, uniqueness, and complete per-evaluation metric sets at runtime. Revisit whether these concepts need Glossary entries as the evaluation model is reviewed.

## Completion criteria

- At least three consecutive eligible coding slices have records, or an explicit reason the pilot could not collect them.
- Report completeness, collection effort, outcomes, and limitations without filling unknowns.
- Decide whether to continue, adapt, or stop measurement and whether a broader team pilot is justified.

## Proposed follow-up: compare practice profiles

The user proposed comparing the current way of working with a reduced set of practices, while retaining Workflow TODO upkeep and evaluation metrics. This is a proposal for a later meta-work experiment, not approval to disable rules or a change to the current coding workflow.

**Feasibility:** A controlled comparison is plausible, but a literal switch for every rule is not yet established. First inventory where applicable instructions come from and which are under project control; rules may be supplied by more than one layer. Verify in the intended VS Code/Copilot setup that each experimental profile actually changes the instructions the agent receives. Do not claim a rule is disabled merely because a repository file was edited. Security, privacy, platform, organization, and user constraints are outside the experimental set and remain in force.

**Preparation before any trial:**

1. Inventory practices and rules, recording their source and classifying each as fixed constraint, explicitly retained practice, experimental practice, or out of scope. Agree what “metrics rules” means, including whether code-coverage expectations are retained or varied.
2. Define a reproducible full-practice profile and a reduced-practice profile. The reduced profile would retain Workflow TODO maintenance and the agreed metrics collection, while excluding only the practices explicitly selected for comparison.
3. Check that both profiles can be selected and verified in the actual client. If they cannot be separated reliably, do not run the comparison; choose a supported, auditable setup first.
4. Before changing metric records or their shared contract, agree what exposure information must be recorded. The existing evaluation data does not yet identify a practice profile; keep current records and metrics authoritative and unchanged until that decision.

**Trial design:** Use small, low-risk, comparable coding tasks with the same acceptance conditions and tool/model setup. Alternate or randomize profiles across matched tasks where practical; start isolated sessions and record the selected profile and its revision so prior context or a profile change cannot silently contaminate the comparison. Preserve pre-work success conditions, outcome evidence, elapsed time, estimated active effort, process overhead, defects/rework, and unknowns. Compare outcomes and burdens separately rather than collapsing them into one score. Treat a small sample as descriptive; do not infer causation or generalize beyond the tested work.

**Decision gate:** Agree the inventory, profile contents, protected constraints, metrics definition, and pilot design with the user before implementation or any rule is switched off. If the agent cannot reliably verify the active profile, report that limitation and stop rather than presenting an uncontrolled comparison as evidence.

**Version history:** The [practice-set version registry](../practices/practice-set-versions.generated.md) records version 1 as the pre-extraction baseline and version 2 as the TDD/Type Detector skill extraction coordinated by Diligent Coder. Each set snapshot is pinned to its source Git commit. The registry also tracks numbered revisions of each agent and skill by kind and path; an artifact's version 1 is its initial tracked baseline, not necessarily its historical introduction. When changing a practice or customization, commit the content first, then record its version in a follow-up commit pinned to that prior content commit; a commit cannot contain its own Git hash. The active set version and activation/deactivation timestamps are currently unverified; do not infer actual time in use from commit timestamps. Once an activation is verified in the client, record its UTC timestamp and evidence in the authoritative JSON, set `asOf` when measuring an open period, and regenerate the Markdown view with `npm run generate:practice-set-versions:markdown`.

## Upkeep checkpoint: streamed test-run extraction

The user requested extracting `runTests` from the client `BackendService`. The implementation moves the streaming HTTP request and event parser into `TestRunnerService`; test-run cache/status requests remain in `BackendService`, and the new service reads the host from that existing service rather than duplicating host configuration. The runner component now delegates execution to `TestRunnerService`. No shared Types or API behavior changed.

Red was observed after migrating the runner service tests and component mocks: both suites failed because `TestRunnerService` did not yet exist. Green: focused runner-service, backend, and component suites pass (52 tests); the new service has 100% statement, branch, function, and line coverage. The full client suite passes all 566 tests. Both changed services (`BackendService` and `TestRunnerService`) have 100% statement, branch, function, and line coverage under the full suite.

The full client coverage command exits nonzero because overall coverage is below the repository's 100% thresholds (95.99% statements, 92.48% branches, 96% lines, 95.52% functions). The report identifies unchanged shared `workflow-todo.types.ts` as the large uncovered area (3.44% statements); all 41 client suites and 566 tests pass. The client development TypeScript check, client production build, and `git diff --check` pass. No new domain Type was warranted: the stream parser and test-run request are a cohesive service responsibility; test cache/status retrieval remains separate in `BackendService`.

**Next:** The service extraction was reviewed and committed as `e1c2418`. After review of the inline workflow-row duration presentation, resume the planned diagram connection slice with a prospective evaluation record; historical effort for this detour remains unknown.
