# Inquiry: Replacing a Mature Warehouse System's Native UI

**Status:** Initial desk exploration; based only on the scenario provided  
**Mode:** Conceptual; no code, legacy inspection, or stakeholder interviews performed

## Subject

Builders are replacing a 30-year-old monolithic Warehouse Management System (WMS) with a web-based system. The existing system uses internal GUI-building means. It is not yet known which capabilities or primitives are needed for the web counterpart to replace native functionality completely.

## Problem Framing

The team must create a web-based WMS that preserves the operational outcomes and behavior users depend on, but the existing system's required capabilities are not yet fully understood or expressed independently of its native GUI mechanisms. If the team designs the replacement from visible screens or known implementation primitives alone, important workflows, rules, information, or exceptional cases may be missed.

This is a hypothesis derived from the prompt, not a validated finding. The precise affected users, current failures, scope of “complete replacement,” and consequences of omissions remain unknown.

## Important Distinctions

- The **native GUI primitives** are implementation mechanisms; they are evidence about the old system, not automatically requirements for the new one.
- A **screen or control** is not necessarily the underlying user capability or warehouse rule.
- **Parity** may mean preserving outcomes and operational behavior, not reproducing every internal mechanism or visual detail.
- A **web primitive** should not be selected until the needed user and domain behaviors are understood.
- “Complete” needs a boundary: which roles, workflows, integrations, devices, reports, and exceptional conditions are included?

## Candidate Goal

Enable the intended warehouse roles to perform the in-scope work reliably using the web system, with the information, decisions, controls, and outcomes required by their workflows.

This is intentionally provisional. Users, operational conditions, and observable acceptance conditions have not been established.

## Assumptions and Unknowns

**Given:** the legacy system is approximately 30 years old, monolithic, uses internal GUI-building mechanisms, and the replacement is web-based; the necessary replacement primitives are unknown.

**Not established:** user roles; workflows; native-system boundaries; critical data and business rules; integrations; hardware or offline needs; current pain points; regulatory or audit duties; migration constraints; what “complete” means; and which behaviors are still relied upon.

## Working Hypotheses

1. The legacy system's behavior may be distributed across code, GUI construction, configuration, data, integrations, and operator knowledge; the visible interface alone may not reveal it all.
2. Decomposing by native GUI primitives risks copying accidental implementation structure or overlooking behavior not represented by a control.
3. A behavior-and-flow view may reveal requirements that a static screen inventory misses: actors' intentions, accepted changes, resulting facts, feedback, sequencing, and exceptions.
4. Some behaviors may be obsolete or harmful rather than requirements to preserve. “Exists today” does not prove “must exist in the replacement.”

These hypotheses require evidence and may be revised or rejected.

## What to Learn

- Who performs each important warehouse activity, where, with what devices, and under what time or connectivity constraints?
- What triggers the activity? What information is needed to decide or act?
- What can the user intend to do, and under what conditions can it succeed or be rejected?
- What facts change when it succeeds? What confirmation, exception, or follow-up becomes visible?
- Which rules, validations, sequencing, concurrency, and recovery behaviors are implicit in the legacy system?
- Which cases are rare but operationally critical?
- What workarounds reveal gaps in the official workflow?
- Which current behaviors are contractual, valuable, replaceable, unused, or candidates for deliberate change?
- What evidence would demonstrate that the web system safely supports an in-scope workflow?

## Suggested Inquiry Strategy

Select one bounded, representative workflow with knowledgeable participants. Trace it from trigger to outcome, including normal path, rejection, exception, and recovery. Use multiple forms of evidence where available: observation, user explanation, legacy screens, configuration, data, logs, reports, and relevant code. Keep direct observations distinct from interpretation and from proposed web behavior.

For each step, record:

**Actor and context → intention → required information → decision/rule → accepted change or rejection → resulting facts → feedback/next action.**

Compare this behavioral account with the native screens and controls. Note missing steps, contradictions, assumptions, and unresolved questions. Do not create a universal primitive catalogue from one workflow; compare further workflows before generalizing.

## Candidate Outcomes of the Inquiry

The inquiry should produce a clearer account of the selected workflow, its evidence and unresolved questions, and a reasoned distinction between:

- behavior that must be preserved;
- behavior that may be intentionally changed or retired;
- native mechanisms that are implementation-specific;
- candidate concepts or capabilities needing further validation.

No findings have been established yet. Preserve the inquiry path and rationale so later design and implementation can be traced to the operational need, not merely to legacy controls.
