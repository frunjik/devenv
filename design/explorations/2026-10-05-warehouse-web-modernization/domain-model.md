# Candidate Terms, Types, and Primitives for WMS Modernization

**Status:** Exploratory model; derived from the supplied scenario, not validated against the WMS.
**Purpose:** Support iterative discovery of required warehouse behavior and trace it into a future web replacement. This is a conceptual model, not code, a target architecture, or a fixed web-component catalogue.

## Keep Two Models Distinct

1. **Warehouse Domain model:** what people, goods, locations, inventory, tasks, rules, and outcomes mean in warehouse operations.
2. **Modernization knowledge model:** what is known or hypothesized about the native system, where that knowledge came from, and how it informs the replacement.

Native screens belong initially to the second model as **evidence artifacts**. A screen may express domain concepts, operational rules, interaction, presentation, technical behavior, or a mixture. Do not classify it prematurely as a Domain Type or web primitive.

## Candidate Terms

| Term | Working meaning |
|---|---|
| **Operational Scenario** | A contextual example of warehouse work, from a trigger through decisions and outcome, including relevant exceptions. |
| **Role** | A responsibility or perspective from which a person or external actor performs or observes work; not necessarily identical to a login account. |
| **Domain Concept** | A meaningful warehouse notion, such as an item, location, inventory balance, handling unit, order, or task; actual concepts must be discovered. |
| **Business Rule** | A condition governing a warehouse decision, allowed operation, or resulting state. |
| **Screen Definition** | A native-system artifact describing some screen-related information; its structure, semantics, and use are not yet established. |
| **Capability** | An outcome or responsibility the replacement must support, independent of a particular screen or control. |
| **Replacement Slice** | A bounded set of related behavior and outcomes considered together for discovery and eventual replacement; the slicing principle remains open. |
| **Parity Claim** | A claim that a specified operational outcome or behavior is preserved in the replacement, supported by evidence and an explicit scope. |

These are working Terms. Names and boundaries should change when real examples expose better distinctions.

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

The shapes are prompts for inquiry, not a schema proposal. A screen may participate in many scenarios; a scenario may involve many screens. A capability may be supported by multiple scenarios and need not map to one screen, service, or component.

## Candidate Modeling Primitives

Use these as conceptual building blocks when tracing a scenario:

1. **Actor and context** — who is doing or observing work, where, and under what conditions?
2. **Intent** — what are they trying to accomplish or change?
3. **Information** — what must be known, entered, selected, or made visible?
4. **Rule and decision** — what determines allowed, rejected, or conditional outcomes?
5. **State change / fact** — what changes, or what becomes true, if the action succeeds?
6. **Feedback and query** — what does the actor need to know afterward?
7. **Exception and recovery** — what can fail or differ, and how does work continue safely?
8. **Evidence and provenance** — what supports each claim, and where did that evidence come from?

Command, event, and view are possible labels for intent, accepted fact, and presented information. They are optional modeling vocabulary, not mandatory Domain primitives or a decision to use event-sourced storage.

## Iterative Discovery and Replacement

Repeat this learning loop; do not attempt to classify all 400+ screen definitions before learning what their structure means:

1. **Orient:** learn how screen definitions are authored, grouped, linked, versioned, and used. Record unknowns; do not infer corpus completeness from its size.
2. **Choose a scenario:** select one operationally meaningful example with access to knowledgeable roles and relevant native artifacts.
3. **Trace the work:** record context, actor, intent, information, rules, decisions, changes, feedback, exceptions, and recovery.
4. **Correlate evidence:** connect relevant screens, configuration, data, reports, logs, code, and participant observations to specific claims. Mark contradictions and uncertain domain/system boundaries.
5. **Abstract carefully:** identify candidate Domain Concepts and Capabilities; keep links to the concrete scenario and native evidence. Separate “must preserve,” “may improve,” “obsolete,” and “unknown.”
6. **Bound a replacement slice:** choose a coherent outcome and its necessary behavior, not merely a screen or GUI primitive. State exclusions and evidence needed to judge the result.
7. **Assess and revise:** compare the proposed replacement behavior with the operational need. Record parity, intentional differences, gaps, and new questions; update the model and select the next inquiry.

Paper artifacts can support early steps. Later, agreed outcomes and rules can inform software, tests, and implementation decisions. Traceability should survive that transition, but no artifact is assumed to translate directly or automatically into code.

## Candidate Contracts

- A native screen definition is evidence, not automatically a requirement or Domain concept.
- Every important capability claim links to at least one scenario or other stated evidence; uncertainty and provenance remain visible.
- Domain rules are not inferred solely from labels, widget types, or screen layout.
- A replacement slice states scope, exclusions, operational outcome, exceptional behavior, and how evidence will assess it.
- “Parity” always names what behavior and context are compared; it does not mean visual or internal-mechanism identity by default.
- Unknown or contradictory evidence remains explicit until resolved; iteration may revise previous classifications and decisions.
- A slice's successful implementation does not alone prove that the overall WMS replacement is complete.

## Questions Before Generalizing

- What is the native definition structure, and does “screen” refer to a user-visible page, a reusable form, a workflow state, or something else?
- Which warehouse processes are most critical, frequent, risky, or poorly understood?
- Where do business rules and state changes actually live?
- Which role, device, location, throughput, concurrency, and connectivity conditions matter?
- How will slice boundaries avoid breaking end-to-end warehouse flows?
- What evidence and stakeholders are sufficient to accept preserved behavior or an intentional change?
- How should learned concepts map to implementation responsibilities later, without equating Domain Concepts with UI or server modules?
