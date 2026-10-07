# Domain Design System: Exploration Notes

**Status:** Exploratory; current phase is about **what**, not implementation.

Explore purpose, Problems, meaning, concepts, rules, evidence, and open questions. Candidate Terms, Types, Contracts, and diagrams are thinking aids—not committed schemas. Preserve enough structure and rationale to trace later code and tests back to Problems, evidence, outcomes, and decisions. Do not write software or choose technology in this phase.

## Inquiry Loop

An **Inquiry** investigates a question or uncertainty relevant to a Goal. A lightweight loop is:

**Question / Hypothesis → examine examples and Evidence → record findings, contradictions, and ambiguity → decide with rationale → revise understanding or ask again.**

Preserve both outcomes and reasoning; conclusions may be revisited. Iteration is expected: if the answer were already known, there would be no need to inquire. Use canonical Terms, qualify by context when needed, and link definitions where useful. Do not settle reference formats prematurely.

## Strategies to Evaluate

- Domain-first and scenario/example-first inquiry.
- Paper or narrative modeling; compare competing models.
- Vertical-slice evaluation of one meaningful scenario.
- Prior-art study: Magritte, EMF, JSON Schema, CUE, SHACL, OWL.
- **Spike:** a bounded, time-limited inquiry, possibly paper-only. Store artifacts under `knowledge/research/explorations/<date>-<topic>/`; later promote useful findings, retain context, mark superseded material, or discard it with a reason. Keep the record lightweight; build no tooling in advance.

### Bootstrap Example

Use the Domain that motivates this System as an example, keeping distinct:

- **System under exploration:** the possible Domain Design System.
- **Modeled Domain:** the area described as an example.
- **Bootstrap activity:** our non-code inquiry into whether candidate concepts help describe it.

Trace one real situation from context and observation through Problem framing, evidence, causes, desired outcome, and possible responses. Later use a contrasting Domain to test transfer. Do not confuse the modeled example with the System itself.

The planned [Problem-framing Spike](../research/explorations/2026-10-05-problem-framing-assumption/README.md) tests whether separating observation, interpretation, cause, outcome, and response improves understanding. It has not been conducted.

The [Warehouse Management System modernization inquiry](../research/explorations/2026-10-05-warehouse-web-modernization/README.md) applies these distinctions to a legacy-to-web replacement scenario. It is an initial hypothesis-based exploration; no legacy behavior or user needs have yet been independently verified.

The planned [AI-assisted WMS authoring Spike](../research/explorations/2026-10-05-ai-assisted-wms-authoring/README.md) explores Terms and Types for builders using AI under limited discovery time and an impending knowledge-transfer constraint. It has not been conducted.

### Preserving Learning Toward Code

Paper artifacts are not disposable: keep the question, assumptions, examples, observations, findings, decisions, and rationale. Maintain a traceable—but not necessarily one-to-one—path:

**Problem / Evidence → outcome → concepts, rules, Contracts → candidate capabilities → later implementation and tests.**

This supports future engineering; it does not imply automatic code generation.

## Design Lenses

- **“Don’t Write Features”:** feature requests are clues, not the System definition. Connect capabilities to Problems, outcomes, and coherent responsibilities. This is a working interpretation of *Righting Software*, not a complete account; see [official site](https://rightingsoftware.org/) and [contents](https://www.informit.com/store/righting-software-9780136524038).
- **Structure and flow:** People, Places, and Things offer a simple lens on a Domain. Time can be implicit in their actions and changes; a static inventory alone does not express sequence or duration. Commands, events, and views are optional lenses, not universal primitives or a commitment to event sourcing.
- **Abstraction:** remove detail to expose essentials, but preserve context, meaningful variation, and traceability to examples.
- **What and how:** focus on intended outcomes, while recognizing feasibility, quality attributes, medium, operations, and tradeoffs can reshape what is needed. Experiments can inform understanding without committing to production implementation.
- **Iteration and naming:** expect concepts and boundaries to change as examples teach us more. Names such as “Feature” and “Work Item” are provisional until they consistently distinguish the kinds of things the Domain needs; revise the model rather than force unlike cases into one label.

## Keep in View

Problem framing is perspective-laden; evidence for one claim does not prove another. A consistent model may still be wrong or useless. Validation can be structural, domain-specific, or judgment-based. Completeness is not usefulness.

The exploration can inform a separate “how” discussion when users, purpose, candidate outcomes, key Terms, representative cases, constraints, risks, and unresolved questions are understood well enough to choose what to investigate next—not when every uncertainty is eliminated.
