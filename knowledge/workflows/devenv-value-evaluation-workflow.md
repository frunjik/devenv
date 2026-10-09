# DevEnv Value Evaluation

## Purpose

Test whether DevEnv's practices, tools, and workflows help teams clarify goals, choose valuable work, achieve intended outcomes efficiently, and learn from evidence. DevEnv must use its own process to evaluate this claim.

## Checkpoint

**Status:** Active — measurement-feasibility pilot.

**Scope:** First dogfood the existing coding workflow. This can test whether we can capture useful evidence with reasonable effort; it cannot by itself prove value for developers, testers, salespeople, project managers, or teams using different workflows.

**Current process:** TDD links behavior to tests; coverage, type-checks/builds, runtime checks, and workflow checkpoints record implementation and verification evidence. We do not consistently record pre-work success conditions, a comparable baseline, decision/delivery elapsed time, human effort, process overhead, or post-delivery outcomes.

**Next step:** Begin the next planned diagram-editor slice, selection and movement, with a pre-work record before implementation. Continue the existing TDD and verification process; add only the measurement record below. Review measurement feasibility after three consecutive eligible coding slices. Treat this small sample as descriptive, not proof of improved performance.

**Open limits:** Historical slices lack consistent start/end and effort records, so do not invent a retrospective baseline. The first prospective records describe the current DevEnv-supported coding process; they are not a without-DevEnv control group and cannot show causal improvement. Coding-task evidence does not establish product impact after deployment. A later comparison with a credible alternative workflow and evidence from other product roles is required for broader claims.

## Measures

Record a small set of complementary measures. Do not combine them into a single score.

| Measure | Operational definition | Evidence and interpretation |
| --- | --- | --- |
| **Goal and success clarity** | Before work starts, record the intended outcome, affected user/team, problem or uncertainty, and observable success condition. At completion, mark each as clear, partial, or unknown. | Work record and user confirmation. A clarity rate is a leading process signal, not proof of impact. |
| **Decision latency** | Elapsed time from a material question or uncertainty being recorded to a decision and actionable next step. | Record timestamps when they are known; distinguish waiting from active effort. Missing timestamps stay unknown. |
| **Delivery flow and effort** | Elapsed time from agreed success conditions to verified completion; separately record blocked/waiting time and approximate active effort. | Start/end checkpoints and participant estimate. Never infer human effort from chat, tool, or build durations. |
| **Outcome and quality** | Whether the pre-agreed success condition was met, with linked evidence; record follow-up defects, reversals, or rework during a follow-up window agreed before the slice. | Tests/builds establish implementation behavior, not user impact. If user outcome evidence is unavailable, mark it unevaluated. |
| **DevEnv process overhead** | Approximate active effort spent on DevEnv-specific workflow, documentation, measurement, and upkeep. Record friction or duplicated work. | Participant estimate and short note. Consider alongside delivery effort and outcomes; overhead is a cost, not automatically waste. |

For each slice, record:

| Slice / date | Beneficiary and intended outcome | Success condition and baseline | Decision and delivery elapsed time | Active effort / DevEnv overhead | Result and linked evidence | Follow-up / unknowns |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — |

Do not use completed tasks, tool usage, test count, or coverage alone as value measures. They show activity or implementation assurance. Preserve missing data and uncertainty explicitly; collect only role or product information needed for the evaluation.

## Integration with the coding workflow

1. **Before TDD Red:** identify the user/team outcome and observable acceptance condition; record available starting-state/baseline evidence and start date/time. If a baseline is unavailable or any outcome is unclear, record that rather than silently making it up.
2. **During TDD:** keep Red-Green-Refactor unchanged. Existing tests, coverage, type checks, builds, and runtime checks provide implementation evidence. Note significant decision points and blocked time only when observable.
3. **At a stable completion or pause:** record completion time, acceptance result, evidence links, approximate active effort and DevEnv process overhead if participants can estimate them, and unresolved user-outcome evidence.
4. **After the pre-agreed follow-up window:** update defects/rework and user outcome evidence; do not treat immediate test success as sustained value.
5. **After three consecutive eligible slices:** review completeness, collection burden, missing measures, and whether any comparison is credible. Adapt or stop collection if burden exceeds the likely learning.

Existing coding-process affordances make this feasible as a manual pilot, but there is no current baseline instrument, reliable effort tracking, or post-deployment outcome link. No application instrumentation or dashboard is authorized by this pilot.

## Maintenance and visualization

- Keep this workflow's table as the pilot record and link to the relevant work item, tests, and evidence. Do not create a second independent dataset.
- **Temporary format choice:** Keep pilot observations in this Markdown workflow while definitions and fields are exploratory and include narrative uncertainty. Do not treat the table as an established application data contract; reconsider a typed structured source if recurring collection establishes stable fields and consumers.
- Maintain metric definitions, time boundaries, follow-up window, source, sample size, missingness, and any definition changes.
- First visualize results in a compact scorecard: show a baseline only where one is credible and comparable; otherwise mark it unavailable. Include sample size, period, outcome evidence, effort, overhead, and unknowns.
- Show elapsed-time distributions or trends only when repeated observations make them interpretable. Segment by role or work type only with enough comparable observations; do not rank individuals.
- Do not claim causation from this single-team, small-sample dogfood study. To assess product value beyond coding-process feasibility, later include real team workflows, beneficiaries, and a credible comparison.

## Type review

No new formal domain Type is adopted for this pilot. The measures are evaluation criteria and the table is a lightweight working record. Revisit structured metric Types only if repeated collection demonstrates stable fields, definitions, and consumers.

## Completion criteria

- At least three consecutive eligible coding slices have records, or an explicit reason the pilot could not collect them.
- Report completeness, collection effort, outcomes, and limitations without filling unknowns.
- Decide whether to continue, adapt, or stop measurement and whether a broader team pilot is justified.
