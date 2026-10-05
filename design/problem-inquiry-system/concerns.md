# Problem-Inquiry System Concerns

**Status:** Initial register; concerns and names are provisional.

Use this register to order system work without implementing multiple components in one step. A concern may describe a domain uncertainty, system behavior, quality constraint, or implementation slice. Resolve prerequisites first; implement and validate one component at a time using Red-Green-Refactor.

## Concern Record

Use one Markdown section per concern:

```text
### SC-000 — Short title
Kind: ...
Status: ...
Depends on: ...

Description in ordinary language.
Open questions: ...
Validation evidence: ...
```

`dependsOn` names actual prerequisites, not merely related work. A concern can remain open while a dependent concern is explored, but implementation should not assume its unresolved decisions.

## Initial Register

The entries below are design concerns, not implementation commitments. Status reflects current progress.

### SC-001 — Distinguish input from ticket

**Kind:** Domain · **Status:** In progress · **Depends on:** None

Distinguish raw text, an imported note, and a Problem Ticket. Decide when an imported note qualifies as a ticket; do not assume one-to-one conversion.

**Working distinction:**

- **Inbox artifact:** the received file or message, retained as-is.
- **Source fragment:** a verbatim passage from an artifact; it may be incomplete or unrelated to a Problem.
- **Imported note** *(provisional name)*: an interpretation attached to one or more fragments. It may remain a question, observation, or uncertain claim; it is not yet an accepted Problem.
- **Problem Ticket:** a deliberately framed, context-bound undesirable condition with an affected party and reason it matters. It can be informed by multiple notes; one note may produce multiple candidate Problems.

For example, WMS-011's raw wording asks whether a validation error is a domain rule or a system defect. The import should preserve that uncertainty; it should not turn either explanation into a Problem fact without more evidence.

**Type review:** Keep `InboxArtifact`, `SourceFragment`, provisional `ImportedNote`, and `ProblemTicket` distinct where their lifecycle/provenance differs. A fragment is not automatically a domain Type, and plain text need not become a wrapper Type without behavior or constraints.

**Open questions:** Does “note” fit better than “candidate,” “report,” or another term? What minimum framing makes an imported interpretation a Problem Ticket?
**Validation evidence:** Compared against the existing synthetic inbox samples only; no real source or domain-user review yet.

### SC-002 — Preserve source provenance

**Kind:** Behavior · **Status:** Open · **Depends on:** SC-001

Keep a link from each converted item to its inbox artifact and source fragment, so reviewers can inspect the original wording.

**Open questions:** Can one item cite multiple fragments, or one fragment produce multiple items?
**Validation evidence:** None yet.

### SC-003 — Represent uncertain conversion

**Kind:** Behavior · **Status:** Open · **Depends on:** SC-001, SC-002

Treat conversion as a proposal that can retain ambiguity, missing information, and multiple interpretations instead of inventing certainty.

**Open questions:** Which uncertainties must be explicit to reviewers?
**Validation evidence:** None yet.

### SC-004 — Define human review

**Kind:** Behavior · **Status:** Open · **Depends on:** SC-003

Decide how a person reviews, edits, accepts, defers, or rejects a conversion before it appears in the converted-items list.

**Open questions:** What does each review outcome mean for the source and proposed item?
**Validation evidence:** None yet.

### SC-005 — Preserve sample provenance

**Kind:** Quality · **Status:** Open · **Depends on:** SC-002

Keep synthetic examples distinguishable from observed or verified WMS reports during import and display.

**Open questions:** What source labels and evidence qualify as verified?
**Validation evidence:** None yet.

### SC-006 — Build the input converter

**Kind:** Implementation · **Status:** Open · **Depends on:** SC-003, SC-004, SC-005

Build and test one input-converter component against the agreed input and review behavior, using its public interface.

**Open questions:** What exact interaction starts and completes a conversion?
**Validation evidence:** None yet.

### SC-007 — Define the converted-items list

**Kind:** Behavior · **Status:** Open · **Depends on:** SC-004, SC-005

Decide which converted items appear and how review status, source, and unresolved fields are shown.

**Open questions:** Are deferred or rejected items listed, and how are they distinguished?
**Validation evidence:** None yet.

### SC-008 — Build the converted-items list

**Kind:** Implementation · **Status:** Open · **Depends on:** SC-007

Build and test one list component against the agreed display behavior. Treat it as a separate slice from the converter.

**Open questions:** None recorded.
**Validation evidence:** None yet.

### SC-009 — Connect the vertical slice

**Kind:** Implementation · **Status:** Open · **Depends on:** SC-006, SC-008

Connect converter and list while preserving the source-to-result link and review outcome.

**Open questions:** What boundary carries accepted results between components?
**Validation evidence:** None yet.

The dependency order does not authorize building both components together.

## Working Sequence

1. Resolve enough of SC-001–SC-005 to define the converter boundary and observable behavior.
2. Implement and validate SC-006 alone using Red-Green-Refactor.
3. Resolve SC-007; then implement and validate SC-008 alone using Red-Green-Refactor.
4. Integrate and verify SC-009.

For each coding slice, derive tests from the synthetic inbox inputs and known Problem Domain scenarios where possible. Test through public interfaces, use only simple boundary mocks, and meet the project's full-coverage principle.

## Type Review

Current candidates: `SourceFragment` with a source reference/location, and `ImportedNote` (or a better name) holding a tentative interpretation linked to one or more fragments. Do not add production Types until their responsibilities and validation examples are agreed.

Review this register as examples reveal missing concerns. Add entries rather than silently folding distinct concerns together; record decisions and validation evidence when they become available.
