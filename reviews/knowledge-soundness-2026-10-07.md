# Project Knowledge Soundness Review

**Reviewed:** 2026-10-07
**Reviewed revision:** `2d61886a55333634e1292eda9a5e2a9a8da8101f`
**Status:** Review recorded; recommendations pending discussion.
**Authority:** These are assistant assessments and proposals, not user decisions or changes to project rules. Permission to save or commit this review does not accept its recommendations.

## Scope and Limits

Reviewed the documents listed in the [Project Knowledge Index](../design/knowledge-index.md): the concern register and Meta Notes, principles, assistant guidance, glossary and terms, conceptual designs, exploration records, reviews, reusable methods, practical documentation, and historical notes.

This was a conceptual/document review, not a fresh implementation audit, external-reference verification, security review, or domain-user validation. Application ticket contents and Git history were not audited as part of the review. No source documents were changed during the review.

## Overall Assessment

The conceptual foundation is largely sound. Its strongest distinctions are:

- Source wording, interpretation, Problem framing, and proposed responses.
- Provenance versus truth or corroboration.
- Note acceptance versus ticket creation.
- Completed work, verified behavior, user acceptance, and Goal achievement.
- Type descriptions as aids to generic consumers, not substitutes for domain meaning.
- Exploratory models as provisional rather than implementation commitments.

The principal weakness is not a shortage of concepts. Meaning, authority, and current status become inconsistent across documents.

## Findings

### 1. Evidence Supports an Assessment; It Does Not Automatically Make One

**Importance:** High
**Disposition:** Proposed; not agreed or addressed.

The [System Type Review](./system-types.md) says criterion assessment is derived from Evidence and a Goal is achieved when every linked criterion is satisfied. This suits some mechanically evaluated conditions but is incomplete for judgment-based ones. Evidence may be conflicting, outdated, incomplete, or interpreted differently.

**Proposed improvement:** Distinguish the criterion, supporting/challenging evidence, assessment and rationale, assessor and time, and automatic versus human assessment. Define the outcome when a Goal has no criteria; empty-set logic must not establish achievement of an unspecified Goal.

**Type conviction:** Refine the existing conceptual `GoalAssessment` before implementation. A new collection of Types is not yet necessary.

### 2. Validated Needs a Declared Scope of Assurance

**Importance:** High
**Disposition:** Proposed; not agreed or addressed.

The [concern register](../design/problem-inquiry-system/concerns.md) applies one status to domain decisions, design choices, behavior, and implementation. A selected policy, model fit to synthetic examples, passing tests, browser inspection, and demonstrated usefulness are different kinds of evidence.

Separate user acceptance is a useful improvement, but acceptance does not establish operational usefulness or truth.

**Proposed improvement:** Retain the agreed statuses and state what validation established, by which method, and what remains untested. Try clearer evidence descriptions before adding statuses. Meta-019's separation of boundary-test evidence from filesystem guarantees is a good example.

### 3. The Glossary Sometimes Makes Exploratory Concepts Look Settled

**Importance:** High
**Disposition:** Proposed; not agreed or addressed.

The [Glossary](../.glossary) defines Domain Definition, Type Description, and Hydration without qualification, while the [design model](../design/domain-design-system-model.md) leaves their model and implementation open. Readers cannot readily distinguish agreed vocabulary, provisional working meaning, and implemented capability.

Definitions also merit review:

- Type Instance should not imply that a runtime Type Description must exist.
- Hydration currently requires a Type Description, although ordinary deserialization/construction need not use one.
- Artifact is defined as a work product or System output, while source evidence includes received external artifacts.

**Proposed improvement:** Clarify definitions and link agreement/exploration records. Use the existing SC-027 domain-scoping concern rather than inventing another vocabulary system.

### 4. Historical Records and Current Instructions Need Stronger Separation

**Importance:** High
**Disposition:** Proposed; not agreed or addressed.

The index warns about historical material, but [DEVENVOPDEV.md](../DEVENVOPDEV.md) still instructs one-minute continuation checks, while the [maintained principles](../.agents/system-task-principles.md) specify three minutes. [.workflow](../.workflow) presents older feature-state rules as instructions. Concern paragraphs describe snapshots, missing controls, and questions superseded by later slices.

**Proposed improvement:** Mark historical documents explicitly and point to current guidance. Within concerns, distinguish current decisions/open work from dated history without deleting the history. This reduces the need to reconstruct chronology to resolve apparently conflicting instructions, as illustrated by the recent commit-prefix regression.

### 5. Some Agent Guidance Encourages Unjustified Conclusions

**Importance:** Medium-High
**Disposition:** Proposed; not agreed or addressed.

The [Type reviewer guidance](../.agents/type-detector.agent.md) treats a concept that "smells like" a Type as grounds for conviction, weaker than P-002's justification through meaning, constraints, or lifecycle.

The [demolition worker guidance](../.agents/demolition-worker.agent.md) treats absent references or a closed reference loop as grounds for removal. Static references alone do not establish non-use: external consumers, configuration, registration, and runtime entry points matter.

**Proposed improvement:** Align these methods with maintained principles. Support Type candidates with evidence and establish entry-point reachability before removal.

### 6. Metrics Need Protection Against False Precision

**Importance:** Medium
**Disposition:** Proposed; not agreed or addressed.

The [RICE review](./rice-prioritization.md) carefully distinguishes context, units, uncertainty, and monetary cost, but:

- `PrioritizationDecision` requires positive rank even for rejected/deferred candidates, although not every decision ranks.
- Ordered numeric Impact levels are not automatically meaningful for multiplication.
- SC-042's arithmetic on 1-5 ticket ratings is a heuristic, not proof of measured ratios.
- [.ideas](../.ideas) calls RICE objective, conflicting with the review's estimate-based interpretation.

**Proposed improvement:** Make rank conditional on a ranking decision, document scale assumptions, and label simplified ticket scores as heuristics rather than calibrated value or cost.

### 7. Origin, Assignment, and Dependency Have Unresolved Meaning

**Importance:** Medium
**Disposition:** Proposed; not agreed or addressed.

The [register](../design/problem-inquiry-system/concerns.md) separates these concepts, but language remains ambiguous:

- Source-origin categories are not inherently exclusive: a synthetic report can arrive externally.
- Assignment responsibility differs from the actor who resolves a ticket. "Resolved by" should not silently mean assignee.
- SC-047's "cannot (or should not) be resolved until" describes different dependency enforcement.

**Proposed improvement:** Settle behavior before widening Types. Existing candidates suffice; teams, roles, and generalized claim classification still lack a demonstrated need.

### 8. Reviews Need Dates, Scope, and Follow-Up Disposition

**Importance:** Medium
**Disposition:** Proposed; not agreed or addressed.

The [System Type Review](./system-types.md) lacks a clear reviewed revision and subsequent disposition. Some register research claims lack a precise external source for the particular assertion, such as Google treating 100% coverage as necessary.

**Proposed improvement:** Record when and against what a review was made; mark recommendations open, addressed, or superseded. Separate external guidance from project policy and keep coverage claims scoped.

## Focus: Meta-Type Rationale

[meta-type-system-purpose.md](../design/meta-type-system-purpose.md) is one of the stronger documents: benefits, costs, alternatives, and non-adoption are explicit.

**Proposed refinements, all pending discussion:**

1. Clarify whether Meta-Type System means reusable Type metadata, a language for describing Types, or something broader.
2. State that descriptions *by themselves* cannot establish domain meaning. An expressive description can encode transitions; it cannot establish that they are the right rules.
3. Evaluate one real Type across two consumers. Record duplication, unsupported rules, maintenance effort, and meaningful errors; compare with ordinary Types and handwritten behavior, not only modeling frameworks.

No framework adoption is justified by these documents alone.

## Recommended Follow-Up Order

1. Clarify assessment, evidence, and validation scope.
2. Make current authority and supersession explicit.
3. Reconcile glossary meanings with exploratory status.
4. Refine agent methods.
5. Evaluate metrics and Meta-Type descriptions through concrete examples.

Use existing concerns where they fit. A recommendation's agreement, implementation, and validation are separate facts; saving this review establishes none of them.

## Meta-Level Observation

We accumulate history effectively, but promote it into a clear current understanding less effectively. Better distinctions and cross-references would help more than another layer of concepts or tooling.

This observation is recorded here as part of the review, not promoted to an agreed principle.
