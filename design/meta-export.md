# MetaExport

**Recorded:** 2026-10-07
**Name:** User-selected, provisional.
**Stage:** Meaning and concrete example; candidate Type and JSON remain to be designed.
**Method:** [Example-Led Knowledge Modeling](./example-led-knowledge-modeling.md).

## Meaning

MetaExport is a provisional name for a transferable collection of gained knowledge about concern planning, development practices, and evaluation of those practices. Its purpose is to let another system understand selected knowledge without assuming access to this repository or treating every recorded statement as an instruction.

The name identifies the transfer collection, not the receiving system, a particular MetaLayer, or a commitment to implement an exporter.

## Agreed Initial Scope

The user chose concern-planning knowledge, development/meta practices, and meta/meta observations as the initial scope. SubjectDomain (WMS) knowledge and Problem Inquiry application knowledge are outside this first experiment.

The initial concrete example is [Commit Process](./commit-process.md). It is development/meta knowledge. Later examples may concern planning or evaluation; their different meanings must not be forced into a process-rule shape.

KnowledgeArea describes the subject of included knowledge. MetaLayer describes a perspective relative to what is examined or governed. They are not interchangeable, and the five KnowledgeAreas in the index are not automatically five numbered MetaLayers.

## Concrete Transfer Example: Commit Process

A receiving system needs enough information to distinguish:

- A verified scope from permission to commit it.
- An explicit request to commit from approval of a particular message.
- Current instructions from superseded instructions.
- Reusable procedure from repository-specific preferences and execution requirements.
- A successful commit from user acceptance of the delivered behavior.

The [Commit Process example](./commit-process.md) supplies the narrative procedure, sources, local settings, and behavioral examples. Its baseline revision does not contain the newer commit-initiation and attribution overrides, which were recorded in the working tree after that revision; that difference must remain explicit.

### Transfer Exercise

Imagine the recipient has no repository access. It receives the commit-process narrative and the relevant source excerpts rather than only links.

The recipient should be able to explain why:

1. Passing tests alone does not authorize a commit or an approval prompt.
2. An explicit commit request permits preparation, but the unseen subject still needs approval.
3. The older automatic-checkpoint instruction no longer controls initiation.
4. The source project's concern-prefix preference is not a universal naming rule.
5. Committing a change does not accept the concern's outcome.

These are proposed checks for the future representation, not evidence that a transfer has already succeeded.

## Information the Candidate Model Must Preserve

The example demonstrates the need to preserve:

- The knowledge's meaning, subject, context, and intended use.
- Whether a statement is an agreed instruction, a local preference, a proposal, or an observation.
- Its source, date, and applicable revision or uncommitted state.
- Which earlier instruction an override supersedes, and what remains unaffected.
- Dependencies and enough supporting content to understand them without local file access.
- Limits of evidence and unresolved decisions.
- Which parts require adaptation or explicit adoption by the recipient.

These are semantic requirements, not adopted field names or new Types. Identity and relationships may be needed to refer unambiguously to statements and overrides; the next modeling step should test that need against the example.

## Authority and Transfer Boundaries

Source records remain authoritative in this project. This document and the commit-process example are derived descriptions, not competing rule registers.

Recording or exporting a statement does not automatically authorize another system to apply it. The receiving context must decide what to adopt, adapt, or leave as reference material. Unknowns and conflicts must stay visible rather than be resolved through silent defaults.

No external destination, transmission, source-file move, schema, generator, or production-code change is agreed. No export is currently self-contained: the concrete narrative still references local sources, and supporting excerpts must be selected before a standalone package is claimed.

## Next Step

**Candidate name (user, 2026-10-07):** `KnowledgeStatement` names one individually referenceable piece of exported knowledge. It may express an instruction, definition, proposal, or observation, with its own authority and source. The name is agreed for the modeling experiment; its structure, variants, and constraints are not yet agreed. It is not synonymous with Evidence or the Artifact storing it.

**Boundary decision (user, 2026-10-07):** One KnowledgeStatement represents one independently revisable assertion. A complete process may be assembled from multiple statements. The [documentation-commit trial](./commit-process.md#example-led-trial-the-documentation-commit) supplies the concrete example; field names, a full Type structure, and JSON remain unresolved.

Derive a small candidate Type from the commit-process example, asking the user for names before adopting them. Then represent that example in JSON and compare it with the narrative. Try a contrasting in-scope example, such as a provisional concept or a meta/meta observation, before choosing an authoritative representation.

The existing Rule Set concept in SC-049 may describe part of the content, but its relationship to MetaExport is unresolved. This experiment does not complete SC-049.
