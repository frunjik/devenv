# Domain Design System: What It Needs to Express

**Status:** Exploratory design notes  
**Scope:** Candidate domain concepts, outcomes, and Contracts—not implementation.

## Proposed Goal

Enable a person or team to create and evolve a clear, internally consistent, inspectable Domain Definition—one that explains the Domain's purpose and context, defines its Terms and Types, states its relationships and rules, and can be examined through representative examples and evidence.

This is a proposed direction, not a claim that the current application already provides these capabilities. The goal and candidate criteria need refinement with intended users and a concrete Domain.

## Candidate Outcomes

1. A user can describe a Domain's purpose, scope, and context.
2. A user can describe a Problem in context, including who or what is affected, why it matters, and the observations or Evidence supporting the framing.
3. A user can distinguish observations from interpretations, suspected causes, Goals, and proposed responses, and can record uncertainty or differing perspectives.
4. A user can define Terms and Types and explain their meanings, properties, relationships, and rules.
5. The System can help identify unresolved references, duplicate identifiers, missing information, and violations of declared constraints, with actionable explanations.
6. A user can examine representative Type Instances against the declared rules.
7. A user can understand how Problems, Goals, and domain concepts relate to the Domain's purpose.
8. The Domain Definition can be revisited and changed without losing relevant meaning, context, or rationale.

These are candidate Acceptance Criteria, not agreed requirements. In particular, “clear,” “consistent,” and “useful” need observable interpretations.

## What to Define About a Domain

### Purpose, boundary, and context

Identify who uses the Domain Design System, what activities or decisions it supports, and what is inside and outside the Domain being described. Record relevant stakeholders, assumptions, external systems, and contexts in which meanings differ.

Distinguish the Domain (the area of knowledge and activity), the Domain Definition (its maintained description), and the Domain Design System (the system used to create and examine that description).

### Problems, Goals, and responses

A Problem framing describes an undesirable or inadequate current condition, for whom, in what context, and why it matters. Keep these kinds of claims distinct:

- **Observation:** what was directly seen, measured, or reported.
- **Problem framing:** an interpretation of a current condition as undesirable or inadequate.
- **Cause hypothesis:** a possible, potentially uncertain or contested explanation.
- **Goal:** a desired future condition or outcome.
- **Proposed response:** an intervention or Work Item intended to change the condition.

Do not treat a symptom as proof of a cause, a solution as the Problem, or a Goal-to-Problem link as proof that the Goal will resolve the Problem. Preserve evidence, context, uncertainty, and relevant perspectives. A Goal may address multiple Problems; a Problem may relate to multiple Goals.

### Vocabulary, Types, and instances

Define Terms with stable identity, meaning, and context. Record synonyms, ambiguity, and differing contextual meanings. For each Type, consider its meaning, identity, version, fields, units, cardinality, references, variants, invariants, and representative valid and invalid instances.

Keep Domain Types distinct from Type Descriptions, Type Instances, and presentation configuration. See [Type Description Model](./type-description-model.md) and the rationale and prior art in [Why a Meta-Type System May Be Useful](./meta-type-system-purpose.md).

### Relationships, rules, and behavior

Describe relevant relationships, including direction, cardinality, meaning, and constraints. Distinguish structural rules from behavioral Contracts, lifecycle rules, derived values, and judgments that depend on evidence or human interpretation.

For goal-oriented Domains, keep Work Item completion and progress distinct from Goal achievement. State what evidence can support an Acceptance Criterion and how assessments are made.

Structure alone may not explain a Domain. Some questions are clearer when modeled as change over time: who intends an action, what happens, what becomes true, and what information is then available. Commands (intentions that may be rejected), events (accepted facts), and views or queries (ways of presenting information) are one useful modeling lens, not mandatory primitives for every Domain. This distinction describes behavior; it does not prescribe event-sourced storage.

### Contracts, change, and usefulness

Describe obligations, guarantees, and failure behavior at meaningful boundaries. Consider how definitions change: identity, context, versioning, authorship, review, history, renamed or reinterpreted Terms, and the effects on related definitions and instances.

Evaluate usefulness through representative Domains and outcomes: can people explain concepts more consistently, notice contradictions, communicate meaning, and make better-informed decisions? Completing a model is not proof that it is useful.

### Traceability toward implementation

Because the eventual purpose is working software, preserve a path from the Problems and Evidence that motivate change through desired outcomes, Domain concepts, rules and Contracts, to candidate capabilities and later implementation decisions and tests. Keep rationale and revisions so code can be understood in terms of the need it serves.

This path is not necessarily linear or one-to-one: a Problem may motivate several capabilities, and a capability may serve several outcomes. It is a design concern, not a chosen representation or promise that artifacts can generate code automatically.

## Illustrative Conceptual Model

The following notation is a thinking aid, not a final schema, runtime DTO, or commitment to these exact concepts:

```text
DomainDefinition {
    id
    version
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
    scope
    assumptions
    stakeholders
}

ProblemFraming {
    id
    context
    statement
    affectedParties
    observations: Evidence[]
    impact
    causeHypotheses: CauseHypothesis[]
    perspectives: Perspective[]
    relatedGoals: Goal[]
}

CauseHypothesis {
    statement
    supportingEvidence: Evidence[]
    confidence
}

Term {
    id
    name
    meaning
    context
    synonyms
}

TypeDescription {
    id
    version
    meaning
    fields: FieldDescription[]
    invariants: Constraint[]
}

FieldDescription {
    id
    meaning
    valueType
    cardinality
    unit
    constraints: Constraint[]
}

Relationship {
    source
    target
    meaning
    cardinality
    constraints: Constraint[]
}
```

Avoid defining a meta-model for every imaginable construct. Each proposed Type should have a clear meaning, real use, and identifiable invariants.

## Candidate Contracts

- **Identity:** Domain concepts have stable identities independent of display names.
- **Reference integrity:** References resolve in the relevant context or are reported clearly.
- **Context:** A Term's meaning is not silently transferred between contexts.
- **Problem framing:** Observations, interpretations, cause hypotheses, Goals, and responses remain distinguishable; uncertainty is not presented as fact.
- **Evidence:** Evidence identifies which claim it supports; evidence for one claim does not automatically prove another.
- **Problem-to-Goal:** A relationship records intent to address a Problem, not proof that the Goal or response will succeed.
- **Declared validity:** A definition violating its own declared constraints is not represented as valid.
- **Interpretation:** Any consumer or reader that cannot interpret a concept or rule makes that limitation explicit.
- **Evolution:** Changes that affect meaning or interpretation are visible; ambiguity or information loss is not silently concealed.
- **Goal assessment:** Completeness or internal consistency alone does not establish usefulness or achieved outcomes.

These Contracts are candidates for discussion, not a final requirements set.
