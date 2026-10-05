# Goal: A System for Designing Domains

**Status:** Exploratory product and architecture proposal  
**Purpose:** Explore what a Domain Design System should mean and what it needs to express. This document does not prescribe implementation.

## Current Exploration Boundary

The current phase is about **what** the System should help people do and **what knowledge** it must express. It is not yet about how to build it.

In this phase:

- Explore needs, concepts, meanings, relationships, rules, constraints, Contracts, examples, evidence, risks, and open questions.
- Record candidate Terms, Types, and models as design artifacts. Any structured notation below is illustrative, not source code or a committed schema.
- Keep alternatives visible where the right choice is not yet known; mark candidate Acceptance Criteria as candidates until they are agreed and observable.
- Do not write application code, select a technology, or turn a possible strategy into an implementation plan.

Later, in a separate phase, decide how to realize the agreed needs. TDD, code structure, storage formats, frameworks, and implementation sequencing belong to that later discussion.

## Proposed Goal

Enable a person or team to create and evolve a clear, internally consistent, inspectable Domain Definition—one that explains the Domain's purpose and context, defines its Terms and Types, states its relationships and rules, and can be checked against observable examples and evidence.

This is a proposed goal, not a claim that the current application already provides these capabilities. DevEnv is presently implemented as an Angular client and Express API; this document describes a possible domain direction for it.

## What Success Would Mean

The Goal should be evaluated by observable outcomes, not by the number of modeling features shipped. Candidate Acceptance Criteria:

1. A user can create a Domain Definition with a stated purpose, scope, and context.
2. A user can describe a Problem in context, including who or what is affected, why it matters, and the observations or evidence supporting the description.
3. A user can distinguish observations from interpretations, suspected causes, and proposed solutions, and can record uncertainty or differing perspectives.
4. A user can define Terms and Types and explain their meanings, properties, relationships, and rules.
5. The System identifies unresolved references, duplicate identifiers, missing required information, and invalid Type or relationship constraints, and presents actionable diagnostics.
6. A user can create representative Type Instances and see which declared rules they satisfy or violate.
7. A user can understand how Problems, Goals, and the Domain's concepts and rules relate to its stated purpose.
8. A saved Domain Definition can be reopened without losing its identity, meaning, or supported version.
9. Changes to a Domain Definition are distinguishable from changes to its instances, and unsupported or incompatible changes are reported rather than silently misinterpreted.

These criteria need refinement with intended users and a concrete Domain. In particular, define what makes a Domain Definition "clear" or "internally consistent" through testable conditions and examples.

## Things to Define About the Domain

### 1. Purpose, boundary, and context

Define who uses the Domain Design System, which decisions or activities it supports, and what is inside and outside the Domain being designed. Identify relevant stakeholders, assumptions, external systems, and contexts in which Terms may have different meanings.

Do not confuse:

- a **Domain**, the area of knowledge and activity being described;
- a **Domain Definition**, the maintained description of that Domain;
- the **Domain Design System**, the software used to create and inspect that description.

### 2. Problems, Goals, and proposed responses

Describe the current condition before deciding what work or solution to propose. A Problem framing should make clear its context, the affected people or entities, what is undesirable or inadequate, why that matters, and what observations or Evidence support the claim.

Keep distinct:

- **Observation:** what was directly seen, measured, or reported;
- **Problem framing:** the interpretation that a current condition is undesirable or inadequate, for whom, and in what context;
- **Cause or explanation:** a possible account of why the condition exists, which may be evidenced, uncertain, or contested;
- **Goal:** the desired future condition or outcome;
- **Proposed response:** a possible intervention, solution, or Work Item intended to change the condition.

Do not assume that a named symptom proves a cause, that agreement on a Problem framing is universal, or that a proposed solution is itself the Problem. Preserve context, evidence, confidence, and differing perspectives where they matter. A Goal may respond to one or more Problems, and a Problem may remain relevant to several Goals; these relationships should be stated rather than inferred.

### 3. The Domain vocabulary

Define each Term once in a Glossary with a stable identity, meaning, and applicable context. Identify synonyms, ambiguous terms, and terms whose meaning differs between contexts. The tool should make unclear or conflicting vocabulary visible rather than silently choosing a definition.

### 4. Domain Types and instances

For each Type, define:

- stable Type identity, name, meaning, and version;
- fields and their meanings, value Types, units, and cardinality;
- references, nested structures, enumerations, and variants;
- Type invariants and which are locally declarative versus requiring domain-specific behavior;
- example valid and invalid Type Instances.

Keep a Domain Type distinct from its Type Description, a Type Instance, and presentation configuration. See the exploratory [Type Description Model](./type-description-model.md).

### 5. Relationships, rules, and behavior

Define relationships and their direction, cardinality, ownership, and referential rules. State cross-field invariants, lifecycle states and legal transitions, derived values, and decision rules. Distinguish structural constraints from behavioral Contracts and from assessments that depend on evidence or human judgment.

For goal-oriented Domains, distinguish Work Item completion and progress from Goal achievement. State what evidence can support an Acceptance Criterion and how assessments are made.

### 6. Contracts and observable outcomes

For each boundary between a producer and consumer, specify preconditions, inputs, successful postconditions, and failure behavior. Define how to diagnose invalid definitions and instances, and how consumers behave when they encounter unsupported description features.

Use Contracts for generic capabilities too: editing, validation, hydration, serialization, querying, import/export, and version migration must have explicit guarantees.

### 7. Evolution and governance

Decide how stable identifiers, versions, revisions, authorship, review, and change history work. Specify how renamed, removed, or reinterpreted Terms and fields affect references and saved instances. A field rename may preserve meaning; a changed definition may not. Migration must therefore be explicit and report lossy or ambiguous changes.

### 8. Evidence of usefulness

Choose a real Domain and representative examples. Measure whether people can define it more consistently, find contradictions earlier, explain its concepts to others, and safely evolve it. A feature's completion is not evidence that the product Goal has been achieved.

## Types to Consider

These are conceptual candidates, not a final schema or runtime DTO proposal:

```text
DomainDefinition {
    id
    version
    name
    purpose
    contexts: DomainContext[]
    problemFramings: ProblemFraming[]
    glossary: Term[]
    types: TypeDescription[]
    relationships: Relationship[]
    contracts: Contract[]
    goals: Goal[]
    revision
}

DomainContext {
    id
    name
    scope
    assumptions
    stakeholders
}

ProblemFraming {
    id
    contextId
    statement
    affectedParties
    observations: Evidence[]
    impact
    suspectedCauses: CauseHypothesis[]
    perspectives: Perspective[]
    relatedGoalIds
    status
}

CauseHypothesis {
    statement
    supportingEvidence: Evidence[]
    confidence
}

Perspective {
    stakeholder
    framing
    rationale
}

Term {
    id
    name
    meaning
    contextId
    synonyms
    relatedTermIds
}

TypeDescription {
    id
    version
    termId
    fields: FieldDescription[]
    invariants: Constraint[]
    variants
}

FieldDescription {
    id
    termId
    valueType
    cardinality
    unit
    constraints: Constraint[]
}

Relationship {
    id
    sourceTypeId
    targetTypeId
    meaning
    cardinality
    constraints: Constraint[]
}

DomainDiagnostic {
    subjectId
    ruleId
    severity
    message
    evidence
}
```

Avoid implementing a meta-model for every imaginable modeling construct. Add Types only when a real use case needs them and the System can state their meaning and invariants.

## Contracts to Establish

- **Definition identity Contract:** A Domain Definition and each Term, Type, field, relationship, and rule have stable identities independent of their display names.
- **Reference integrity Contract:** Every reference resolves to an existing compatible definition, or validation returns a precise diagnostic.
- **Context Contract:** A Term's meaning is interpreted within its declared context; conflicting meanings are not merged without an explicit decision.
- **Problem framing Contract:** A Problem framing distinguishes observed conditions from interpretations, cause hypotheses, Goals, and proposed responses; material uncertainty and context are not presented as established fact.
- **Problem evidence Contract:** Evidence for a Problem identifies what it supports (for example, an observation, impact claim, or cause hypothesis); evidence for one claim is not treated as proof of another without an explicit rationale.
- **Problem-to-Goal Contract:** A Goal may be linked to the Problem framing(s) it intends to address, but that link alone does not establish that the proposed Goal or response will resolve the Problem.
- **Definition validity Contract:** A Domain Definition that violates a declared structural invariant cannot be reported as valid.
- **Instance validation Contract:** A Type Instance is checked against the exact Type Description identity and version that governs it; unsupported rules produce explicit unsupported diagnostics, not a success-shaped partial validation.
- **Generic consumer Contract:** A consumer declares which description features it supports and reports features it cannot interpret.
- **Round-trip Contract:** Saving and reloading a supported Domain Definition preserves its identities, relationships, meanings, and version.
- **Evolution Contract:** An incompatible change to a Type Description or Domain Definition is detected; migration is explicit and reports ambiguous or lost information.
- **Goal achievement Contract:** A Domain Definition is not considered useful or successful merely because it is complete or valid. Its stated product Acceptance Criteria must be assessed using relevant evidence.

## Possible Strategies to Evaluate Later

These are candidate ways to learn whether and how the System should support Domain design. They are not decisions, a sequence, or permission to begin implementation during the current exploration phase.

### Domain-first inquiry

Work with representative users to define a real Domain's purpose, boundary, stakeholders, Terms, examples, disagreements, and current pain points before proposing a general model. This guards against designing a meta-model around hypothetical needs.

### Scenario- and example-first modeling

Collect concrete scenarios and examples, including ambiguous and invalid cases. Derive candidate Terms, Types, rules, and Contracts from what people need to explain or decide. This can reveal missing concepts earlier than starting with abstract schemas.

### Vertical-slice evaluation

Choose one narrow but meaningful scenario—potentially a Domain Definition containing a Goal and Acceptance Criterion—and trace what a person needs to express, understand, check, and preserve. Evaluate the full conceptual journey before building anything. This can test whether the proposed concepts hang together, but it should not prematurely dictate software architecture or implementation order.

### Competing-model comparison

Represent the same example Domain using two or more candidate approaches, such as Magritte-like descriptors, a schema-and-constraints model, or an explicit linked-concept model. Compare clarity, expressiveness, ambiguity, and the assumptions each introduces. The purpose is to discover tradeoffs, not pick a framework by familiarity.

### Paper or narrative prototype

Use sketches, sample documents, or walkthroughs to explore how a person would define a Term, relate a Type, inspect a constraint, and understand a diagnostic. This can evaluate concepts and language without committing to a user interface or writing software.

### Prior-art study

Compare systems such as Magritte, EMF, JSON Schema, CUE, SHACL, and OWL against specific needs and examples. Identify transferable ideas, mismatches, costs, and unanswered questions; avoid treating any one system as a complete answer.

## Possible Later Verification Approach

When the work moves from **what** to **how**, TDD and other engineering practices can be evaluated as implementation strategies. Candidate verification practices include:

- derive acceptance tests from agreed, observable product Acceptance Criteria;
- use Contract tests at defined boundaries and invariant tests for valid and invalid definitions or instances;
- test persistence, interoperability, and evolution behavior where those are agreed requirements;
- use integration and end-to-end tests to verify complete user-visible outcomes;
- treat coverage as a scoped measure of executed code, not proof that the product Goal has been achieved.

These practices are recorded as future considerations, not current tasks. The exact test strategy depends on the agreed system boundary, behaviors, and risks.

## Observations and Design Tensions

- **A Domain Definition is both a model and an argument.** It does not only list concepts; it makes claims about what exists, what matters, and how things relate. The System may need to help expose assumptions and disagreements, not only store well-formed records.
- **Problem framing is not neutral data entry.** Selecting what counts as a Problem, whose experience matters, and which evidence is relevant involves perspective and judgment. The System should help make those choices visible rather than imply that a single framing is objective.
- **Problem, cause, Goal, and solution are different claims.** Moving directly from a reported symptom to a Task can conceal disagreement about the underlying Problem or whether the proposed response is likely to help.
- **Problems can persist or change as understanding evolves.** A Problem framing may be refined, split, merged, disputed, or found unsupported. Preserve its context and rationale so that changing the framing does not silently rewrite the history of related decisions.
- **Meaning cannot be reduced to structure.** A field called `cost` with a numeric value is not meaningful without currency, unit, time basis, and the context of what is counted. Semantic explanation and examples may be as important as field schemas.
- **Different users may hold legitimate perspectives.** Contexts, viewpoints, and competing definitions may need to coexist rather than be flattened into one supposedly universal glossary.
- **Validation has levels.** Structural checks can be mechanical; domain-rule checks may need richer context; judgments such as whether evidence is sufficient may remain human decisions. The System should distinguish these outcomes and their evidence.
- **A model can be internally consistent and still be wrong or useless.** Consistency checks cannot establish that a Domain Definition matches reality or helps users achieve their purpose. Examples, stakeholder review, and outcome evidence matter.
- **The meta-model can constrain discovery.** If the System only allows concepts its own Type Description can express, it may force users to distort the Domain. Early exploration should allow concepts and questions that do not yet fit the candidate model.
- **Notation itself affects understanding.** Terms such as Domain, System, Goal, Type, and Model are overloaded. The System's own Glossary and the vocabulary of a modeled Domain must be distinguishable.
- **Completeness is not the same as usefulness.** Modeling every Term or rule is not necessarily valuable; the relevant question is whether the description supports the decisions, communication, or outcomes for which the Domain is being designed.

## Exit Conditions for This Exploration Phase

The exploration is ready to inform a separate implementation discussion when:

- intended users, purpose, and system boundary are sufficiently understood;
- candidate outcomes and evidence for success are explicit enough to discuss;
- core Terms have stable working meanings, with ambiguity and context recorded;
- representative examples expose the important Types, relationships, rules, and exceptions;
- key Contracts, constraints, risks, and unresolved decisions are documented;
- alternative strategies have been compared against the same concrete needs;
- there is agreement on what to learn or decide next, without assuming that code must be written.

These conditions are a guide, not a demand for exhaustive specification. The aim is enough shared understanding to make the next decision deliberately.
