# Goal: A System for Designing Domains

**Status:** Exploratory product and architecture proposal  
**Purpose:** Identify what must be defined and built if DevEnv's Goal is to help people design Domain systems.

## Proposed Goal

Enable a person or team to create and evolve a clear, internally consistent, inspectable Domain Definition—one that explains the Domain's purpose and context, defines its Terms and Types, states its relationships and rules, and can be checked against observable examples and evidence.

This is a proposed goal, not a claim that the current application already provides these capabilities. DevEnv is presently implemented as an Angular client and Express API; this document describes a possible domain direction for it.

## What Success Would Mean

The Goal should be evaluated by observable outcomes, not by the number of modeling features shipped. Candidate Acceptance Criteria:

1. A user can create a Domain Definition with a stated purpose, scope, and context.
2. A user can define Terms and Types and explain their meanings, properties, relationships, and rules.
3. The System identifies unresolved references, duplicate identifiers, missing required information, and invalid Type or relationship constraints, and presents actionable diagnostics.
4. A user can create representative Type Instances and see which declared rules they satisfy or violate.
5. A user can understand how the Domain's concepts and rules connect to its stated purpose and Goals.
6. A saved Domain Definition can be reopened without losing its identity, meaning, or supported version.
7. Changes to a Domain Definition are distinguishable from changes to its instances, and unsupported or incompatible changes are reported rather than silently misinterpreted.

These criteria need refinement with intended users and a concrete Domain. In particular, define what makes a Domain Definition "clear" or "internally consistent" through testable conditions and examples.

## Things to Define Before Broad Implementation

### 1. Purpose, boundary, and context

Define who uses the Domain Design System, which decisions or activities it supports, and what is inside and outside the Domain being designed. Identify relevant stakeholders, assumptions, external systems, and contexts in which Terms may have different meanings.

Do not confuse:

- a **Domain**, the area of knowledge and activity being described;
- a **Domain Definition**, the maintained description of that Domain;
- the **Domain Design System**, the software used to create and inspect that description.

### 2. The Domain vocabulary

Define each Term once in a Glossary with a stable identity, meaning, and applicable context. Identify synonyms, ambiguous terms, and terms whose meaning differs between contexts. The tool should make unclear or conflicting vocabulary visible rather than silently choosing a definition.

### 3. Domain Types and instances

For each Type, define:

- stable Type identity, name, meaning, and version;
- fields and their meanings, value Types, units, and cardinality;
- references, nested structures, enumerations, and variants;
- Type invariants and which are locally declarative versus requiring domain-specific behavior;
- example valid and invalid Type Instances.

Keep a Domain Type distinct from its Type Description, a Type Instance, and presentation configuration. See the exploratory [Type Description Model](./type-description-model.md).

### 4. Relationships, rules, and behavior

Define relationships and their direction, cardinality, ownership, and referential rules. State cross-field invariants, lifecycle states and legal transitions, derived values, and decision rules. Distinguish structural constraints from behavioral Contracts and from assessments that depend on evidence or human judgment.

For goal-oriented Domains, distinguish Work Item completion and progress from Goal achievement. State what evidence can support an Acceptance Criterion and how assessments are made.

### 5. Contracts and observable outcomes

For each boundary between a producer and consumer, specify preconditions, inputs, successful postconditions, and failure behavior. Define how to diagnose invalid definitions and instances, and how consumers behave when they encounter unsupported description features.

Use Contracts for generic capabilities too: editing, validation, hydration, serialization, querying, import/export, and version migration must have explicit guarantees.

### 6. Evolution and governance

Decide how stable identifiers, versions, revisions, authorship, review, and change history work. Specify how renamed, removed, or reinterpreted Terms and fields affect references and saved instances. A field rename may preserve meaning; a changed definition may not. Migration must therefore be explicit and report lossy or ambiguous changes.

### 7. Evidence of usefulness

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
- **Definition validity Contract:** A Domain Definition that violates a declared structural invariant cannot be reported as valid.
- **Instance validation Contract:** A Type Instance is checked against the exact Type Description identity and version that governs it; unsupported rules produce explicit unsupported diagnostics, not a success-shaped partial validation.
- **Generic consumer Contract:** A consumer declares which description features it supports and reports features it cannot interpret.
- **Round-trip Contract:** Saving and reloading a supported Domain Definition preserves its identities, relationships, meanings, and version.
- **Evolution Contract:** An incompatible change to a Type Description or Domain Definition is detected; migration is explicit and reports ambiguous or lost information.
- **Goal achievement Contract:** A Domain Definition is not considered useful or successful merely because it is complete or valid. Its stated product Acceptance Criteria must be assessed using relevant evidence.

## Implementation Path

Build the smallest useful end-to-end capability first; do not begin with a general-purpose ontology workbench or automatic code generator.

### Slice 1: Define and validate a small Domain

Implement versioned persistence for a Domain Definition containing a purpose, context, Terms, a small number of Types, and references between them. Provide validation diagnostics for duplicate IDs, missing references, and basic required fields.

### Slice 2: Describe and test instances

Support a deliberately small set of field types, cardinalities, enumerations, and safe declarative constraints. Create Type Instances and validate them against the selected Type Description. Include valid and invalid examples.

### Slice 3: Generic authoring and inspection

Use the Type Description to guide a generic editor and inspector. Keep presentation hints separate from domain constraints. The generic layer must not need hard-coded knowledge of each modeled Type for basic editing.

### Slice 4: Goal and evidence connections

Allow a Domain Definition to state the Goals it serves and connect Types, rules, Work Items, and evidence to those Goals. Report contribution and evidence separately from work completion.

### Slice 5: Safe evolution

Add revisions, change comparison, compatibility checks, and explicit migrations only when persistence and real definition changes make their requirements concrete.

Import/export, collaboration, permissions, graphical diagramming, arbitrary executable rules, cross-domain transformation, and code generation are later candidates. Each needs its own Goal, Acceptance Criteria, and prioritization rather than being assumed part of the first release.

## TDD and Verification Approach

For each vertical slice, write an observable Acceptance Criterion first, then test the behavior before implementing it:

1. **Acceptance test:** From the user's perspective, describe the action and visible result—for example, an unresolved Type reference is shown with its source and repairable target.
2. **Contract test:** Exercise a boundary such as saving/loading a definition or validating an instance; assert success shape and explicit failure behavior.
3. **Type-invariant tests:** Test valid and invalid instances and definitions, including boundaries, missing values, invalid cardinalities, broken references, and unsupported constraints.
4. **Integration test:** Verify persistence, API, and consumer behavior agree on identifiers and versions.
5. **End-to-end test:** Verify a representative user can define, validate, save, reopen, and inspect a small Domain.
6. **Refactor:** Simplify implementation while preserving the tests and explicit Contracts.

Keep coverage reports scoped and honest. Coverage percentages measure execution of selected code units; they do not establish that the Domain Design System's Goals or Acceptance Criteria are satisfied.

## First TDD Vertical Slice

Use a small example Domain with one `Goal` Type and one `AcceptanceCriterion` Type:

1. Write a failing acceptance test that defines the Domain, adds the two Types, and links the criterion to the Goal.
2. Add tests that reject a duplicate Type ID and an unresolved criterion reference with actionable diagnostics.
3. Add one valid and one invalid Type Instance and verify rule-specific validation results.
4. Save and reload the Domain Definition and assert stable IDs, meanings, references, and version are preserved.
5. Add a generic editor only after the definition, validation, and persistence Contracts pass.

This slice tests the central claim—that explicit descriptions help people define and check a Domain—without prematurely settling the meta-description format or building multiple consumers at once.

## Decision Gate

Proceed beyond the initial slice only if it demonstrates all of the following:

- users can express real Domain meaning without relying on undocumented conventions;
- errors are specific enough to repair;
- generic capabilities reuse the descriptions instead of duplicating definitions;
- domain-specific rules remain explicit and are not approximated by structural validation;
- the approach is simpler and safer for the use case than ordinary code Types and hand-written forms;
- versioning and persistence requirements are understood for the data being saved.

If these conditions are not met, narrow the model or keep the relevant behavior explicit in code rather than generalizing prematurely.
