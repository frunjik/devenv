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
Goal {
    desiredOutcome
    acceptanceCriteria: AcceptanceCriterion[]
}

AcceptanceCriterion {
    observableCondition
}

Evidence {
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

## Contracts Needed

- **Goal achievement Contract:** A Goal is considered achieved only when evidence demonstrates that every one of its Acceptance Criteria holds. A test passing is evidence only for the behavior it actually observes.
- **System boundary Contract:** For each client/server interaction, specify the producer, consumer, input, preconditions, successful postconditions, and failure behavior. Test the interaction at that boundary rather than relying only on internal implementation tests.
- **Test Case Contract:** A Test Case names the Acceptance Criterion, Contract, or Type Invariant it evaluates, the stimulus, and the expected observable result. Its result records the actual observation so a pass/fail decision is traceable.
- **Coverage reporting Contract:** Every CoverageReport declares its CoverageScope and reports statement, branch, function, and line measurements against their thresholds. A 100% result applies only to the included source files and measured code units; excluded or uncollected files must not be implied as covered.

## Overall Assessment

The contracts are a useful baseline, but the Git-status and test-run types could better encode valid states. The README states the system's purpose, but measurable Acceptance Criteria are not yet documented, so the completeness of the type set against Goal achievement cannot be assessed.
