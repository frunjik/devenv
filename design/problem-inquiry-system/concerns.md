# Problem-Inquiry System Concerns

**Status:** Initial register; concerns and names are provisional.

Use this register to order system work without implementing multiple components in one step. A concern may describe a domain uncertainty, system behavior, quality constraint, or implementation slice. Resolve prerequisites first; implement and validate one component at a time using Red-Green-Refactor.

## Concern Record

Each entry records:

```text
SystemConcern {
    id
    statement
    kind: domain | behavior | quality | implementation
    status: open | ready | in-progress | validated | deferred
    dependsOn: SystemConcernId[]
    openQuestions
    validationEvidence
}
```

`dependsOn` names actual prerequisites, not merely related work. A concern can remain open while a dependent concern is explored, but implementation should not assume its unresolved decisions.

## Initial Register

| ID | Kind | Concern | Status | Depends on |
|---|---|---|---|---|
| SC-001 | domain | Distinguish an incoming raw text fragment, an imported note, and a Problem Ticket. Decide when a note qualifies as a ticket; do not assume a one-to-one conversion. | open | — |
| SC-002 | behavior | Preserve source provenance from inbox artifact and fragment through any converted item, so reviewers can inspect the original wording. | open | SC-001 |
| SC-003 | behavior | Define conversion as a proposal that can retain ambiguity, missing information, and multiple possible interpretations rather than inventing certainty. | open | SC-001, SC-002 |
| SC-004 | behavior | Decide how a person reviews, edits, accepts, defers, or rejects a conversion before it enters the converted-items list. | open | SC-003 |
| SC-005 | quality | Keep synthetic examples distinct from observed or verified WMS reports throughout import and display. | open | SC-002 |
| SC-006 | implementation | Build one input-converter component against the agreed input and review boundary; test it through its public interface before production implementation. | open | SC-003, SC-004, SC-005 |
| SC-007 | behavior | Define which converted items appear in the list and how their review state, source, and unresolved fields are visible. | open | SC-004, SC-005 |
| SC-008 | implementation | Build one converted-items list component against the agreed list behavior; integrate only after its own public-interface tests are red. | open | SC-007 |
| SC-009 | implementation | Connect the converter and list as a vertical slice, preserving the source-to-result link and accepted review state. | open | SC-006, SC-008 |

All entries are open: these are design concerns, not decisions or implementation commitments. The ordering expresses dependencies; it does not authorize building both components together.

## Working Sequence

1. Resolve enough of SC-001–SC-005 to define the converter boundary and observable behavior.
2. Implement and validate SC-006 alone using Red-Green-Refactor.
3. Resolve SC-007; then implement and validate SC-008 alone using Red-Green-Refactor.
4. Integrate and verify SC-009.

For each coding slice, derive tests from the synthetic inbox inputs and known Problem Domain scenarios where possible. Test through public interfaces, use only simple boundary mocks, and meet the project's full-coverage principle.

## Type Review

**Strong candidate for a future Type:** `ImportedNote` (or a better name) with a source reference and proposed interpretation. The current `ProblemTicket` is structured as an already-classified problem, while inbox text may be ambiguous or fail to describe a Problem at all. Keep this as a candidate until SC-001 establishes the distinction; do not add a production Type solely to encode this register.

Review this register as examples reveal missing concerns. Add entries rather than silently folding distinct concerns together; record decisions and validation evidence when they become available.
