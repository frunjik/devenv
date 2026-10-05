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

**Kind:** Behavior · **Status:** In progress · **Depends on:** SC-001

Keep each interpretation traceable to its original inbox artifact and relevant wording, so reviewers can inspect what it was based on.

**Working rules:**

- Preserve the received artifact as-is; do not replace it with normalized or converted text.
- A source reference identifies the artifact and, where practical, a location or excerpt. A file containing several reports needs finer location than a standalone report.
- Allow many-to-many links: one interpretation may draw on several passages, and a passage may inform several interpretations.
- Keep provenance separate from evidential force. A source link shows origin, not that the interpretation is true.
- Preserve source status (for example, synthetic sample versus observed report) without upgrading it during conversion.

**Type review:** The first slice now uses `SourceReference` for optional artifact identity and locator. It does not yet model immutable artifact versions or a separate identity-bearing `SourceFragment`; decide whether either is needed when file import is in scope. Do not store source text only in a converted note.

**Open questions:** What locators remain stable as files change? Is retaining an exact excerpt sufficient, or must the original artifact be immutable/versioned? How should non-text sources be referenced?
**Validation evidence:** Compared with the synthetic inbox set: two files contain multiple passages, standalone files contain one report, and all are marked synthetic. No real source or domain-user review yet.

### SC-003 — Represent uncertain conversion

**Kind:** Behavior · **Status:** In progress · **Depends on:** SC-001, SC-002

Treat conversion as a proposal that can retain ambiguity, missing information, and multiple interpretations instead of inventing certainty.

**Working rules:**

- Preserve source wording; keep each interpretation visibly separate from reported text.
- Allow a source fragment to yield zero, one, or several candidate notes, and a note to cite several fragments.
- Separate alternative explanations into distinct claims. For example, a rejected quantity may be a domain rule, a configuration error, or still unknown.
- For the first manual slice, capture open questions; assumptions and confidence are not modeled yet. Do not treat omitted uncertainty as resolved.
- Do not create a Problem Ticket merely because a note has been structured.

**Type review:** `NoteProposal` and `SourceReference` now model one tentative interpretation, source, and open questions. The current slice supports only one interpretation per submission. A separate Type for each explanation is not justified; multiple proposals can be explored later.

**Open questions:** Is confidence useful to reviewers, or should uncertainty be expressed only through evidence and questions? Which claim kinds help without forcing classification?
**Validation evidence:** Walked through synthetic WMS-011 and the corpus questions: both need competing interpretations and explicit unknowns. Not tested with users or real reports.

### SC-004 — Define human review

**Kind:** Behavior · **Status:** In progress · **Depends on:** SC-003

Decide how a person reviews, edits, accepts, defers, or rejects a conversion before it appears in the converted-items list.

**Decision (user, 2026-10-05):** Require explicit review and acceptance; list accepted notes only.

**Working rules:** Creating a proposal does not accept it. `Accept` emits an imported note; it does **not** certify truth or promote it to a Problem Ticket. `Revise` returns the proposal to editable input while preserving its source. Promotion to a Problem Ticket remains a distinct decision. Defer/reject are not yet supported in the local, non-persistent slice; do not imply they are durably recorded.

**Type review:** This implies distinct proposal and accepted-note lifecycles. Avoid one ambiguous boolean such as `accepted`; keep review outcome separate from source verification and Problem Ticket status.

**Open questions:** Who may promote an accepted note to a Problem Ticket? Should revisions be versioned or is retaining prior decisions sufficient? Are defer/reject needed before persistence exists?
**Validation evidence:** User selected explicit acceptance and an accepted-only list. Converter now previews proposals and exposes separate revise/accept actions; public tests cover both. No domain-user review yet.

### SC-005 — Preserve sample provenance

**Kind:** Quality · **Status:** In progress · **Depends on:** SC-002

Keep synthetic examples distinguishable from observed or verified WMS reports during import and display.

**Working rules:** Mark generated examples as synthetic and never present them as operational reports. Keep source origin (synthetic, external report, direct observation, system artifact, unknown) separate from verification (unreviewed, corroborated, disputed, unknown). Importing or accepting a note must not upgrade either.

**Type review:** `SourceOrigin` and `VerificationStatus` are now separate Types because they answer different questions. “Verified” needs supporting evidence and an accountable reviewer, not a self-asserted label. The component only records origin and defaults verification to `unreviewed`; later review behavior remains undefined.

**Open questions:** What counts as corroboration, and who can record it? Which real source classes are needed?
**Validation evidence:** Existing sample files explicitly label themselves synthetic; no real reported or verified cases to test distinctions against.

### SC-006 — Build the input converter

**Kind:** Implementation · **Status:** Validated · **Depends on:** SC-003, SC-004, SC-005

First slice: manually entered source text becomes a local, reviewable proposal. After explicit acceptance, the component emits an imported note. No AI call, file-system access, persistence, or Problem Ticket promotion. Keep source text, optional artifact/location, origin, and open questions; verification remains `unreviewed`.

**Excluded:** Loading inbox files, AI-generated interpretations, persistence, Problem Ticket promotion, and durable defer/reject history. One submission yields one proposal; revising returns to the form. One proposal is handled at a time.

**Validation evidence:** Seven public-interface tests cover manual proposal creation, provenance, uncertainty, explicit acceptance, and revision. Statement, branch, function, and line coverage are each 100%; shared and client builds pass. Synthetic inputs only; no domain-user validation.

### SC-007 — Define the converted-items list

**Kind:** Behavior · **Status:** Ready · **Depends on:** SC-004, SC-005

Decide which converted items appear and how review status, source, and unresolved fields are shown.

**Working view contract:**

- The primary list contains accepted imported notes, whether or not they have been promoted to Problem Tickets.
- Do not include unreviewed, deferred, or rejected proposals in this list. Keep their source available to the review workflow; a separate history view is not in this slice.
- Each row exposes interpretation, original text, source reference/origin, verification state, unresolved questions, and acceptance time.
- Acceptance means “accepted as a useful note,” not “verified fact.” Never hide uncertainty or source status.
- Empty and populated states must be distinguishable. An unavailable state is unnecessary for this in-memory-only slice.

**Decision (user, 2026-10-05):** Only explicitly accepted notes appear in the primary list. A created proposal is not accepted.

**Working scope:** Simple in-memory list; no filtering, grouping, history, or detail view in the first slice.

**Open questions:** Review field usefulness after the first view is tried.
**Validation evidence:** Derived from the requested converted-notes list and synthetic examples; no user review. The non-inclusion of deferred/rejected items is provisional.

### SC-008 — Build the converted-items list

**Kind:** Implementation · **Status:** In progress · **Depends on:** SC-007

Build and test one list component against the agreed display behavior. Treat it as a separate slice from the converter.

**Open questions:** None for the local in-memory view.
**Validation evidence:** Not started.

### SC-009 — Connect the vertical slice

**Kind:** Implementation · **Status:** Blocked · **Depends on:** SC-006, SC-008

Connect converter and list while preserving the source-to-result link and review outcome.

**Working boundary:** Parent page owns an in-memory collection of `ImportedNote`s; acceptance appends to it and the list receives it as input. No persistence.
**Open questions:** Which route/page should host the slice?
**Validation evidence:** Not started.

The dependency order does not authorize building both components together.

## Working Sequence

1. Resolve enough of SC-001–SC-005 to define the converter boundary and observable behavior.
2. Implement and validate SC-006 alone using Red-Green-Refactor.
3. Complete explicit acceptance in SC-006; resolve remaining list presentation questions in SC-007.
4. Implement and validate SC-008 alone using Red-Green-Refactor.
5. Integrate and verify SC-009.

For each coding slice, derive tests from the synthetic inbox inputs and known Problem Domain scenarios where possible. Test through public interfaces, use only simple boundary mocks, and meet the project's full-coverage principle.

Do not combine component implementation slices. Keep AI and persistence outside SC-006 unless new domain evidence and an explicit decision change its scope.

## Type Review

Implemented Types: `NoteProposal`, `SourceReference`, `SourceOrigin`, `VerificationStatus`, and `ImportedNote` (accepted proposal plus acceptance time). No additional list Type is needed: the view consumes accepted notes. Optional identity-bearing `SourceFragment` and a review-decision record remain open. A stable `ImportedNoteId` is not yet justified for this append-only, in-memory slice; revisit if editing, deduplication, or persistence is introduced. Do not collapse proposal, accepted note, verification, and Problem Ticket lifecycles.

Review this register as examples reveal missing concerns. Add entries rather than silently folding distinct concerns together; record decisions and validation evidence when they become available.
