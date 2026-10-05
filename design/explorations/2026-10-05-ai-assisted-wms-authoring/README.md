# Spike Blueprint: AI-Assisted WMS Authoring

**Status:** Planned, not conducted · **Mode:** Conceptual; no AI trial or code performed

## Question

Can an AI system help WMS builders produce a reliable web replacement while preserving human judgment, traceability, and knowledge needed after the experienced operator retires?

## Context and Problem Framing

The Domain is the people writing the web replacement for a mature native WMS. The System under exploration is an AI-assisted way of doing that work. One experienced operator—described as a grandfather approaching retirement in about two years—holds or can help uncover valuable knowledge. The team has limited time and cannot fully reconstruct every legacy workflow before building.

The problem is not simply generating code faster. Builders need to turn incomplete evidence and operational expectations into target behavior, implementation, and tests. AI output may be plausible but wrong, untraceable, hard to verify, or dependent on context that disappears when a session ends or the expert leaves.

The retirement timeline is a continuity constraint, not a reason to treat one person as the sole source of truth. Identify other sources, disagreements, and knowledge gaps.

## Working Hypothesis

AI is useful when it helps builders examine evidence, make explicit proposals, and produce reviewable implementation or tests—while people retain decisions and verification. Its value depends on durable context, provenance, and a workflow that exposes uncertainty rather than concealing it.

## Candidate Terms

| Term | Working meaning |
|---|---|
| **Builder** | Person responsible for understanding, changing, or validating the target system. |
| **Legacy Evidence** | Screen definition, code, data, observation, report, or explanation used to understand current behavior. |
| **Expectation** | Intended outcome or constraint for the target, with context and evidence. |
| **Work Slice** | Bounded target behavior considered for design, implementation, and validation. |
| **AI Proposal** | AI-produced interpretation, design, code, test, or question; not accepted truth. |
| **Verification** | Human or automated check of a proposal against expectations and evidence. |
| **Decision** | Recorded acceptance, revision, or rejection, with rationale and accountable owner. |
| **Knowledge Gap** | Important uncertainty, contradiction, or reliance on knowledge not yet captured. |
| **Continuity Record** | Durable, linked context that lets others resume work without relying on a disappearing conversation or person. |

Terms are provisional and should be tested on real work.

## Candidate Types

```text
WorkSlice {
    intendedOutcome
    context
    inScope
    exclusions
    acceptanceEvidence
    openQuestions
}

EvidenceItem {
    source
    observedContent
    relatedExpectation
    provenance
    confidence
    contradictions
}

AIProposal {
    proposalKind: interpretation | design | code | test | question
    content
    basedOn: EvidenceItem[]
    assumptions
    uncertainty
    suggestedChecks
}

Verification {
    proposal
    checks
    results
    uncoveredRisks
    reviewer
}

Decision {
    proposal
    outcome: accept | revise | reject | defer
    rationale
    owner
    linksToTargetChanges
}

ContinuityRecord {
    workSlice
    decisions
    rationale
    unresolvedKnowledgeGaps
    nextSteps
    references
}
```

## Exercise

Use one small, representative WMS behavior—not a whole workflow or an easy toy example.

1. Select a behavior with accessible legacy evidence and an operator who can explain it.
2. Record the expectation, context, evidence, uncertainty, and acceptance checks before asking AI for help.
3. Ask AI to interpret or propose one bounded change and tests. Require it to identify assumptions, evidence used, and questions it cannot answer.
4. Have a builder and the knowledgeable operator independently review the proposal against evidence and operational expectations.
5. Record corrections, missed behavior, verification effort, decision, and what another builder would need to continue.
6. Compare with a similar non-AI-assisted task if practical; avoid claiming speed or quality gains from impressions alone.

Do not enter sensitive production data or grant AI unreviewed authority to change production resources. Tool access and data handling are outside this paper blueprint and must be decided before a live trial.

## What to Observe

- Did AI help reveal missing expectations, contradictions, or useful questions?
- Could reviewers trace each important proposal to evidence and a bounded work slice?
- Were incorrect or invented claims easy to detect?
- Did proposed code and tests reflect operational rules and failure cases, not only the happy path?
- How much expert and builder time was needed to review and correct the result?
- Could another builder continue from the continuity record without the original AI conversation or expert?
- Which work is suitable for AI assistance, and which requires direct domain judgment?

Record measured results where possible; distinguish observation from opinion.

## Decision

Classify the approach as **useful**, **useful with conditions**, **not useful for this work**, or **unknown**. State the evidence, risks, and conditions that could change the decision. Do not infer that AI can autonomously replace domain expertise from one successful slice.

Keep durable findings and links to resulting work; retain or discard trial material with rationale. This Spike is a blueprint only and has not been run.
