# Why a Meta-Type System May Be Useful

**Status:** Exploratory design rationale  
**Level:** Meta-level; this document describes why the System may need descriptions of Types, not the concrete schema for those descriptions.

## The Idea

A meta-type system represents information about domain Types as data. Instead of requiring every layer to know each domain Type in source code, the System can provide a Type Description that generic layers inspect and use.

The earlier `PPTModel` / `PPTField` concept was an attempt at this idea. Its lasting value is not a particular class layout or name; it is the possibility that a System can describe its domain Types in a form that other parts of the System can understand and act on.

## Why It Could Matter to This System

DevEnv aims to help define Goals and support progress toward them. Concepts such as Goals, Acceptance Criteria, Work Items, Dependencies, RICE Assessments, and future domain Types need to be captured, changed, validated, and connected to evidence.

If those Types exist only as compile-time interfaces or are embedded separately in forms, persistence code, and APIs, each generic capability must either:

- hard-code knowledge of every domain Type;
- duplicate its structure and rules in several places; or
- accept loosely structured data whose meaning is unclear.

A meta-type system offers a possible shared description that can be consumed by layers that do not know the domain in advance. This creates a path toward generic input forms, data hydration, validation, serialization, inspection, and eventually controlled transformations, without requiring each such layer to be rewritten for every new Type.

## Potential Benefits

### Reduce duplicated structure

One inspectable Type Description could inform multiple consumers, reducing the chance that a form, persistence layer, and validator disagree about required fields or valid values.

### Let generic layers serve evolving domains

The core System could add or refine domain Types while generic infrastructure continues to operate from descriptions, rather than accumulating special cases for each concept.

### Make meaning and rules inspectable

A Type Description can carry names, semantic explanations, relationships, units, variants, and constraints. This makes domain structure available at runtime to tools, users, validators, and future integrations.

### Enable data-driven interaction

Forms and hydration can be generated or guided by Type Descriptions. This is useful when the set of Types is expected to evolve, when Types are configured by users, or when multiple domains must use the same interaction infrastructure.

### Provide a foundation for controlled transformation

Explicit descriptions can support mappings between representations, such as a domain Type and a storage or interchange format. They may also support cross-language or cross-domain transformations when semantic mappings are supplied. The description alone cannot prove that two similarly shaped Types mean the same thing.

## Costs and Risks

A meta-type system is itself a System to design and maintain. It adds concepts and contracts before it removes complexity. Its costs include:

- designing and versioning a description language;
- validating descriptions and reporting unsupported constructs;
- migrating stored data as descriptions change;
- keeping source-level Types and runtime descriptions consistent;
- constraining executable rules so descriptions cannot run arbitrary code;
- designing generic consumers that are useful without pretending to understand domain meaning;
- handling mappings that are lossy, ambiguous, or domain-specific.

There is also a risk of building an overly general schema language before real use cases establish what it must express. A generic form may collect structurally valid data that is semantically wrong. Type metadata is not a substitute for domain judgment or explicit business rules.

## Architectural Position

Treat the meta-type system as a potential enabling layer between domain knowledge and generic capabilities:

```text
Domain meaning and rules
           |
           v
Machine-readable Type Descriptions
           |
           +--> forms and input
           +--> hydration and serialization
           +--> validation
           +--> inspection and documentation
           +--> explicit transformation mappings
```

Keep the following boundaries clear:

- A **Domain Type** expresses what a concept means and which rules apply.
- A **Type Description** makes enough of that meaning and structure inspectable to support generic behavior.
- A **consumer** uses only the parts of the description it understands and must report unsupported parts explicitly.
- A **Presentation Description** may influence layout or widgets but cannot weaken domain constraints.
- A **Transformation** between Types or representations needs explicit semantic mapping wherever shape alone is insufficient.

The meta-type layer should not become the authority for every aspect of System behavior. Complex invariants may require domain-specific validation; the description should allow a Type to declare or reference such rules without pretending all rules reduce to primitive field metadata.

## When It Is Worth Building

A meta-type system becomes valuable when there is demonstrated pressure to:

- add or alter domain Types without rewriting every form and data-handling layer;
- inspect, validate, or hydrate Types at runtime;
- store Type Instances durably across changes to the application;
- support multiple consumers or representations from the same Type definitions;
- let users or domain configuration influence the available Types.

If Types remain few, stable, source-defined, and consumed only by hand-written code, ordinary language-level Types and explicit forms may be simpler and safer. The meta-level should be introduced to solve observed duplication or extensibility needs, not merely because it is possible.

## Practical Validation

Test the idea with a narrow vertical slice before committing to a general framework:

1. Choose a Type with real meaning and useful constraints, such as `Goal`.
2. Describe its identity, required fields, references, and one meaningful invariant.
3. Use that description to drive a generic form and hydrate submitted data.
4. Validate data and show actionable errors without importing Goal-specific UI code into the generic consumer.
5. Serialize and reload an instance while preserving its Type identity and version.
6. Change the description and establish what happens to existing instances.

The experiment succeeds only if the description reduces duplication while preserving domain correctness and producing a simpler overall change than hand-coded alternatives.

## Relationship to the Schema Proposal

This document records the **why**, likely benefits, tradeoffs, and conditions for investment. The separate [Type Description Model](./type-description-model.md) explores the **what**: a possible conceptual structure, consumer contracts, and open schema decisions. Neither document commits the System to a runtime format or implementation.
