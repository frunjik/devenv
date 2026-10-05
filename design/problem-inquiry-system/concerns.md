# Problem-Inquiry System Concerns

**Status:** Active register; domain names and future workflow decisions remain revisable.

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

**Kind:** Domain · **Status:** Validated · **Depends on:** None

Distinguish raw text, an imported note, and a Problem Ticket. Decide when an imported note qualifies as a ticket; do not assume one-to-one conversion.

**Working distinction:**

- **Inbox artifact:** the received file or message, retained as-is.
- **Source fragment:** a verbatim passage from an artifact; it may be incomplete or unrelated to a Problem.
- **Imported note** *(provisional name)*: an interpretation attached to one or more fragments. It may remain a question, observation, or uncertain claim; it is not yet an accepted Problem.
- **Problem Ticket:** a deliberately framed, context-bound undesirable condition with an affected party and reason it matters. It can be informed by multiple notes; one note may produce multiple candidate Problems.

For example, WMS-011's raw wording asks whether a validation error is a domain rule or a system defect. The import should preserve that uncertainty; it should not turn either explanation into a Problem fact without more evidence.

**Type review:** Keep `InboxArtifact`, `SourceFragment`, provisional `ImportedNote`, and `ProblemTicket` distinct where their lifecycle/provenance differs. A fragment is not automatically a domain Type, and plain text need not become a wrapper Type without behavior or constraints.

**Decision (user, 2026-10-05):** Frame a **Problem Ticket** with an undesirable condition, who or what is affected in context, and why the condition matters. Cause may remain uncertain if the condition and impact are clear. Otherwise retain the item as a note or question. Acceptance of a note does not certify truth or promote it to a ticket.

**Provisional term:** **Imported note** remains the current type/UI label, not a confirmed domain name. It is neutral and matches current workflow language; revisit with real-user feedback.

**Type review:** `ProblemTicket.report: string` currently hides the confirmed framing; `WorkContext` describes surrounding context but does not explicitly identify who or what is affected, and there is no impact field. Add a `ProblemFrame` value Type with explicit condition, affected party/thing, and impact. Do not add a root-cause field: the user confirmed cause may remain uncertain.

**Open questions:** Revisit the framing against more real reports before automating promotion; ask real users whether “Imported note” is the right term. Validate the business meanings and context of “Release stock,” “recipient,” and “article” before defining them; retain unidentified technical tokens verbatim rather than expanding them by guess.
**Validation evidence:** User confirmed the framing rule on 2026-10-05. `ProblemTicket` now has a distinct `ProblemFrame` with required condition, affected party/thing, and impact; it has no cause field. The synthetic WMS ProblemSet records these frames while retaining the original report text. A public-contract test checks all sample tickets contain each part. Compared against inaccessible/unknown-purpose screens (WMS-001, WMS-012), uncertain cause (WMS-011), and interrupted/repeated operations (WMS-004, WMS-010). On 2026-10-06, the user supplied a sanitized WMS account of a stock-release screen becoming unusable after an error whose technical reference was not found in the inspected screen XML. The condition and impact are frameable while the cause remains unresolved. The single account is not independently corroborated; terms and identifiers remain context-dependent candidates.

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

**Proposed working rule:** During manual entry, preserve the exact submitted text and the user-provided artifact/locator as supplied. For future file import, retain the original artifact unchanged and identify a passage with a stable fragment label where available, otherwise a line range or excerpt; treat a locator as navigation aid, not proof. Do not introduce content hashing, version storage, or non-text attachment Types until persistence/file-import requirements establish their need.

**Type review:** `SourceReference` supports an optional artifact and locator, but does not guarantee identity, immutability, or a stable fragment. A separate identity-bearing `SourceFragment` is a candidate only if import, versioning, or many-to-many passage reuse needs it. Keep `SourceOrigin` separate from provenance and verification.
**Type review from the sanitized report:** Mentioning a runtime message and a separately inspected screen XML does not yet justify a new cross-artifact-reference Type. If both artifacts later need independent navigation or comparison, reassess the existing `SourceFragment` candidate and many-to-many source-link rule.

**Open questions:** Validate the proposed locator fallback when file import is designed. Define versioning and non-text source handling only when those source kinds enter scope.
**Validation evidence:** Compared with the synthetic inbox set: grouped operator and corpus files contain multiple passages, standalone reports contain one, and all are marked synthetic. The current manual slice retains entered source text and optional artifact/locator but does not import or freeze files. A sanitized user-provided report (2026-10-06) refers to a stock-release screen and a separately inspected screen XML; the report does not identify the artifact version or a locator, and the XML itself was not supplied. This demonstrates why the account and inspected artifact should remain distinct and why an absent reference in one artifact does not establish cause. File-import locator behavior still needs validation.

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

**Proposed working rule:** For the manual slice, express uncertainty as explicit open questions and, when useful, separate alternative interpretations into separate proposals. Do not add a numeric confidence field yet: the synthetic material gives no calibrated basis for one, and uncertainty is already visible in the source wording and questions. Do not force claim-kind classification during capture.

**Type review:** `NoteProposal` represents one interpretation and its open questions; it does not assert that one source has only one interpretation. Multiple proposals can share source text. A `ClaimKind` or confidence Type is not justified until a later workflow demonstrates a decision or behavior that depends on it.

**Open questions:** Revisit only if reviewers need to compare alternatives together or a downstream decision demonstrably requires confidence/claim classification.
**Validation evidence:** Walked through WMS-011, which explicitly leaves warehouse rule versus setup defect unresolved, and the grouped corpus questions, which also offer multiple explanations. A sanitized user-provided account on 2026-10-06 adds a runtime error and an inspected screen XML with no visible matching reference; neither the absent reference nor the error text establishes a root cause. This supports preserving exact wording, artifact boundaries, and open questions rather than inferring a defect or configuration cause. No independent corroboration or user evaluation of alternative-proposal presentation yet.
**Type review:** Existing `ProblemFrame`, `NoteProposal`, and `SourceReference` suffice for the reported condition, impact, exact text, and unresolved cause in this manual slice. The words “Release stock,” “recipient,” and “article,” and the tokens `qtemple` and `dflt`, are not defined as Glossary terms from this single context; preserve their wording and defer definitions until a domain user or artifact establishes their meaning.

### SC-004 — Define human review

**Kind:** Behavior · **Status:** Validated · **Depends on:** SC-003

Decide how a person reviews, edits, accepts, defers, or rejects a conversion before it appears in the converted-items list.

**Decision (user, 2026-10-05):** Require explicit review and acceptance; list accepted notes only.

**Decision (user, 2026-10-05):** Ticket creation is another explicit human action, separate from accepting a note. A person frames the ticket from one or more accepted notes; one accepted note may inform multiple tickets.

**Working rules:** Creating a proposal does not accept it. `Accept` emits an imported note; it does **not** certify truth or promote it to a Problem Ticket. `Revise` returns the proposal to editable input while preserving its source. Creating a ticket requires explicit framing and does not upgrade source verification. Defer/reject are not durably recorded in the local, non-persistent slice.

**Type review:** Keep proposal acceptance, source verification, and ticket creation as distinct transitions. A ticket-note relationship must support many-to-many links.

**Open questions:** Durable review history, roles, and authorization remain out of scope until persistence or multiple users are introduced.
**Validation evidence:** User decisions require separate explicit note acceptance and human ticket framing. Public-interface tests verify that proposal review and acceptance do not create tickets, and that explicit ticket framing uses accepted-note links while collecting ticket fields without inference. The components are connected in the inquiry page but retain separate lifecycles. Synthetic inputs only.

### SC-005 — Preserve sample provenance

**Kind:** Quality · **Status:** In progress · **Depends on:** SC-002

Keep synthetic examples distinguishable from observed or verified WMS reports during import and display.

**Working rules:** Mark generated examples as synthetic and never present them as operational reports. Keep source origin (synthetic, external report, direct observation, system artifact, unknown) separate from verification (unreviewed, corroborated, disputed, unknown). Importing or accepting a note must not upgrade either.

**Type review:** `SourceOrigin` and `VerificationStatus` are now separate Types because they answer different questions. “Verified” needs supporting evidence and an accountable reviewer, not a self-asserted label. The component only records origin and defaults verification to `unreviewed`; later review behavior remains undefined.

**Proposed working rule:** Preserve `synthetic` origin and `unreviewed` verification through proposal, revision, acceptance, and display. Later, use `corroborated` only when supporting evidence is recorded; use `disputed` only when contrary evidence or an explicit challenge is recorded. Do not define automatic verification transitions.

**Open questions:** Define what evidence qualifies as corroboration or dispute, who may record it, and whether further source-origin categories are needed when real reports enter the system.
**Validation evidence:** All inbox examples in the repository are synthetic or invented; they are not operational evidence. The converter emits `unreviewed`, and acceptance does not upgrade status. The user supplied one sanitized first-hand account on 2026-10-06 and separately described inspecting a screen XML; the underlying artifact and identity of the reporter are not recorded here, and the report has not been independently corroborated. This reinforces that reported origin and verification must remain distinct. Corroboration/dispute criteria and reviewer accountability remain undefined.

### SC-006 — Build the input converter

**Kind:** Implementation · **Status:** Validated · **Depends on:** SC-003, SC-004, SC-005

First slice: manually entered source text becomes a local, reviewable proposal. After explicit acceptance, the component emits an imported note. No AI call, file-system access, persistence, or Problem Ticket promotion. Keep source text, optional artifact/location, origin, and open questions; verification remains `unreviewed`.

**Excluded:** Loading inbox files, AI-generated interpretations, persistence, Problem Ticket promotion, and durable defer/reject history. One submission yields one proposal; revising returns to the form. One proposal is handled at a time.

**Validation evidence:** Seven public-interface tests cover manual proposal creation, provenance, uncertainty, explicit acceptance, and revision. Statement, branch, function, and line coverage are each 100%; shared and client builds pass. Synthetic inputs only; no domain-user validation.

### SC-007 — Define the converted-items list

**Kind:** Behavior · **Status:** Validated · **Depends on:** SC-004, SC-005

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
**Validation evidence:** User decided accepted-only; implementation tests cover populated and empty states, provenance, verification, and open questions. Synthetic examples only; defer/reject history remains out of scope.

### SC-008 — Build the converted-items list

**Kind:** Implementation · **Status:** Validated · **Depends on:** SC-007

Build and test one list component against the agreed display behavior. Treat it as a separate slice from the converter.

**Open questions:** None for the local in-memory view.
**Validation evidence:** Three public-input tests pass. Combined converter/list coverage is 100% statements, branches, functions, and lines. Shared and client builds pass.

### SC-009 — Connect the vertical slice

**Kind:** Implementation · **Status:** Validated · **Depends on:** SC-006, SC-008

Connect converter and list while preserving the source-to-result link and review outcome.

**Working boundary:** Parent page owns an in-memory collection of `ImportedNote`s; acceptance appends to it and the list receives it as input. No persistence. The page is available at `/problem-inquiry`.
**Open questions:** None for this local vertical slice.
**Validation evidence:** A public-interface integration test confirms proposals remain absent until explicit acceptance, after which the accepted note and its `unreviewed` status appear in the list. A route test confirms `/problem-inquiry` resolves to the page. All four slice tests pass; converter, list, page, and route each have 100% statement, branch, function, and line coverage. The client build passes and the TypeScript diagnostics report no errors.

### SC-010 — Visualize the current system plan

**Kind:** Implementation · **Status:** Validated · **Depends on:** None

Provide a read-only client view of the current concern plan, including concern status, dependencies, and overall progress. Keep it separate from the note-conversion workflow.

**Working boundary:** The existing Markdown concern register remains authoritative. The first UI is a manually synchronized snapshot; it does not edit concerns or infer completion. Make that limitation visible so a stale view is not mistaken for live plan data.
**Open questions:** Should the plan later be loaded from structured data or made editable?
**Validation evidence:** The read-only page shows all ten concerns, their types, dependencies, status, and a progress summary; it is available from navigation at `/system-plan`. Public-interface tests verify the summary, concern list, dependencies, and snapshot limitation. The page and route have 100% statement, branch, function, and line coverage; the client build passes. Snapshot data was checked against this register; no plan editing or live synchronization is claimed.

### SC-011 — Define note-to-ticket relationships

**Kind:** Behavior · **Status:** Validated · **Depends on:** SC-001, SC-004

Define whether note acceptance creates a ticket and how tickets retain the notes that informed them.

**Decision (user, 2026-10-05):** A person explicitly frames a Problem Ticket from one or more accepted notes. One accepted note may inform multiple tickets. Note acceptance alone never creates a ticket.

**Type review:** Ticket provenance needs identity-bearing accepted notes and a many-to-many note/ticket relationship. Keep source-note identity separate from ticket ID and source artifact provenance.

**Open questions:** The relation is in-memory only for the first framing slice; persistence and identity across reloads remain deferred.
**Validation evidence:** User selected explicit human framing, one or more notes per ticket, and one note reusable by multiple tickets. No automatic promotion.

### SC-012 — Collect complete ticket framing

**Kind:** Behavior · **Status:** Validated · **Depends on:** SC-001, SC-011

Define what a human must supply when framing a ticket from accepted notes.

**Decision (user, 2026-10-05):** Collect all current `ProblemTicket` fields explicitly: title, report, condition, affected party/thing, impact, scope, work context, and reporter. Record the creation time at submission. Do not infer missing fields from linked notes.

**Working boundary:** The initial form is local and in-memory. Scope level, scope label, context people/places/things, and reporter are entered by the human; date ranges remain optional as in `WorkContext`.

**Type review:** Reuse `ProblemFrame`, `ProblemScope`, and `WorkContext`; do not add parallel representations for the form. The ticket must retain the IDs of its selected accepted notes.

**Open questions:** None for a local form using the existing `ProblemTicket` contract.
**Validation evidence:** User confirmed the complete field set for the first human ticket-framing form on 2026-10-05. No user/domain validation of the wording beyond this decision.

### SC-013 — Add identity and provenance links

**Kind:** Implementation · **Status:** Validated · **Depends on:** SC-011

Give locally accepted notes identities so a ticket can cite one or more notes and the same note can be reused. Ticket source-note links are optional only to preserve direct-import records that were not created by the framing workflow; tickets created through that workflow must cite one or more accepted notes.

**Working boundary:** IDs need to be unique only within the current in-memory session; reload loses notes and tickets together. No persistence or cross-session identity is implied.
**Open questions:** None for the in-memory slice.
**Validation evidence:** Accepted notes receive sequential in-memory IDs (`note-1`, `note-2`, ...); the shared `ImportedNote` and `ProblemTicket` contracts carry note identity and source-note links. Public-interface tests verify distinct identities and multiple source links. Client component coverage: 100% statements, branches, functions, and lines; shared and client builds pass; all 148 client tests pass.

### SC-014 — Build the ticket-framing component

**Kind:** Implementation · **Status:** Validated · **Depends on:** SC-012, SC-013

Build a separate component that selects accepted notes and explicitly frames one ticket with every required field.

**Working boundary:** One ticket per explicit submission. Do not edit or verify linked notes and do not infer ticket fields from them.
**Open questions:** None for the defined in-memory form.
**Validation evidence:** The standalone component requires one or more currently accepted note links and explicitly captures title, report, problem frame, scope, work context, reporter, and creation time. It generates an in-memory ticket ID, normalizes creation time to ISO, and emits only after valid submission. Public-interface tests cover successful framing, field and note validation, unavailable notes, scope/time validation, empty-note state, and sequential IDs. Component coverage is 100% statements, branches, functions, and lines; client build passes.

### SC-015 — Build the framed-ticket list

**Kind:** Implementation · **Status:** Validated · **Depends on:** SC-012, SC-013

Build a separate view of explicitly created Problem Tickets and their linked accepted notes.

**Working boundary:** In-memory only; preserve each ticket's own frame and show its source-note references.
**Open questions:** None for the local list.
**Validation evidence:** The standalone read-only list presents each ticket's report, problem frame, scope, work context, reporter, creation time, and source-note links. It shows available note source text and interpretation, and clearly identifies unlinked tickets and unavailable note records. Public-interface tests cover empty state, multiple tickets reusing a note, unavailable links, tickets with no references, and empty work-context categories. Component coverage is 100% statements, branches, functions, and lines; client build passes.

### SC-016 — Connect note framing to ticket review

**Kind:** Implementation · **Status:** Validated · **Depends on:** SC-014, SC-015

Connect accepted notes, explicit ticket framing, and the framed-ticket list without collapsing their separate lifecycles.

**Working boundary:** The parent page owns in-memory notes and tickets. A source note can be linked to multiple tickets; only an explicit completed form creates a ticket.
**Open questions:** None for the in-memory vertical slice.
**Validation evidence:** The inquiry page passes accepted notes to the framing form and ticket list, and adds emitted tickets to a separate in-memory collection. Public-interface tests verify that accepting a note alone creates no ticket and that explicit framing creates a ticket linked to the accepted source. Page coverage is 100% statements, branches, functions, and lines; client build passes. At a 320 px viewport, the integrated page has no horizontal overflow and converter controls remain within the component width.

### SC-017 — Toggle sample and real data

**Kind:** Behavior · **Status:** Validated · **Depends on:** SC-005, SC-016

Add a toggle to the inquiry data views. In the combined mode, show sample and real data together; when switched, show only real data. Switching back restores the combined view. Filtering changes visibility only and must not modify or delete records.

**Working boundary:** Apply the visibility choice consistently to accepted notes and framed tickets.
**Decision (user, 2026-10-06):** Real-only shows only notes with a known non-synthetic origin; `unknown` is excluded. A ticket appears in real-only only when it has one or more linked notes and every linked note is currently available with known non-synthetic origin. Thus mixed-provenance tickets, unlinked tickets, and tickets with unavailable source notes are hidden. Toggling affects visibility only; records are retained.
**Open questions:** None for this in-memory visibility slice. Verification remains distinct from origin: a known non-synthetic source is not necessarily verified.
**Validation evidence:** The page toggle switches accepted notes, ticket-form note choices, and framed tickets together. Public-interface tests cover synthetic, external-report, direct-observation, system-artifact, and unknown origins; retain all underlying notes when filtered; restore the combined view; and hide mixed, unlinked, empty-link, and unavailable-source tickets. Page coverage is 100% statements, branches, functions, and lines; client build passes.

### SC-018 — Explore a wide-screen inquiry layout

**Kind:** Design · **Status:** Validated · **Depends on:** SC-016

Evaluate how the inquiry workflow can use wide displays more effectively. Compare the current stacked arrangement with a responsive grid-based alternative, considering how the converter, accepted-note list, ticket-framing form, and framed-ticket list relate.

**Working boundary:** This is a layout exploration, not a commitment to use a grid. Keep narrow-screen behavior usable and avoid reducing readability to fill available width.
**Open questions:** Which sections should share a row or column at desktop sizes? Should the grid follow workflow stages, or place inputs beside their resulting lists? What viewport widths should trigger layout changes?
**Decision:** Use paired columns on wide screens: the converter beside accepted notes, and the ticket-framing form beside framed tickets. Keep a single-column flow below 70rem.
**Validation evidence:** The responsive grid was inspected in the browser at 320, 768, 1024, and 1440 px. No horizontal overflow occurs; the paired workflow sections sit side by side at 1440 px and stack below the breakpoint. The grid makes use of wide space but does not materially reduce total page height in the empty state because the explicit ticket form remains tall; compacting or changing that form is outside this layout decision.

### SC-019 — Clarify what a system concern is

**Kind:** Domain · **Status:** Validated · **Depends on:** None

Clarify the meaning and purpose of a “concern” in the system plan, including how it differs from a `Work Item` and whether it should be defined in the project Glossary.

**Decision (user, 2026-10-06):** Use **System Concern** as a project-planning term: a topic or uncertainty needing attention while shaping or evaluating a System; it may be resolved through evidence or a decision, or lead to one or more Work Items. It is not itself necessarily a Work Item.
**Working boundary:** A concern is a planning category, not a new domain Type. Register entries may need different statuses and evidence because they represent different kinds of attention; do not collapse their underlying concepts into one domain model.
**Open questions:** Whether the concern register should eventually distinguish its kinds as separate planning record Types remains a future modeling question; no behavior currently depends on such a change.
**Validation evidence:** User accepted the project-planning definition and Glossary addition on 2026-10-06. `.glossary` now defines `System Concern` separately from `Work Item`. No new domain Type was added; the plan's `PlanConcern` remains a read-only view projection.

### SC-020 — Record note review decisions

**Kind:** Domain · **Status:** Ready · **Depends on:** SC-006

Decide whether rejecting or deferring a note proposal is recorded, and what a decision records (outcome, reason, time). Today only acceptance exists.

**Working boundary:** Decide the policy first; do not add a review-decision Type until its fields are agreed.
**Open questions:** Are rejected proposals kept or discarded? Is a reason required? Can a deferred proposal be revisited?

### SC-021 — Define ticket lifecycle

**Kind:** Domain · **Status:** Ready · **Depends on:** SC-016

Decide whether a framed ticket can be edited, closed, or marked duplicate after creation, and who may do so. Tickets are currently immutable once framed.

**Working boundary:** Decide the policy first; do not collapse note, verification, and ticket lifecycles.
**Decisions (user, 2026-10-06):** States are Open, Assigned, Resolved, Closed, and Duplicate. Flow is forward (Open → Assigned → Resolved → Closed); reopening is allowed from Resolved or Closed. A ticket marked Duplicate must reference the ticket it duplicates. Framed content (title, report, problem frame, scope) may be edited after creation, and the edit history is kept. Anyone may change state or edit for now; every change records who made it (by user id and optional name, see SC-028) and when.
**Settled (user, 2026-10-06):** Duplicate may be set from any state, and a Duplicate may be reopened. Assigned requires an assignee, and unassigning returns the ticket to Open. The change history is its own Type: a list of ticket change events per ticket, each with kind, actor (name), time, and before/after values.
**Open questions (agent, to settle before building):** What does the list show for state (a badge and the assignee)? Is the ticket change event Type shared or client-only?
**Scope note:** Assignment itself is SC-029; this concern only defines states and history. SC-020 (note review decisions) is deferred and not on the path to assignment.

### SC-024 — Integrate the problem-solving app into the host app shell

**Kind:** Design · **Status:** Validated · **Priority:** High · **Depends on:** None

The system plan and problem-inquiry pages belong to the "solving problems with AI" domain, while the existing menu and screens belong to the host (meta) application layer. Find a way for the host to visibly "dock" or include the problem-solving app so they read as one coherent product rather than two mixed-in sets of screens.

**Working boundary:** Clarify the relationship before changing structure. Existing shell, menu, and routing code may only change with permission and an explanation (P-006).
**Direction (user, 2026-10-06):** The meta (host) layer is hidden by default, with the problem-solving app shown on its own. A small switch enables the meta layer, which then visually surrounds the inner app to show that it governs it. Switching off hides the layer again.
**Decisions (user, 2026-10-06):** The switch is a small fixed corner toggle, always visible but unobtrusive. The on/off state persists across reloads. When enabled, the frame shows the existing host menu plus a header labeling the layer. Enabling is presentation only; routes are unchanged. The problem-solving app comprises the inquiry and system-plan screens; everything else in the host menu is host.
**Open questions:** None for this slice. Future refinements (for example a keyboard shortcut for the switch) can be new concerns.
**Permission (user, 2026-10-06):** Approved changes to the app component, its template, styles, and spec (P-006).
**Validation evidence (first slice):** A `MetaLayerService` (localStorage behind an injectable storage, hidden by default) and a fixed corner `MetaLayerToggleComponent` were added. The app shell shows the navigation toolbar, a "Meta layer" label, and the status toolbar only when enabled, and frames the routed outlet; routes are unchanged and status polling continues while hidden. The choice persists across reloads. New and touched files have 100% statements, branches, functions, and lines; full client suite (173 tests) and build pass. DOM checks at 320, 768, and 1440 px show no horizontal overflow and the toggle does not overlap the status bar. The frame currently wraps every routed screen. The host (meta) buttons live only in the outer app, so normally only problem-domain items are visible: the inner app has its own always-shown navigation (Problem inquiry, System plan), and the host toolbar (without the duplicate system-plan link, permission granted 2026-10-06) appears only with the meta layer. On narrow screens the toolbar is a compact single scrollable row. The navigation toolbar now has its own spec with 100% coverage; full client suite (176 tests) and build pass.
**Settled (user, 2026-10-06):** State is stored in browser localStorage behind a small service; tests use a simple fake storage. On narrow screens the menu collapses to a compact bar above the inner app and the frame stays thin. The glossary is host (a general tool) but is searchable from inside the problem-solving app (SC-023).
**Vocabulary candidates (P-009, not yet agreed):** "meta app/layer", "host", "dock", "domain app". Decide whether any need Glossary entries.

### SC-022 — Improve glossary screen layout and styling

**Kind:** Design · **Status:** Ready · **Depends on:** None

Evaluate the existing glossary screen's layout and styling for readability: term/definition hierarchy, spacing, long definitions, and behavior from 320 px to wide screens.

**Working boundary:** Presentation only; do not change glossary content or its data source. Surrounding styles may only change with permission (P-006).
**Open questions:** Should terms be a list, cards, or a definition grid? Should related terms be linked? Is grouping or alphabetical navigation needed?

### SC-023 — Quick glossary search from anywhere

**Kind:** Behavior · **Status:** Ready · **Depends on:** SC-022

Find a way to look up a glossary term quickly from any screen without leaving the current work.

**Working boundary:** Decide the interaction before building; it must not disrupt the underlying page state. Options to compare: global keyboard shortcut opening a search overlay, a persistent header search field, or a floating button with a popover.
**Open questions:** Which shortcut or trigger? Does it match term names only, or definitions too? Should selecting a result open the glossary screen or show the definition inline? How does it work on touch devices?

### SC-025 — Explore an AI chatbot inside the meta app

**Kind:** Design · **Status:** Ready · **Depends on:** SC-024

Explore whether an AI chatbot can live inside the meta (host) layer, so it is available around the problem-solving app without being part of it.

**Working boundary:** Exploration only. Do not add AI calls, keys, or a backend integration until the purpose, data exposure, and decision authority are agreed. Earlier decisions keep AI outside SC-006 and require explicit human acceptance of anything it proposes.
**Open questions:** What is the chatbot for (answering questions, drafting note proposals, explaining glossary terms, helping frame tickets)? Does it see the current screen or only what the user pastes? May it create or change notes and tickets, or only suggest? Where does it appear (panel, drawer, floating button) and does it show only with the meta layer on? Which model or service, and where do credentials and conversation history live? How are real-world reports kept from leaving the sandbox (privacy)?
**Vocabulary candidates (P-009, not yet agreed):** "chatbot", "assistant", "AI", "proposal". Decide whether any need Glossary entries and whether AI output relates to `NoteProposal`.

### SC-026 — Sort and search the problem ticket list

**Kind:** Behavior · **Status:** Validated · **Depends on:** SC-015, SC-017

Let the user sort the list of framed problem tickets on different properties and find tickets with a search field that matches their description.

**Working boundary:** View-only: sorting and searching change visibility and order, never the underlying records, and must compose with the sample/real data filter (SC-017).
**Decisions (user, 2026-10-06):** Search matches the ticket title, report, and problem-frame fields (condition, affected, impact), case-insensitive substring with diacritics ignored. Sortable on creation time, title, scope level, and reporter; default is newest first by creation time. Applies to tickets only for now (notes later if needed). Choices are not persisted and reset on reload; an empty result shows a "no matching tickets" message.
**Open questions:** None for this slice. Notes may later get the same controls.
**Assumptions (agent, 2026-10-06; revisit if wrong):** Each property has a default direction (creation time newest first; title, scope, and reporter ascending) and the direction button toggles it; changing property resets to that default. Tickets with a missing or unreadable value sort last in either direction. Scope level sorts by width (operation, workflow, system, cross-system), not alphabetically. The empty message is "No matching tickets." when search hides everything; when the sample/real filter leaves no tickets the existing "No framed problem tickets yet." shows.
**Validation evidence:** The framed-ticket list has a search field and a sort selector with a direction toggle. Public-interface tests cover default order, each property, direction, missing values, case/accent-insensitive search over title, report, and problem-frame fields, non-searched fields, the no-match message, and sort-plus-search. The list component and page have 100% statements, branches, functions, and lines; full client suite (191 tests) and build pass. Verified in the browser with two tickets: search filters, "No matching tickets." shows, and there is no horizontal overflow at 320, 768, and 1440 px. Records are never modified.
**Vocabulary note (P-009):** In this concern, "description" means the searchable text fields above, not a separate ticket field.

### SC-027 — Scope glossary terms by domain level

**Kind:** Design · **Status:** Ready · **Depends on:** SC-019, SC-022

Terms in the glossary may come from different domains (the WMS problem domain, the problem-solving app, the meta/host layer, general engineering), and the same word may mean different things in each. Decide how the glossary represents that.

**Working boundary:** Decide the model before changing `.glossary` or the glossary screen. Options to compare: (a) separate glossaries per domain; (b) one global glossary where each term carries a level/domain marking; (c) one global glossary where a term can have a distinct definition per domain.
**Open questions:** Which levels exist (e.g. meta, problem-solving app, WMS domain)? Can one term appear in several levels with different meanings? Does the marking become a filter in the glossary screen (SC-022) and quick search (SC-023)? How does this relate to the host vs problem-solving split (SC-024) and to P-009 vocabulary review? Is the marking a Type (a Domain/Level value) rather than free text (P-002)?
**Leaning (agent, not decided):** Option (b) first: one searchable global glossary with a level marking, since quick search from anywhere (SC-023) works best over one set; split later only if collisions appear.

### SC-028 — Persist notes and tickets across reloads

**Kind:** Design · **Status:** Ready · **Depends on:** SC-021

Accepted notes, review decisions, and framed tickets currently live in memory and are lost on reload. Decide how they are stored.

**Working boundary:** Decide the storage approach before building. Options to compare: browser storage behind a small service (as in SC-024), the existing server with a database, or exported/imported files.
**Decisions (user, 2026-10-06):** Storage lives on the server, with a database. The specific database is not chosen yet: first define a storage interface (port) that the server and tests use, and pick the engine later. Data is shared by several users from the start. Only framed tickets and their change history (SC-021) are stored first; notes later. Each ticket carries a data-kind flag (sample or real) and the existing toggle (SC-017) filters on it. Concurrent changes use a per-ticket version number: a stale change is rejected and the current version is shown.
**Decisions (user, 2026-10-06, identity):** A user is identified by a unique id plus an optional display name. The server issues the id on first use and the browser remembers it; there is no login yet. The user may set or change the name later; change history records the id and the name as it was at that time. This refines SC-021, where "by name" now means by user id with the optional name. A browser that loses its remembered id becomes a new user (accepted limitation until real login exists).
**Open questions (agent, to settle before building):** Does the client talk to the server over the existing Express API, and what are the minimal operations (list, create, change)? Is the stored ticket shape the shared `ProblemTicket` Type plus state, assignee, version, and data kind? Who creates ticket ids (server)? Until the engine is chosen, does a simple in-memory implementation of the interface serve as the first one? Is the user a new shared Type (id, optional name)? Is an assignee (SC-029) a user id?

### SC-029 — Assign problem tickets

**Kind:** Behavior · **Status:** Ready · **Depends on:** SC-021, SC-028

Let a user assign a framed problem ticket to someone from the problem-solving app.

**Working boundary:** Decide the model before building. Assignment is likely a lifecycle step (SC-021) and meaningless without persistence (SC-028).
**Open questions:** Is an assignee a person, a team, or a role, and is that a new Type (P-002)? One assignee or several? Does assigning mean "responsible for resolving" or "asked to investigate"? Who may assign, and is real user identity needed or are names enough for now? Can tickets be reassigned, and is the history kept? Should the list (SC-026) filter or sort by assignee?
**Vocabulary candidates (P-009, not yet agreed):** "assign", "assignee", "owner".

### SC-030 — Define a calm, consistent color system

**Kind:** Design · **Status:** Ready · **Depends on:** SC-024

This app is meant to be looked at for long periods. Define a small, deliberate palette (tokens) instead of per-component hex values, and apply it consistently, including the meta layer versus the problem-solving app.

**Working boundary:** Agree the palette and token names before restyling anything. Restyling existing components is a separate slice per area (P-006 applies to surrounding code), and nothing is recolored by this concern alone.
**Investigation (agent, 2026-10-06; measurements, not decisions):**
- The app is dark with a muted, green-tinted base (`#171d19` body, `#1e2821` cards, `#26332b` panels, `#27352d` toolbars, text `#c3cec5`, headings `#dce6dd`, link `#a8c4ae`). About 60 distinct hex values are spread over 12 files with no shared tokens, so near-duplicates drift (e.g. borders `#37443b`, `#34443a`, `#2b3830`, `#29352e`).
- Contrast against the base surface is healthy: body text 10.6:1, muted `#9ba99e` 7.0:1, link 9.1:1, validated `#88b791` 7.5:1, warning `#d6b66e` 8.8:1, error `#d69a90` 7.2:1 (WCAG AA needs 4.5:1). On the panel surface the muted text drops to 5.4:1, still passing but the lowest.
- Outliers that clash with the dark scheme: the framed-ticket list and ticket-framing form use light-theme slate/white (`#fff`, `#f8fafc`, `#cbd5e1`, `#475569`); the meta toggle uses indigo `#3f51b5` with a `#555` icon that is 2.3:1 on the base, below the 3:1 non-text minimum; `styles.scss` still imports the Material `pink-bluegrey` prebuilt theme, whose pink and blue accents can leak into Material components.
- Observation: saturated colors are rare and used only for status, which suits long sessions; the problem is mainly the lack of tokens plus the few light and indigo outliers.
**Proposed palette (for review, not agreed):** keep the dark, low-saturation, green-tinted neutrals as the base; reduce them to five surface steps (base, raised, panel, toolbar, border) and three text steps (primary, muted, heading); one calm green accent for the problem-solving app (`#a8c4ae` link, `#4f7059` filled); one distinct but equally muted cool slate-blue accent (about `#9db4cf`, 8.0:1 on the base) reserved for the meta layer so it reads as a different layer; semantic colors limited to ok `#88b791`, warn `#d6b66e`, error `#d69a90`. Avoid pure white and pure black, avoid saturated accents, keep at least 4.5:1 for text and 3:1 for icons and borders that carry meaning.
**Open questions:** Dark only, or also a light theme (and does the OS preference decide)? Does the meta layer get its own accent hue, or only a different surface? Where do the tokens live (CSS custom properties in `styles.scss`, mapped into the Material theme variables)? Should the Material prebuilt theme be replaced by a custom one? Should the palette be checked automatically (contrast tests) or only reviewed by eye? Do colors need to remain distinguishable for color-blind users beyond the status text labels?
**Vocabulary candidates (P-009, not yet agreed):** "token", "surface", "accent", "palette".

The dependency order does not authorize building both components together.

## Working Sequence

1. Resolve enough of SC-001–SC-005 to define the converter boundary and observable behavior.
2. Implement and validate SC-006 alone using Red-Green-Refactor.
3. Complete explicit acceptance in SC-006; resolve remaining list presentation questions in SC-007.
4. Implement and validate SC-008 alone using Red-Green-Refactor.
5. Integrate and verify SC-009.
6. Present the concern plan as a read-only snapshot in SC-010; keep the Markdown register authoritative.
7. Define note-to-ticket provenance and explicit framing in SC-011–SC-012.
8. Add note identity and provenance links in SC-013.
9. Build the ticket-framing component in SC-014, then the framed-ticket list in SC-015, one component per slice.
10. Integrate those components in SC-016.
11. Define and implement the sample/real visibility toggle in SC-017.
12. Explore a more effective wide-screen inquiry layout in SC-018.
13. Clarify the “Concern” planning term and its relationship to Work Items in SC-019.

For each coding slice, derive tests from the synthetic inbox inputs and known Problem Domain scenarios where possible. Test through public interfaces, use only simple boundary mocks, and meet the project's full-coverage principle.

Do not combine component implementation slices. Keep AI and persistence outside SC-006 unless new domain evidence and an explicit decision change its scope.

## Type Review

Implemented Types: `NoteProposal`, `SourceReference`, `SourceOrigin`, `VerificationStatus`, and `ImportedNote` (accepted proposal plus acceptance time). The page holds a readonly collection of `ImportedNote`s and replaces it on acceptance; this append-only slice does not require a new collection or identity Type. No additional list Type is needed: the view consumes accepted notes. The plan UI uses a local `PlanConcern` view Type and `ConcernStatus` union to keep the displayed status explicit; these are projections of the Markdown register, not a new domain source of truth. Optional identity-bearing `SourceFragment` and a review-decision record remain open. A stable `ImportedNoteId` is not yet justified for this append-only, in-memory slice; revisit if editing, deduplication, or persistence is introduced. Do not collapse proposal, accepted note, verification, and Problem Ticket lifecycles.

Review this register as examples reveal missing concerns. Add entries rather than silently folding distinct concerns together; record decisions and validation evidence when they become available.

## Meta Notes

Observations about the planning system itself (P-010). These are proposals, not decisions.

- **2026-10-06 — Same data in two shapes:** The concern register exists as Markdown (`concerns.md`) and again as a hand-maintained TypeScript snapshot plus count assertions in `system-plan.component`. Every concern change touches both, and the counts drifted in several commits. Consider generating the dashboard data from the register, or deriving the test counts from the data.
- **2026-10-06 — Priority is ad hoc:** SC-024 introduced a `Priority` line and a "High priority." summary prefix, but the register and dashboard have no priority field. Consider whether priority is a first-class attribute and where it is shown.
- **2026-10-06 — One numbering, many kinds:** SC-NN mixes Domain questions, Design explorations, Behavior slices, and implementation slices, with different lifecycles. Consider whether the Kind should be reflected in the ID or in a filter on the dashboard, in line with the SC-019 note about separate planning record Types.
- **2026-10-06 — Entries grow into logs:** Concerns accumulate Direction, Decision, Settled, Permission, and Validation evidence lines, written in slightly different shapes. Consider a fixed set of entry fields.
- **2026-10-06 — Three ID schemes, none a standard:** `SC-NN` (System Concern, planning), `P-NNN` (Principle, working rules), and the in-app record IDs `note-N` and `ticket-N` are all home-grown, hand-assigned, and unrelated to external conventions (Jira-style keys, ADR numbers, requirement IDs). The meaning of each prefix is only discoverable by reading the files. Consider documenting the prefixes in the Glossary, deciding whether SC and P should share a common shape, and whether the in-app IDs should stay in-memory counters once persistence arrives. Also consider whether decisions deserve their own ADR-style records instead of living inside concern entries.
- **2026-10-06 — Host vs problem-solving app:** SC-024 shows the same two-layer split elsewhere: the glossary is host yet is wanted inside the problem-solving app (SC-023), and the register is both a project planning artifact and a feature of the app. Consider a glossary entry for the layers once the terms are agreed.
