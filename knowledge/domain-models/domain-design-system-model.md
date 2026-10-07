# Domain Design System: What It Needs to Express

**Status:** Exploratory; not an implementation plan.

## Candidate Goal

Help people create and evolve useful, understandable descriptions of a Domain: its purpose and context, Problems and Goals, vocabulary, concepts, relationships, rules, and evidence. Whether this is DevEnv's goal remains to be explored with intended users and real examples.

## Core Distinctions

- **Domain / Domain Definition / Domain Design System:** the area described / its maintained description / the system used to create and examine it.
- **Observation / Problem / cause hypothesis / Goal / response:** what was seen / an interpretation of an undesirable condition / a possible explanation / a desired condition / a proposed intervention. Preserve context, evidence, uncertainty, and differing perspectives; do not assume a response solves the Problem.
- **Type / Type Description / Type Instance:** domain meaning and rules / an inspectable description for generic consumers / a particular value.
- **Work progress / Goal achievement:** completed work is not evidence that an outcome was achieved; achievement requires evidence against Acceptance Criteria.

Terms and Types should have clear meanings in context. Abstraction should reveal what matters without erasing important variation or severing concepts from examples and evidence.

## Candidate Areas of Concern

Explore what a Domain Definition needs to express about:

1. Purpose, boundary, context, stakeholders, and assumptions.
2. Problems, Goals, responses, and the Evidence supporting each claim.
3. Terms, Types, instances, relationships, constraints, and exceptions.
4. Behavior and change over time, not only static structure. Commands, events, and views are optional lenses for examining flow, not universal primitives or storage choices.
5. Contracts, interpretation limits, revisions, and changes in meaning.
6. Traceability from **Problem and Evidence → outcome → concepts/rules/Contracts → candidate capabilities → later code and tests**. Links may be many-to-many; preserve rationale, but do not assume automatic code generation.

## Candidate Contracts

- References and meanings are interpreted in context; unresolved or ambiguous references are visible.
- Observations, interpretations, hypotheses, and decisions are distinguishable; Evidence states which claim it supports.
- Invalid definitions are not presented as valid; unsupported rules are reported, not silently ignored.
- Changes that affect meaning are visible; uncertainty and information loss are not hidden.
- Completeness or internal consistency alone does not establish usefulness or Goal achievement.

These are prompts for inquiry, not agreed requirements. Keep the model open to concepts that do not fit its current abstractions.

## Related Designs

- [Exploration strategy and inquiry notes](./domain-design-system-exploration.md)
- [Meta-Type rationale and prior art](./meta-type-system-purpose.md)
- [Type Description concept](./type-description-model.md)
