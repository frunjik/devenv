# System Type Review

## Scope

Reviewed the shared client/server contracts and representative server and client usage. The README states that DevEnv helps define and achieve Goals, but does not define measurable acceptance criteria for those Goals. This review assesses type clarity and consistency; it cannot determine whether the type set completely expresses how the system achieves its goals.

## Findings

### Git status permits invalid or contradictory values

In [`projects/shared/src/lib/types.ts`](../projects/shared/src/lib/types.ts), `GitStatusFile.indexStatus` and `workTreeStatus` accept any string, while `staged`, `unstaged`, `untracked`, and `conflicted` encode facts derived from these status codes. The parser in [`projects/server/src/lib/handlers/git-status.ts`](../projects/server/src/lib/handlers/git-status.ts) derives these flags, but the type permits unsupported status codes and contradictory combinations.

Consider narrowing the status-code types and making derived state explicit or computed.

### Test-run types do not encode state invariants

[`TestRunCacheStatus`](../projects/shared/src/lib/types.ts) combines `available`, a status string, timestamps, and an exit code that can contradict one another. For example, it permits `available: false` with `status: 'passed'`. [`LastTestRun`](../projects/shared/src/lib/types.ts) permits combinations such as a non-null exit code and an error without defining their relationship.

Consider modeling the valid states as a discriminated union so impossible combinations cannot be constructed.

### Runtime data is trusted after type assertions

The shared response types describe expected shapes but do not validate data at runtime. For example, [`test-runner.ts`](../projects/server/src/lib/handlers/test-runner.ts) parses cached JSON and asserts it is `LastTestRun`; the generic HTTP helper in [`backend.service.ts`](../projects/client/src/app/backend.service.ts) similarly assumes responses match their requested type. Malformed cache contents or unexpected responses can therefore be treated as valid.

Validate external and persisted data at the boundary before treating it as a domain value.

### Current-entry formats are implicit

[`CurrentEntryService`](../projects/client/src/app/current-entry.service.ts) accepts a string that may contain either JSON with a description or legacy text. These alternatives are inferred at runtime rather than represented as a named type.

Consider naming the supported formats with a union and making the compatibility behavior explicit.

## Strengths

- Shared client/server contracts are centralized in `projects/shared/src/lib/types.ts`.
- `TestCommandEvent` is a discriminated union with clear event variants.
- Nullable and optional fields are used where absence is expected.

## Recommendations

1. **Document the system goals and boundary.** State the outcomes the client/server system is intended to achieve and how success is observed. Use these goals to decide which concepts belong in the domain model and to assess whether the current contracts are complete.
2. **Validate persisted and external data at its boundaries.** Parse cached test-run JSON and API responses before treating them as typed values. Prefer small, explicit parsers or type guards that report malformed data over unchecked assertions. This protects the existing contracts without requiring an immediate API redesign.
3. **Make test-run states mutually exclusive.** Replace the loosely related cache-status fields with a discriminated union for empty, passed, failed, and error outcomes. Define whether an error can include an exit code, and model `LastTestRun` consistently. Preserve the current JSON shape initially if compatibility with existing client code or cache files is required; otherwise migrate the server, client, and tests together.
4. **Constrain Git status codes and verify derived flags.** Introduce a finite type for the porcelain status characters supported by the parser. Keep the current booleans in the wire contract for compatibility, but test that they are always derived consistently from the status characters. Consider computing them from status codes in a later API revision rather than storing both representations.
5. **Name and isolate current-entry parsing.** Define explicit parsed variants for the structured feature record and legacy text, with a single parser at the client boundary. Keep the raw API string unchanged until producers and consumers can migrate together; add tests for valid structured entries, legacy entries, and malformed JSON.

## Types Needed to Express Goal-Oriented Testing

These are conceptual Types for describing the testing domain identified in this review, not proposed runtime application DTOs.

```text
Evidence {
    id
    source: TestResult | Artifact | SystemObservation
    observation
}

Contract {
    producer
    consumer
    preconditions
    input
    postconditions
    failureBehavior
}

TestCase {
    verifies: AcceptanceCriterion | Contract | TypeInvariant
    setup
    stimulus
    expectedObservation
}

TestResult {
    testCase
    observedOutcome
    passed
}

CoverageScope {
    includedSourceFiles
    excludedSourceFiles
}

CoverageMeasurement {
    metric: statement | branch | function | line
    coveredUnits
    totalUnits
    threshold
}

CoverageReport {
    scope: CoverageScope
    measurements: CoverageMeasurement[]
}
```

## Types Needed to Express and Track Work Toward Goals

These are conceptual Types for describing goal-oriented work, not proposed runtime application DTOs. IDs are stable references so goals, criteria, and work can be updated independently.

```text
Identifier = string
GoalId = Identifier
AcceptanceCriterionId = Identifier
WorkItemId = Identifier
BlockerId = Identifier
DeliverableId = Identifier
ArtifactId = Identifier

WorkStatus = ready | inProgress | blocked | completed | cancelled

CriterionAssessment = unverified | satisfied | notSatisfied

Goal {
    id
    desiredOutcome
    acceptanceCriteria: AcceptanceCriterionId[]
}

AcceptanceCriterion {
    id
    goalId
    observableCondition
    assessment: CriterionAssessment
    evidence: Evidence[]
}

WorkItem {
    id
    title
    description
    contributesTo: (GoalId | AcceptanceCriterionId)[]
    status: WorkStatus
    dependencies: Dependency[]
    blockers: BlockerId[]
    deliverables: DeliverableId[]
}

Dependency {
    prerequisiteId: WorkItemId
    condition
}

Blocker {
    id
    workItemId
    description
    resolved: boolean
}

Deliverable {
    id
    workItemId
    description
    artifactId: ArtifactId
}

WorkProgress {
    goalId
    countsByStatus: Map<WorkStatus, number>
    readyWorkItemIds: WorkItemId[]
    blockedWorkItemIds: WorkItemId[]
}

GoalAssessment {
    goalId
    achieved: boolean
    unsatisfiedCriterionIds: AcceptanceCriterionId[]
}
```

### Relationships and rules for goal progress

- Every WorkItem should contribute to at least one Goal or AcceptanceCriterion; otherwise its purpose in the goal-oriented work model is unclear.
- Each Dependency on a WorkItem identifies a prerequisite WorkItem and the condition that must be met. Dependency cycles are invalid because they leave no valid next item to progress.
- A WorkItem may be marked `ready` only if it has no unresolved blockers and all prerequisites are completed. A blocked item is not equivalent to a ready item and must not count as completed.
- Completing a WorkItem records its Deliverables, but does not automatically satisfy an AcceptanceCriterion. The criterion assessment changes only when its observable condition is supported by Evidence.
- WorkProgress reports work state and actionable next/blocked items; it is not a percentage of Goal achievement. Avoid deriving Goal completion from a ratio of completed tasks: WorkItems can differ in importance, and completed tasks may not prove the outcome.
- CriterionAssessment is derived from the criterion's Evidence, not independently set to `satisfied`. GoalAssessment is derived from its linked criteria: the Goal is achieved only when every linked criterion is satisfied and supported by appropriate Evidence. Keep this assessment distinct from WorkProgress.
- WorkItem lifecycle transitions should be constrained: `ready` may become `inProgress` or `cancelled`; `inProgress` may become `blocked`, `completed`, or `cancelled`; `blocked` may return to `ready` or `inProgress` when blockers are resolved. Completed and cancelled items are terminal unless the system explicitly supports reopening.
- Test Cases should verify these invariants: contribution links refer to existing Goals or criteria; dependencies refer to existing WorkItems and are acyclic; blocked items identify unresolved Blockers; readiness respects dependencies; completion records Deliverables without falsely satisfying criteria; and GoalAssessment requires evidence for every linked criterion.

## Contracts Needed

- **Goal achievement Contract:** A Goal is considered achieved only when evidence demonstrates that every one of its Acceptance Criteria holds. A test passing is evidence only for the behavior it actually observes.
- **System boundary Contract:** For each client/server interaction, specify the producer, consumer, input, preconditions, successful postconditions, and failure behavior. Test the interaction at that boundary rather than relying only on internal implementation tests.
- **Test Case Contract:** A Test Case names the Acceptance Criterion, Contract, or Type Invariant it evaluates, the stimulus, and the expected observable result. Its result records the actual observation so a pass/fail decision is traceable.
- **Coverage reporting Contract:** Every CoverageReport declares its CoverageScope and reports statement, branch, function, and line measurements against their thresholds. A 100% result applies only to the included source files and measured code units; excluded or uncollected files must not be implied as covered.
- **Work contribution Contract:** Every active WorkItem has an explicit contribution to a Goal or AcceptanceCriterion and reports its current WorkStatus.
- **Dependency Contract:** A WorkItem is not ready to proceed while any required prerequisite remains unresolved; dependency cycles are rejected.
- **Blocker Contract:** A blocked WorkItem records at least one current Blocker and cannot be reported as completed until the blocker is resolved and the work's completion condition is met.
- **Progress Contract:** WorkProgress summarizes WorkItem states and identifies ready and blocked work. It must not be presented as Goal achievement or criterion satisfaction.
- **Completion and evidence Contract:** Completing a WorkItem records its Deliverables. An AcceptanceCriterion is satisfied only when its observable condition is met and supported by Evidence; task completion alone is insufficient.
- **Goal assessment Contract:** GoalAssessment is derived from linked AcceptanceCriteria and evidence, not from WorkItem status counts.

## Overall Assessment

The contracts are a useful baseline, but the Git-status and test-run types could better encode valid states. The README states the system's purpose, but measurable Acceptance Criteria are not yet documented, so the completeness of the type set against Goal achievement cannot be assessed.
