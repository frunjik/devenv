# Glossary Refinement (KnowledgeArea, MetaLayer, SubjectDomain)

**Started:** 2026-10-07. Documentation only.

## Scope

Refine three existing [Glossary](../.glossary) Terms and their distinctions, then try a MetaExport example of the agreed glossary knowledge. Keep definitions abstract; put concrete reference examples and usage policies separately.

The [commit-process MetaExport](./meta-export.md#resumable-workflow) remains paused at its saved checkpoint. This workflow does not expand that example or authorize code, external transmission, or commits.

## Starting Meaning

| Term | Current meaning | Concrete reference |
| --- | --- | --- |
| KnowledgeArea | A subject organizing knowledge; memberships can overlap and do not imply hierarchy or agreement. Provisional. | KnowledgeArea (concern-planning knowledge), from the Knowledge Index. |
| MetaLayer | A perspective examining, describing, governing, or evaluating another system or activity. | MetaLayer (development practices governing DevEnv work), a user-agreed descriptive example, not a new Term. |
| SubjectDomain | The Domain being investigated or supported. | SubjectDomain (WMS). |

## Steps

1. Review each meaning and its distinction from the other two. Resolve the concrete MetaLayer reference and target.
2. Propose concise refinements only where needed; obtain agreement before changing definitions.
3. Update agreed definitions and separate examples; check related guidance for contradictions.
4. Build a Markdown MetaExport example for the agreed glossary knowledge, preserving provisional status, sources, and context.
5. Try JSON using the candidate KnowledgeStatement model; expose mismatches rather than forcing definitions into instruction semantics.
6. Check preserved meaning and report limits. Feed any findings back to the paused MetaExport workflow without claiming its completion.

## Checkpoint

**Progress (2026-10-07):** Steps 1–3 completed for the agreed definition refinement. The user approved the concise KnowledgeArea definition and retained SubjectDomain and MetaLayer unchanged. KnowledgeArea remains provisional; approving this wording does not settle its adoption. The Starting Meaning table preserves the earlier summary.

**Latest refinement:** The user subsequently approved the Domain (WMS) and KnowledgeArea (warehouse operations) distinction recorded below. The earlier wording remains decision history; the Glossary contains the current definitions.

**Representation sync (user, 2026-10-07):** Sync only recorded content with the glossary UI Type and parser. GlossaryEntry now separates definitions and `Example:` lines while preserving actual Term names, including `Domain (WMS)` and `MetaLayer (DevEnv)`. No Domain assignments, sources, or revision fields are inferred. The API still returns lines; this is a local display Type refinement, not an adopted export model.

**Progress (2026-10-07):** Steps 4–6 are complete. The [Glossary MetaExport Example](./glossary-meta-export-example.md) records the Markdown example, an eight-statement [JSON trial](./glossary-meta-export-example.json), and meaning checks. The user accepted the JSON's narrative-only distinctions for this example; this is not an authoritative schema decision. A more structured model remains for later exploration in the MetaExport workflow.

**Remaining, deferred:** Explore whether definitions, examples, and Term-to-Domain usage relationships need separate structure when the MetaExport model is revisited. A usage relationship remains a Type candidate for review; no name or structure is adopted.

The example distinguishes subject from perspective: development practices can be organized as KnowledgeArea (development/meta practices), while MetaLayer (development practices governing DevEnv work) identifies their governing relationship to an activity. SubjectDomain (WMS) identifies the Domain being investigated, not a level in that organization.

This is concept clarification, not a new production Type conviction. A workflow title is not a new Glossary Term. Its relationship to SC-027 is vocabulary scope; subsequent export exploration relates to SC-049.

## Refinement Decision

**KnowledgeArea:** A subject by which knowledge is organized. Knowledge may belong to multiple KnowledgeAreas; membership implies neither hierarchy, ownership, nor agreement.

SubjectDomain retains its definition of the Domain being investigated or supported. MetaLayer retains its definition of a named perspective examining, describing, governing, or evaluating a target.

**Example decision (user, 2026-10-07):** Add separate example lines in the Glossary: KnowledgeArea (warehouse operations), MetaLayer (development practices governing DevEnv work), and SubjectDomain (WMS). The user chose warehouse operations instead of concern-planning knowledge for the KnowledgeArea example. These examples illustrate the abstract definitions; they are not usage policies or additions to the MetaExport payload scope.

KnowledgeArea membership does not establish a separate Domain. MetaLayer is provisional too; retaining its wording does not establish a ranked hierarchy. These qualifications remain context for transfer.

**Example-label refinement (user, 2026-10-07):** Use Domain (WMS) and MetaLayer (DevEnv) in the Glossary. MetaLayer (DevEnv) replaces the longer development-practices example above; earlier examples remain decision history. Under the unchanged MetaLayer definition, DevEnv names the meta perspective on the system or activity it supports, rather than implying that every application is a MetaLayer. SubjectDomain (WMS) remains unchanged. Example labels do not assign defining Domains to Terms.

**Term-name decision (user, 2026-10-07):** Include the examples in the actual Glossary entry names: `Domain (WMS)` and `MetaLayer (DevEnv)`, not merely separate display labels. This supersedes the separate-example presentation for these two entries; definitions remain general and unchanged. Earlier references to Domain and MetaLayer retain their meaning but omit the newly adopted example suffixes. Other entry names and production code are unchanged.

**Meaning/classification refinement (user, 2026-10-07):**

- **Domain (WMS):** A bounded context of activity in which concepts, entities, relationships, and rules have particular meanings.
- **KnowledgeArea (warehouse operations):** A subject used to classify knowledge, potentially spanning multiple Domains. Membership does not establish shared meaning, rules, or ownership.

These replace the earlier definitions to distinguish a context of meaning from subject classification. Knowledge can still belong to multiple KnowledgeAreas; classification alone establishes neither hierarchy nor agreement. KnowledgeArea remains provisional. SubjectDomain and MetaLayer (DevEnv) are unchanged.

## Domain Display Preparation

**KnowledgeArea name refinement (user, 2026-10-07):** Rename the Glossary entry to `KnowledgeArea (WMS operations)`, replacing the separate warehouse-operations example line. The definition and provisional status remain unchanged. Earlier wording above is decision history; this example does not establish a defining Domain or change export scope.

**SubjectDomain name refinement (user, 2026-10-07):** The current Glossary entry is `SubjectDomain (WMS AI)`, replacing `SubjectDomain` and its separate WMS example line. The user shortened the initial wording "AI for WMS" to "WMS AI". The definition remains unchanged. Earlier names and examples above are decision history; no defining-Domain assignment or export-scope change follows from this rename.

**Decision (user, 2026-10-07):** Display the Domain(s) where each Term's meaning is defined, not its KnowledgeArea memberships. Agree assignments before implementing the display.

Domain labels and assignments remain unresolved. Neither an example from SubjectDomain (WMS) nor use within DevEnv establishes where a Term's definition belongs. Do not convert the provisional KnowledgeArea mapping into Domain assignments.

Start with the three in-scope Terms. Identify their defining context and whether a shared definition is reused or different Domain-specific meanings are needed. Agree names and boundaries before assigning labels; expansion to other Terms and display implementation remain subsequent work.

### Domain Usage Label Decision

**User revision (2026-10-07):** The requested `domains` field on GlossaryEntry will identify Domains where the Term is known to occur, not where its meaning is defined. This supersedes the earlier defining-Domain display direction, not the distinction between definitions and usage.

**Selected labels:** WMS, DevEnv, and Meta. DevEnv follows the existing system-name spelling. Meta labels the context of reasoning about systems, development practices, and their evaluation; it is not synonymous with MetaLayer (DevEnv). Exact boundaries and per-Term assignments remain to be agreed.

Displaying a Term in DevEnv's glossary does not alone establish its use in the DevEnv Domain. Likewise, a parenthesized example does not establish usage within the example's Domain. Do not infer assignments from either, or from KnowledgeArea memberships.

Assignments are recorded in the per-Term review below; no code fields or source-format changes have been added yet. Unknown usage must not be presented as confirmed absence.

### Per-Term Usage Review

**User decision (2026-10-07):** Review Terms individually before assigning usage Domains.

| Term | Agreed known usage | Unresolved usage | Basis |
| --- | --- | --- | --- |
| KnowledgeArea (WMS operations) | Meta | WMS, DevEnv | Used here to classify knowledge; its warehouse example does not establish use within WMS. User-approved assignment, 2026-10-07. |
| MetaLayer (DevEnv) | DevEnv, Meta | WMS | DevEnv's host UI/toggle uses the meta-layer concept; this workflow uses the broader perspective concept. Occurrence does not establish identical meanings. User-approved assignment, 2026-10-07. |
| SubjectDomain (WMS AI) | Meta | WMS, DevEnv | Used here to identify the Domain under investigation; the example and glossary display do not establish other usage. User-approved assignment, 2026-10-07. |

**Representation decision (user, 2026-10-07):** Record `- Domains: DevEnv, Meta` lines in the Glossary, parse them into `domains: string[]` on GlossaryEntry, and display "Domain usage". Missing metadata displays "Usage Domains not recorded"; omitted labels mean unknown, not absent. The three assignments above are implemented; examples do not produce assignments. Empty labels surface an error. The API continues returning lines.

Type review: usage metadata is distinct from definitions and examples, justifying the additional field on the existing display Type. A separate Domain identity Type and structured evidence model remain candidates for later modeling, not necessary for this agreed string-label representation.

### AI MetaLayer Example

**User-proposed example (2026-10-07):** MetaLayer (AI examining and explaining WMS models and processes).

This fits the existing perspective definition: AI examines and explains WMS models and processes rather than merely performing warehouse operations. It is a descriptive example, not a new Term, an implemented capability, or a replacement for MetaLayer (DevEnv). It establishes neither a fixed layer hierarchy nor additional usage-Domain assignments.
