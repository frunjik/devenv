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

## Magritte as Prior Art

[Magritte](https://github.com/magritte-metamodel/magritte) is a useful precedent for this idea. Its own README describes a fully dynamic meta-description framework intended to reduce the repetitive work of building views, editors, reports, queries, validation, and storage for domain objects whose shape changes. It presents descriptions as reusable information about domain objects, rather than making each consumer independently encode every field.

The [Contact Manager example](https://github.com/magritte-metamodel/magritte/blob/master/source/Magritte-ContactManager/CMPerson.class.st) shows the pattern concretely: a domain object provides descriptions for fields such as first name, birthday, and addresses. Those descriptions identify accessors and types, and can also specify labels, ordering, requiredness, read-only behavior, options, relations, and value conditions. A field description can therefore serve more than one generic consumer.

The transferable idea is not a universal schema format. It is a **shared, inspectable description of domain properties, interpreted by multiple capabilities**. Magritte demonstrates that this can make generic editing and validation practical while leaving domain objects and programmer-defined behavior in control.

### Application to Goals, Tasks, and Costs

| Concept | What a shared description could usefully express | What still needs domain-specific meaning or behavior |
| --- | --- | --- |
| **Goal** | Identity, title, desired outcome, dates, parent Goal, related criteria, and presentation hints; required fields and basic value constraints can guide forms and input validation. | Whether evidence satisfies an Acceptance Criterion, whether a Goal is achieved, and how changing a Goal affects linked work. A structurally valid Goal is not necessarily a well-defined or achieved Goal. |
| **Task / Work Item** | Title, description, status options, estimates, dates, dependencies, and references to Goals or criteria; generic editors could display relations and validate simple field constraints. | Legal state transitions, dependency and blocker semantics, progress aggregation, and whether completed work contributes enough evidence toward a Goal. These rules must be explicit domain contracts, not inferred from field layout. |
| **Cost** | Amount, currency, unit, period, estimate rationale, and links to a candidate or Work Item; typed descriptions can guide entry and check simple constraints such as positive amounts and required units. | What counts as cost, how estimates are evidenced, whether periods and currencies are comparable, and how totals or value-for-money measures are derived. Those are accounting and decision rules, not generic field behavior. |

This is a good fit where the same concepts need multiple generic capabilities—for example, editing a Goal, validating submitted data, rendering its relations, and serializing a versioned instance. It is less compelling if each Type has only one stable, hand-written form and no runtime inspection or generic processing requirement.

### Ideas Worth Reusing

1. **Describe once, consume many ways.** Use one canonical description as the source for generic form structure, basic validation, inspection, and serialization metadata instead of duplicating field definitions in each layer.
2. **Compose descriptions from meaningful building blocks.** Distinguish strings, quantities, dates, enumerations, single and repeated relations, and nested structures; add field identity and semantic explanation so the metadata is useful beyond a widget choice.
3. **Keep generic behavior bounded.** A consumer should declare which description features it supports and report unsupported constraints or relations rather than silently ignoring them.
4. **Preserve domain authority.** Generic metadata can validate local, declarative constraints, but domain logic remains responsible for cross-field invariants, workflows, derived measures, and Goal-achievement judgments.
5. **Separate portable facts from runtime behavior and presentation.** Magritte descriptions can be assembled in Smalltalk and can include executable conditions or component choices. That flexibility is powerful inside its runtime, but such code is not automatically portable, safely editable as data, or transformable into another language. For DevEnv, keep semantic constraints, presentation hints, and executable domain behavior distinguishable; use explicit, safe rule forms or named domain validators where needed.

**Assessment:** Reuse Magritte’s descriptive approach as prior art, not as a framework to copy wholesale. Its strongest match is generic, metadata-driven editing and validation of the fields and relations within Goals, Tasks, and Costs. The DevEnv model must go further in explicitly representing evidence, dependencies, decision context, lifecycle contracts, and the difference between completing work and achieving a Goal.

## Other Meta-Expression Systems to Explore

These systems address different parts of the problem. They are references for comparison, not proposed dependencies or a decision to adopt a particular technology.

| System | Primary expression | Possible relevance to DevEnv | Important boundary |
| --- | --- | --- | --- |
| [Eclipse Modeling Framework (EMF)](https://eclipse.dev/emf/) | Ecore models, reflective runtime access, persistence, editors, and code generation | A broad example of one model supporting generated and reflective consumers; useful to compare with Magritte for the Type Description layer. | A substantial modeling ecosystem with Java/Eclipse origins; its scale may exceed the needs of a focused application. |
| [JSON Schema](https://json-schema.org/overview/what-is-jsonschema) | JSON structure and declarative instance constraints | A practical candidate for describing and validating API or stored Goal, Task, and Cost instances across tools and languages. | Describes data shape and constraints, not complete domain meaning, workflow behavior, or the quality of a generated form. |
| [CUE](https://cuelang.org/docs/) | Data, schemas, and composable constraints in a logic-based language | Useful to study for richer validation, configuration, and constraints that relate fields or combine data with rules. | A constraint and configuration language, not by itself a complete domain model, user-interface model, or workflow engine. |
| [SHACL](https://www.w3.org/TR/shacl/) | Constraints (“shapes”) over RDF graphs | Relevant if Goals, Work Items, Acceptance Criteria, Evidence, and Costs are modeled as an explicit graph of linked concepts; SHACL also identifies possible uses in UI generation and data integration. | Assumes RDF graph concepts and tooling; adopting it would be a meaningful commitment to graph-oriented representation. |
| [OWL 2](https://www.w3.org/TR/owl2-primer/) | Formal vocabularies, classes, properties, and logical relationships | Useful for exploring precise vocabularies and what it means to define domain concepts and relations formally. | Ontology reasoning is distinct from application validation and operational rules; it will not decide whether a Goal has been achieved. |
| [Protocol Buffers descriptors](https://protobuf.dev/reference/cpp/api-docs/google.protobuf.descriptor/) | Runtime reflection over message and field definitions used for serialization | A focused reference for machine-readable structure and interoperable wire formats. | Optimized for messages and APIs, rather than rich semantic descriptions, editable forms, or domain lifecycle contracts. |

### Suggested Exploration Order

1. Compare **Magritte and EMF** for the general pattern of one description serving multiple generic consumers.
2. Compare **JSON Schema and CUE** for practical structural descriptions and validation in a TypeScript/API-oriented system.
3. Explore **SHACL and OWL 2** if expressing and querying a connected domain graph becomes a real requirement.
4. Consult **Protocol Buffers descriptors** if runtime reflection and stable cross-language message formats become priorities.

Do not assume these systems are alternatives at the same layer: a system could use one representation for messages, another for domain constraints, and separate domain contracts for workflow behavior. Before adopting any of them, test the smallest real slice—such as describing a Goal and its Acceptance Criteria, generating or guiding input, validating it, and preserving it through serialization—against a hand-written implementation. Compare duplication, correctness, migration cost, consumer support, and how clearly domain meaning remains visible.

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

This document records the **why**, likely benefits, tradeoffs, conditions for investment, and relevant prior art in Magritte. The separate [Type Description Model](./type-description-model.md) explores the **what**: a possible conceptual structure, consumer contracts, and open schema decisions. Neither document commits the System to a runtime format or implementation.

## References

- [Magritte repository and project overview](https://github.com/magritte-metamodel/magritte)
- [Magritte `CMPerson` example](https://github.com/magritte-metamodel/magritte/blob/master/source/Magritte-ContactManager/CMPerson.class.st)
- [Magritte paper: A Meta-Driven Approach to Empower Developers and End Users](https://scg.unibe.ch/archive/papers/Reng07aMagritte.pdf)
