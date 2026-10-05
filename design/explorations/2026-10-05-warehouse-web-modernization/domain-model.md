# Candidate Terms, Types, and Primitives for WMS Modernization

**Status:** Exploratory model; derived from the supplied scenario, not validated against the WMS.
**Purpose:** Discover required warehouse behavior and trace it toward a web replacement. This is exploratory, not code, architecture, or a web-component catalogue.

## Keep Two Models Distinct

1. **Warehouse Domain model:** operational concepts, rules, and outcomes.
2. **Modernization knowledge model:** evidence and hypotheses about the native system and their relevance to replacement.

Treat native screens as **evidence artifacts** first. They may mix domain, interaction, presentation, and technical concerns; do not assume they map to Domain Types or web primitives.

## Candidate Terms

| Term | Working meaning |
|---|---|
| **Operational Scenario** | Contextual warehouse work, from trigger to outcome, including exceptions. |
| **Role** | Responsibility or perspective; not necessarily a login account. |
| **Domain Concept** | A meaningful warehouse notion, to be discovered from examples. |
| **Business Rule** | A condition governing decisions, operations, or resulting state. |
| **Screen Definition** | A native artifact whose structure and use remain to be established. |
| **Capability** | An outcome the replacement must support, independent of UI. |
| **Replacement Slice** | A bounded set of behavior and outcomes for discovery and replacement. |
| **Parity Claim** | Evidence-backed claim that scoped behavior is preserved. |

Terms are provisional; revise them when examples demand it.

## Working Under Incomplete Knowledge and Hard Constraints

Full workflow discovery and parity may be unaffordable. Instead, select a bounded subset of expectations, identify recurring patterns, and test whether they preserve important outcomes. This is risk-managed approximation, not proof that unexamined behavior is unimportant.

Keep three things separate:

- **Expectation:** needed outcome or safety property, independent of legacy implementation.
- **Behavior pattern:** reusable interaction behavior, including state, decisions, feedback, and recovery.
- **Implementation choice:** an unproven way to realize a pattern under actual constraints.

### Candidate Types for the Constrained Exploration

```text
Expectation {
    statement
    context
    beneficiaryOrRole
    importance
    consequenceIfMissed
    evidence
    uncertainty
}

BehaviorPattern {
    trigger
    preconditions
    informationRequired
    decisionOrRule
    stateRead
    stateChanged
    successFeedback
    rejectionOrConflict
    recovery
    invariants
}

StateNeed {
    subject
    purpose
    authority
    lifetime
    scope
    visibility
    concurrencyExpectation
    recoveryExpectation
}

PatternTrial {
    expectation
    contextAndConstraints
    candidatePattern
    implementationHypothesis
    testExamples
    observedResults
    knownDifferences
    decision
    revisitConditions
}

BehavioralMatch {
    expectation
    comparedContexts
    preservedOutcomes
    preservedInvariants
    acceptableDifferences
    residualRisks
    evidence
    confidence
    status
}
```

Separate interaction state from authoritative warehouse state. Sessions, URLs, and caches may carry context, but must not own business facts.

`BehavioralMatch` compares outcomes and invariants, not screens or mechanisms. Name acceptable differences; unresolved ones are risks, not parity.

### Cross-Cutting Constraints to Make Explicit

Record relevant constraints and unknowns for each selected pattern:

| Constraint | Exploration question |
|---|---|
| **Authority and ownership** | Which system owns each fact? Can replacement read or change it? |
| **Identity and authorization** | Who acts, and where are permissions enforced? Can direct access bypass UI checks? |
| **State lifetime** | What survives navigation, refresh, device changes, logout, or interruption? Is it personal context or shared state? |
| **Consistency and concurrency** | How are stale reads, concurrent changes, and partial completion handled? |
| **Atomicity and idempotency** | What changes together? Can retries duplicate an operation? |
| **Validity and invariants** | What must always hold, regardless of UI or access path? |
| **Failure and recovery** | How are outages, rejection, and uncertain outcomes safely resolved? |
| **Operational limits** | Which latency, throughput, availability, device, connectivity, audit, or regulatory limits apply? |
| **Compatibility and migration** | Must paths coexist or share data? How are conflicts and cutover handled? |

Apply only relevant constraints; mark unknowns.

### Session-Oriented and Direct-Resource Patterns

“Session versus stateless” conflates separate questions: where interaction context and authoritative state live, and how changes are accepted. Stateless requests can update durable state; sessions need not own warehouse truth.

Compare candidate patterns:

1. **Read, decide, commit:** read current state, then submit a change; test stale data and conflicts.
2. **Explicit work context:** pass operator, assignment, or work-area identity instead of relying on hidden session context; test expiry and authorization.
3. **Draft then confirm:** separate incomplete interaction from committed warehouse state; test expiry, resumption, and ownership.
4. **Optimistic update:** accept only if state/version is current; test conflict recovery and retries.
5. **Idempotent command:** assign a stable operation identity so retries do not duplicate work; test outcome lookup and retention.

Test normal, stale/concurrent, repeated, interrupted, unauthorized, and uncertain-result cases. These patterns do not prescribe architecture.

### A Bounded “Brute-Force” Learning Loop

1. Rank expectations by failure impact, frequency, and dependencies; record rationale and confidence.
2. Select contrasting cases across state, decisions, and failure.
3. Separate observed legacy behavior from intended behavior; record constraints before implementation hypotheses.
4. Trial a small end-to-end path with an exception. Mark results supported, rejected, conditional, or unknown.
5. Retain counterexamples; reuse patterns only within tested conditions.

## Candidate Types

```text
OperationalScenario {
    context
    trigger
    participants: Role[]
    intent
    requiredInformation
    steps: ScenarioStep[]
    outcome
    alternativesAndExceptions
}

ScenarioStep {
    actor
    intentOrObservation
    informationUsed
    ruleOrDecision
    acceptedChangeOrRejection
    resultingFact
    feedbackOrNextAction
}

NativeArtifact {
    sourceIdentity
    artifactKind
    observedContent
    observedLinks
    versionOrStatus
    provenance
}

Claim {
    statement
    claimKind: observation | interpretation | hypothesis | decision
    context
    support: Evidence[]
    confidenceOrUncertainty
    status
}

Capability {
    intendedOutcome
    beneficiaryRoles
    relatedScenarios: OperationalScenario[]
    governingRules
    requiredInformation
    evidenceOfNeed
}

ReplacementSlice {
    includedCapabilities: Capability[]
    includedScenarios: OperationalScenario[]
    exclusionsAndRationale
    unresolvedQuestions
    acceptanceEvidence
}

ParityClaim {
    legacyBehavior
    replacementBehavior
    scope
    evidence
    knownDifferences
    status
}
```

These are prompts, not a schema. Screens and scenarios may relate many-to-many; capabilities need not map to one implementation unit.

## Candidate Modeling Primitives

Trace:

1. Actor and context
2. Intent
3. Information
4. Rule and decision
5. State change / fact
6. Feedback and query
7. Exception and recovery
8. Evidence and provenance

Command, event, and view are optional labels; they do not imply event-sourced storage.

## Iterative Discovery and Replacement

First understand the corpus structure. Trace a scenario, bound its outcome and exclusions, then record evidence, differences, and unknowns. Revise as trials expose gaps; findings inform but do not translate automatically to code.

## Candidate Contracts

- Screens are evidence, not requirements by default.
- Link capability claims to evidence; retain uncertainty.
- Do not infer rules from labels or layout alone.
- Define slice scope, outcome, exceptions, and acceptance evidence.
- Scope parity claims; retain differences and unknowns.
- A successful slice does not prove WMS completeness.

## Questions Before Generalizing

- What does a native screen definition represent, and where do rules/state live?
- Which processes, roles, devices, and operating conditions matter most?
- How can slices preserve end-to-end work, and what evidence accepts behavior?
- How should concepts inform implementation without mapping directly to modules?
