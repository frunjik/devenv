# Type Description: Exploratory Concept

**Status:** Open design question; no runtime format or implementation chosen.

## Why Consider It?

Compile-time Types are not necessarily available to generic runtime consumers. A machine-readable Type Description might let generic capabilities work with domain Types without hard-coding every one.

The underlying idea of the former `PPTModel` / `PPTField` is worth exploring: describe domain structure as inspectable information, then let multiple consumers use it.

## Keep Three Things Distinct

1. **Domain Type:** meaning and rules.
2. **Type Description:** identity, semantic explanation, fields, relations, constraints, and version.
3. **Consumer:** a capability that interprets some description, such as an editor, validator, serializer, or inspector.

Presentation hints may guide display but must not weaken domain rules. Generic consumers should report unsupported constructs rather than silently provide partial behavior. Domain-specific workflows, judgments, and complex invariants may need explicit domain behavior beyond metadata.

## Candidate Shape

Illustrative only:

```text
TypeDescription { id, version, meaning, fields, invariants }
FieldDescription { id, meaning, valueType, cardinality, unit, constraints }
TypeInstance { typeId, typeVersion, values }
PresentationHints { typeId, fieldOrder, labels, widgets }
```

Consider stable identity separately from changeable names. Distinguish primitive values, references, collections, and nested Types only as concrete examples require.

## Important Constraints and Open Questions

- Descriptions need semantic meaning and units, not only shapes.
- Never treat structural similarity as proof of semantic equivalence.
- Version changes and instance migration need explicit treatment.
- Avoid arbitrary executable rules in portable descriptions.
- Decide later whether descriptions are authored, generated, or maintained alongside source Types; how references, constraints, and migrations work; and whether presentation data is separate.

Magritte is relevant prior art for reusable descriptions interpreted by multiple capabilities. It is not a framework or schema decision. See [meta-type rationale](./meta-type-system-purpose.md).
