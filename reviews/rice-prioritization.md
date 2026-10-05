# RICE Prioritization Types

These conceptual Types define the information needed to prioritize product-development candidates with RICE. They are a decision model, not application runtime DTOs.

```text
type Identifier = string
type GoalId = Identifier
type PrioritizationCandidateId = Identifier
type RICEAssessmentId = Identifier
type ReachCount = number
type ImpactPoints = number
type ConfidenceFraction = number
type PersonMonths = number
type CurrencyCode = string
type RICEScore = number
type BenefitCostRatio = number

PrioritizationCandidate {
    id
    name
    description
    contributesTo: GoalId[]
}

ScoringContext {
    period: TimePeriod
    targetPopulation: string
    desiredOutcome: string
    reachBasis: uniquePeople | occurrences
    impactScale: ImpactScale
    effortUnit: personMonths
}

TimePeriod {
    start
    end
}

ImpactScale {
    name
    version
    levels: ImpactLevel[]
}

ImpactLevel {
    points: ImpactPoints
    description
}

Estimate<T> {
    value: T
    rationale
    evidence: Evidence[]
}

RICEAssessment {
    id: RICEAssessmentId
    candidateId: PrioritizationCandidateId
    context: ScoringContext
    reach: Estimate<ReachCount>
    impact: Estimate<ImpactPoints>
    confidence: Estimate<ConfidenceFraction>
    effort: Estimate<PersonMonths>
    assessedAt
    assessedBy
    score: RICEScore
}

MoneyAmount {
    amount
    currency: CurrencyCode
}

MonetaryComparison {
    candidateId: PrioritizationCandidateId
    period: TimePeriod
    expectedBenefit: Estimate<MoneyAmount>
    expectedCost: Estimate<MoneyAmount>
    benefitCostRatio: BenefitCostRatio
}

PrioritizationDecision {
    id
    candidateId: PrioritizationCandidateId
    assessmentId: RICEAssessmentId
    rank: positive integer
    decision: selected | deferred | rejected
    rationale
}
```

## Type Rules

- Reach is a non-negative estimate of unique people or occurrences within the context's stated period and target population. Keep its basis consistent across candidates.
- Impact is non-negative and uses a level from the declared scale and outcome for candidates being compared. Record the scale definition; an impact value without its scale is not interpretable.
- Confidence is an estimate fraction in the inclusive range `0..1`. For example, 80% confidence is `0.8` in the formula, not `80`; retain its rationale and evidence like the other estimates.
- Effort is strictly greater than zero and uses the context's declared unit. Zero or missing effort cannot be divided into a RICE score; handle such candidates separately rather than manufacturing a score.
- A ScoringContext's period has a start and end, and candidates must use compatible periods, population definitions, desired outcomes, impact-scale versions, and effort units to be ranked together.
- The RICE score is derived, not independently edited:

  ```text
  score = (reach.value × impact.value × confidence.value) ÷ effort.value
  ```

- Preserve estimate rationale, evidence, assessment date, and assessor. The score is an estimate-based comparison, not an objective fact; reassess when evidence or assumptions change.
- Money amounts use the same currency when comparing candidates. MonetaryComparison requires a defined benefit and cost for the same candidate and period; its ratio is `expectedBenefit.value.amount ÷ expectedCost.value.amount`, and the expected cost must be greater than zero. It is separate from RICE and cannot be inferred from a RICE score.
- A numeric score without its Scoring Context must not be used for ranking.
- A PrioritizationDecision records what was decided and why; it does not follow automatically from rank. Strategic constraints, dependencies, risk, capacity, or other Goals may justify a different decision.

## Value-for-Money Interpretation

Standard RICE uses Effort (commonly person-months) as its denominator, so it estimates expected reach-weighted impact per unit of team effort. It is not, by itself, financial ROI or literal value per dollar. If the decision specifically compares money spent, record a MonetaryComparison with estimated benefit and cost in a consistent currency and time basis. Do not silently substitute money for Effort or compare benefit-cost ratios with RICE scores.

## Contracts

- **Assessment completeness Contract:** Every RICEAssessment identifies one candidate and one ScoringContext, and includes all four RICE factors.
- **Estimate traceability Contract:** Each uncertain factor includes rationale and supporting Evidence; Confidence communicates uncertainty rather than hiding it.
- **Score derivation Contract:** The stored or displayed score equals the formula applied to the assessment's factors. Inputs outside their valid ranges or zero Effort are rejected or explicitly left unscored.
- **Comparison Contract:** A ranking compares only assessments with compatible ScoringContexts and the same RICE Model/impact scale.
- **Decision Contract:** A PrioritizationDecision references the assessment used and records its rationale. RICE informs the decision; it does not override strategic or operational constraints without an explicit rule.
- **Financial interpretation Contract:** A RICE Score is never labelled monetary ROI or value per dollar. Monetary comparisons use separately estimated benefit and cost for the same period and currency.

## Example

For Reach `1,000` people in a month, Impact `2` on a declared scale, Confidence `0.8`, and Effort `4` person-months:

```text
(1,000 × 2 × 0.8) ÷ 4 = 400 impact-points-weighted people per person-month
```

The value `400` is meaningful only alongside its impact scale and ScoringContext; it is not a dollar amount.
