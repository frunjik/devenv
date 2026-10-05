# Why Consider a Meta-Type System?

**Status:** Exploratory rationale, not an adoption decision.

## Core Idea

Represent information about Domain Types as inspectable descriptions so generic capabilities can use them without hard-coding every Type. The lasting idea behind the former `PPTModel` / `PPTField` is “describe once, consume in multiple ways,” not a particular class structure.

For Goals, Work Items, and Costs, descriptions might support reusable editing, validation, inspection, and serialization. They cannot determine whether evidence proves a Goal, which workflow transitions are valid, or what cost comparisons mean; those require explicit domain rules and context.

## Useful Prior Art

- **Magritte:** descriptions of object properties reused by editors, validation, reports, and other consumers. Best match for the shared-description idea.
- **EMF:** reflective models with editors and code generation; broad and potentially heavyweight.
- **JSON Schema / CUE:** data shape and constraints; useful to compare for validation, but neither is a complete domain model.
- **SHACL / OWL:** graph constraints and formal vocabularies; relevant if linked concepts and reasoning become central.
- **Protocol Buffers descriptors:** runtime message reflection; focused on structure and interchange.

These operate at different layers and are references, not proposed dependencies. See [Type Description concept](./type-description-model.md) and [Magritte](https://github.com/magritte-metamodel/magritte).

## Benefits, Risks, Test

Potential benefit: reduce duplicated field definitions and let evolving Types serve multiple consumers.

Risks: new schema/versioning burden, divergence from source Types, unsafe or nonportable rules, migrations, and generic behavior that is structurally valid but semantically wrong. Ordinary Types and hand-written forms may be simpler when the model is small and stable.

Evaluate only against a real need: does a shared description make multiple capabilities simpler while preserving domain meaning? A paper inquiry can explore that first; a later technical experiment is optional and must be separately decided. Do not infer that similar shapes can be safely transformed or that descriptions should generate code.

## References

- [Magritte project](https://github.com/magritte-metamodel/magritte)
- [Magritte Contact Manager example](https://github.com/magritte-metamodel/magritte/blob/master/source/Magritte-ContactManager/CMPerson.class.st)
- [Eclipse Modeling Framework](https://eclipse.dev/emf/)
- [JSON Schema](https://json-schema.org/overview/what-is-jsonschema) · [CUE](https://cuelang.org/docs/)
- [SHACL](https://www.w3.org/TR/shacl/) · [OWL 2](https://www.w3.org/TR/owl2-primer/)
- [Protocol Buffers descriptors](https://protobuf.dev/reference/cpp/api-docs/google.protobuf.descriptor/)
