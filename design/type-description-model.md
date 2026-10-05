# Type Description Model

**Status:** Exploratory proposal  
**Purpose:** Preserve the idea of describing domain Types as data so generic parts of the System can work with them without hard-coding domain-specific knowledge.

## Problem

The System is intended to help define Goals and make progress toward achieving them. As the domain grows to include Goals, Work Items, Acceptance Criteria, RICE Assessments, and other concepts, generic layers will need to accept, hydrate, validate, display, and transform instances of those Types.

Plain TypeScript interfaces are useful to code that imports them, but their structure is erased at runtime. A form renderer or data-hydration layer cannot inspect a TypeScript interface unless it also knows about that type through hand-written code. This creates duplicated definitions and couples generic infrastructure to each domain Type.

The former `PPTModel` / `PPTField` idea was an attempt to address this gap. This proposal preserves the underlying idea—an inspectable meta-description—without assuming its earlier names or implementation.

## Core Separation

Keep three concerns distinct:

1. **Domain Type:** the meaning and rules of a concept, such as `Goal` or `WorkItem`.
2. **Type Description:** a machine-readable description of a Domain Type: its identity, fields, relationships, constraints, variants, and version.
3. **Consumer behavior:** generic capabilities that interpret a Type Description, such as form generation, data hydration, validation, serialization, or code generation.

Presentation metadata may refer to fields in a Type Description, but it must not redefine domain meaning. For example, “confidence is between zero and one” is a domain constraint; “render confidence as a slider” is a presentation hint.

## Conceptual Types

The following is illustrative notation, not a committed serialization format or runtime API.

```text
TypeId = string
TypeVersion = string
FieldId = string

TypeDescription {
    id: TypeId
    version: TypeVersion
    name: string
    meaning: string
    fields: FieldDescription[]
    variants?: VariantDescription[]
    invariants?: ConstraintDescription[]
}

FieldDescription {
    id: FieldId
    name: string
    meaning: string
    type: ValueType
    cardinality: Cardinality
    constraints?: ConstraintDescription[]
}

ValueType =
    Text
  | Boolean
  | Number { unit?: string, minimum?: number, maximum?: number }
  | DateTime
  | Enumeration { values: EnumerationValue[] }
  | Reference { targetType: TypeId }
  | Collection { itemType: ValueType }
  | Nested { targetType: TypeId }

Cardinality =
    required
  | optional
  | repeated { minimum?: number, maximum?: number }

ConstraintDescription {
    id: string
    meaning: string
    rule: DeclarativeRule
}

TypeInstance {
    typeId: TypeId
    typeVersion: TypeVersion
    values: Map<FieldId, unknown>
}

PresentationDescription {
    typeId: TypeId
    typeVersion: TypeVersion
    fields: FieldPresentation[]
}

FieldPresentation {
    fieldId: FieldId
    order?: number
    label?: string
    helpText?: string
    widgetHint?: string
}
```

Descriptions should use stable identifiers rather than field names as identity. Names and explanatory text can change without silently breaking references or stored instances.

## Example Shape

A Goal description might declare:

```text
TypeDescription {
    id: "goal"
    version: "1"
    name: "Goal"
    meaning: "A desired outcome the System intends to achieve."
    fields: [
        { id: "goal.id", name: "id", type: Text, cardinality: required },
        { id: "goal.outcome", name: "desiredOutcome", type: Text, cardinality: required },
        {
            id: "goal.criteria",
            name: "acceptanceCriteria",
            type: Collection { itemType: Reference { targetType: "acceptance-criterion" } },
            cardinality: repeated { minimum: 1 }
        }
    ]
}
```

The generic form layer can use field identity, value type, cardinality, constraints, and optional presentation hints to collect an instance. It need not know what a Goal means to render the fields. The semantic meaning remains in the description for people and domain-aware consumers.

## Generic Consumer Contracts

- **Description resolution:** A consumer identifies a Type by `TypeId` and a compatible version; it does not infer a Type from a display name.
- **Form generation:** A form generator creates inputs from field value types and cardinality. Presentation hints influence display only and cannot weaken domain constraints.
- **Hydration:** Hydration maps serialized data to fields by stable `FieldId`, validates primitive values and references, and reports missing required fields, unknown fields, unsupported versions, or invalid values explicitly.
- **Validation:** A validator checks field constraints, relationships, and Type-level invariants. A declared description that cannot be interpreted must result in a clear error, not a silently partial instance.
- **Serialization:** Serialized instances retain Type identity and version so they can be interpreted or migrated later.
- **Transformation:** A conversion between Types, languages, or domains requires an explicit mapping when field identities or semantics differ. Structural similarity alone does not establish semantic equivalence. Conversions must report lossy, ambiguous, or unsupported mappings.
- **Separation of concerns:** Domain constraints live with the Type Description; labels, ordering, and widget preferences live in optional presentation metadata. A consumer may ignore presentation metadata and still validate the instance correctly.

## Design Constraints

- Treat descriptions as versioned data, not as an automatic reflection of compiled classes.
- Keep the first schema small: primitive values, enumerations, references, nested values, collections, optionality, and declarative constraints.
- Do not execute arbitrary code embedded in descriptions. Constraints and transformations need a constrained, validated representation.
- Preserve semantic text and units; a bare number is insufficient when its interpretation depends on a scale, currency, duration, or other unit.
- Distinguish a Type description from a Type instance and from a form configuration.
- Decide how type-description changes affect stored instances before promising backward compatibility.
- Prefer explicit mappings for cross-domain transformations. Do not claim that every Type can be automatically translated into every language or domain.

## Open Decisions

- Which serialization format should carry Type Descriptions?
- Are descriptions authored as data, generated from source Types, or maintained with a checked relationship to source Types?
- Which declarative constraint language is expressive enough for invariants while remaining safe and portable?
- How are references resolved and validated during hydration?
- How are incompatible description versions migrated, and how long are old versions supported?
- Should presentation descriptions be stored alongside Type Descriptions or in a separate UI-specific registry?
- What exact semantics and use cases did `PPTModel` / `PPTField` intend to support, and which should be retained?

These questions are intentionally unresolved; settling them requires concrete use cases and compatibility requirements.

## Suggested First Vertical Slice

Use one small Type, such as `Goal`, to demonstrate the end-to-end contract:

1. Describe the Type with stable field IDs, requiredness, and one constraint.
2. Render a generic form without importing a Goal-specific component.
3. Hydrate submitted data into a versioned instance and validate it against the description.
4. Show explicit validation errors for missing, invalid, unknown, or unsupported data.
5. Round-trip the valid instance through serialization and verify its meaning is retained.

Only after this slice works should the System add complex Work Item relationships, RICE constraints, transformations, or broad code generation. Keep this proposal exploratory until the slice exposes real requirements.

## Related Material

- [System type and goal-progress review](../reviews/system-types.md)
- [RICE prioritization model](../reviews/rice-prioritization.md)
- [Project glossary](../.glossary)
