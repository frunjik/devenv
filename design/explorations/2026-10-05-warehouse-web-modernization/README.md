# Inquiry: Replacing a Mature Warehouse System's Native UI

**Status:** Updated desk exploration; based on the scenario description, not independent inspection
**Mode:** Conceptual; no code, screen-corpus analysis, or stakeholder interviews performed

See the companion [candidate Terms, Types, and Primitives model](./domain-model.md). It is exploratory and not validated against the actual screen corpus.

## Subject

Builders are replacing a roughly 30-year-old monolithic Warehouse Management System (WMS) with a web-based system. More than 400 screens are defined in a structure that is incomplete and still evolving. The screens contain information, but it is unclear which parts express warehouse-domain concerns and which express system or presentation concerns. The legacy system also uses internal GUI-building means; the primitives needed by the web counterpart are unknown.

## Problem Framing

The team must determine what the web WMS needs to preserve or deliberately change, but its large, evolving screen corpus has not yet been clearly interpreted as evidence about user work, domain information, business rules, and system-specific presentation or implementation. If screen definitions are treated as a complete and correctly classified specification, domain behavior may be missed or technical details may be mistaken for domain requirements. If they are ignored, valuable embedded knowledge may be lost.

This is a hypothesis based on the supplied description, not a validated finding. We have not inspected the screens or established whether their structure is consistent, what “information” they hold, or how omissions affect users.

## Important Distinctions

- The **native GUI primitives** are implementation mechanisms; they are evidence about the old system, not automatically requirements for the new one.
- A **screen definition** is an artifact containing information; it may mix user intent, domain concepts, business rules, navigation, presentation, and technical behavior. Its exact contents and organization are unknown.
- A **screen or control** is not necessarily the underlying user capability, Domain Type, workflow, or warehouse rule. One workflow may span screens; one screen may support several concerns.
- **Domain concern** (warehouse meaning and operational rules) and **system concern** (interaction, rendering, navigation, technical constraints) may be entangled in the definitions; their boundary is a question to investigate, not assume.
- More than 400 screens indicates a substantial body of material, but count alone does not establish completeness, complexity, usage, importance, or one-to-one replacement scope.
- **Parity** may mean preserving outcomes and operational behavior, not reproducing every internal mechanism or visual detail.
- A **web primitive** should not be selected until the needed user and domain behaviors are understood.
- “Complete” needs a boundary: which roles, workflows, integrations, devices, reports, and exceptional conditions are included?

## Candidate Goal

Enable the intended warehouse roles to perform the in-scope work reliably using the web system, with the information, decisions, controls, and outcomes required by their workflows.

This is intentionally provisional. Users, operational conditions, and observable acceptance conditions have not been established.

## Assumptions and Unknowns

**Given by the requester:** the legacy system is approximately 30 years old and monolithic; it uses internal GUI-building mechanisms; more than 400 screen definitions exist in an incomplete, evolving structure; they contain information whose domain-versus-system concern is unclear; the replacement is web-based; needed replacement primitives are unknown.

**Not established:** how screens are organized, duplicated, connected, or used; what information they contain; user roles and workflows; which definitions are active or obsolete; where rules and state changes live; the boundary between domain and system concerns; integrations; hardware or offline needs; current pain points; regulatory or audit duties; migration constraints; what “complete” means; and which behaviors are still relied upon.

## Working Hypotheses

1. The legacy system's behavior may be distributed across code, GUI construction, configuration, data, integrations, and operator knowledge; the visible interface alone may not reveal it all.
2. Screen definitions may mix domain and system concerns; classifying them without examples may force a false boundary.
3. Decomposing by native GUI primitives risks copying accidental implementation structure or overlooking behavior not represented by a control.
4. A behavior-and-flow view may reveal requirements that a static screen inventory misses: actors' intentions, accepted changes, resulting facts, feedback, sequencing, and exceptions.
5. The screen corpus may be incomplete, inconsistent, duplicated, or out of date because its structure is evolving; this must be assessed rather than presumed.
6. Some behaviors may be obsolete or harmful rather than requirements to preserve. “Exists today” does not prove “must exist in the replacement.”

These hypotheses require evidence and may be revised or rejected.

## What to Learn

- Who performs each important warehouse activity, where, with what devices, and under what time or connectivity constraints?
- What is a “screen definition” in this system, and what kinds of information does one contain?
- How are the 400+ screens grouped, linked, reused, parameterized, or selected at runtime? Which are active, exceptional, duplicate, or obsolete?
- What information is domain data, a business rule, user guidance, navigation, presentation, or technical configuration—and where is classification uncertain?
- Can a screen definition be linked to a user role, workflow step, command, resulting fact, view, or rule? Which links are explicit versus inferred?
- What triggers the activity? What information is needed to decide or act?
- What can the user intend to do, and under what conditions can it succeed or be rejected?
- What facts change when it succeeds? What confirmation, exception, or follow-up becomes visible?
- Which rules, validations, sequencing, concurrency, and recovery behaviors are implicit in the legacy system?
- Which cases are rare but operationally critical?
- What workarounds reveal gaps in the official workflow?
- Which current behaviors are contractual, valuable, replaceable, unused, or candidates for deliberate change?
- What evidence would demonstrate that the web system safely supports an in-scope workflow?

## Suggested Inquiry Strategy

First orient to the screen corpus without trying to classify all 400+ definitions: learn its organizing structure and choose one bounded, representative workflow with knowledgeable participants. Trace that workflow from trigger to outcome, including normal path, rejection, exception, and recovery. Follow the relevant screen definitions and compare them with other evidence where available: observation, user explanation, configuration, data, logs, reports, and relevant code. Keep direct observations distinct from interpretation and from proposed web behavior. Record where domain/system classification is unclear instead of forcing it.

For each workflow step, record:

**Actor and context → intention → required information → decision/rule → accepted change or rejection → resulting facts → feedback/next action.**

Compare this behavioral account with the relevant screen definitions and controls. Note missing steps, contradictions, assumptions, and unresolved questions. Do not create a universal primitive catalogue or claim corpus completeness from one workflow; compare workflows and screen-definition patterns before generalizing.

## Candidate Outcomes of the Inquiry

The inquiry should produce a clearer account of the selected workflow, its evidence and unresolved questions, and a reasoned distinction between:

- behavior that must be preserved;
- behavior that may be intentionally changed or retired;
- domain concepts and rules versus system/presentation mechanisms, including cases where the boundary remains uncertain;
- native mechanisms that are implementation-specific;
- candidate concepts or capabilities needing further validation.

No findings have been established yet. Preserve the inquiry path and rationale so later design and implementation can be traced to operational needs and evidence, not merely to legacy controls or screen counts.
