# MetaExport Example: Glossary Refinement

**Recorded:** 2026-10-07

**Source system:** DevEnv, repository `frunjik/devenv`, reviewed at revision `0f98efc`.

**Status:** Reviewed Markdown and JSON example; narrative-only distinctions are accepted for this example, not as an agreed schema or complete export.

## Context

This example transfers selected development/meta knowledge about three Terms refined in DevEnv: KnowledgeArea, MetaLayer, and SubjectDomain. It uses Domain (WMS) as supporting context for distinguishing a Domain from a KnowledgeArea. It does not export WMS operational knowledge or claim that the WMS examples establish facts about warehouse operations.

The recipient must distinguish:

- A Term's definition from its example and from reported usage.
- A Domain in which a Term is known to occur from a Domain in which its meaning is defined.
- A confirmed usage assignment from an unknown or unrecorded assignment.
- A user-approved decision from an unresolved question or a provisional concept.

The Glossary contains the current definitions and recorded `Domains:` lines. The Glossary Refinement document records decision history, rationale, and limits needed to interpret them. These sources have complementary roles; a recipient should not treat this example as a new independent source of truth.

## Current Term Meanings

### KnowledgeArea (WMS operations)

**Definition:** A subject used to classify knowledge, potentially spanning multiple Domains. Membership does not establish shared meaning, rules, or ownership.

**Name qualification:** "WMS operations" is part of the current entry name. It does not establish that the Term is used in the WMS Domain.

**Status and limit:** KnowledgeArea remains provisional. The qualification is an illustrative subject context, not a usage assignment.

### MetaLayer (DevEnv)

**Definition:** A named perspective from which another system, activity, or its description is examined, described, governed, or evaluated.

**Name qualification:** "DevEnv" is part of the current entry name and names the meta perspective on the system or activity it supports; it does not imply that every application is a MetaLayer.

**Status and limit:** The concept remains provisional. Retaining this wording does not establish a ranked layer hierarchy.

### SubjectDomain (WMS AI)

**Definition:** The Domain being investigated or supported.

**Name qualification:** "WMS AI" is part of the current entry name and names a subject context; it does not assert that the Term's known usage includes the WMS Domain.

### Supporting distinction: Domain (WMS)

**Definition:** A bounded context of activity in which concepts, entities, relationships, and rules have particular meanings.

This supporting Term distinguishes a Domain as a context of meaning from a KnowledgeArea as a subject used to classify knowledge. It is included for interpretation, not as an additional in-scope Term in this refinement.

## Recorded Usage

The following assignments were reviewed individually and approved by the user on 2026-10-07. Here, a listed Domain means known occurrence of the Term, not ownership of its definition.

| Term | Known usage Domains | Basis recorded in the source |
|---|---|---|
| KnowledgeArea (WMS operations) | Meta | Used in this work to classify knowledge. The warehouse-operations example does not establish WMS usage. |
| MetaLayer (DevEnv) | DevEnv, Meta | DevEnv's host UI/toggle uses the meta-layer concept; this work uses the broader perspective concept. Occurrence does not establish identical meanings. |
| SubjectDomain (WMS AI) | Meta | Used here to identify the Domain under investigation. Its example and presence in the Glossary do not establish WMS or DevEnv usage. |

Other usage remains unknown, not absent. A parenthesized example, a Term's appearance in DevEnv's Glossary, or KnowledgeArea membership is not sufficient evidence for an additional usage assignment. In particular, `WMS` in the Term names above must not be converted into a WMS usage assignment.

`Meta` is the selected label for the context of reasoning about systems, development practices, and their evaluation. Its exact boundary remains unsettled, and it is not synonymous with MetaLayer (DevEnv).

## Sources and Authority

- [Glossary](../.glossary): current definitions, names, and recorded usage lines.
- [Glossary Refinement](./glossary-refinement.md): user decisions, provisional status, rationale, source interpretations, and unresolved boundaries.
- User decisions recorded on 2026-10-07: KnowledgeArea's meaning and provisional status; retained MetaLayer and SubjectDomain meanings; the three individually reviewed usage assignments; and the distinction between known usage and defining-Domain ownership.

These are derived summaries. The Markdown sources provide traceability and context; this example alone does not prove Domain facts or authorize adoption by another system.

## JSON Trial

The [JSON trial](./glossary-meta-export-example.json) uses the already-agreed candidate field names `id`, `revisions`, `revision`, `assertion`, `context`, `source`, and `applicability`. It contains one illustrative current revision for each of eight readable, example-local KnowledgeStatement identities. The IDs and revision numbers do not establish a global identity or source revision scheme.

The candidate can carry each definition, usage assignment, source, provisional qualification, and interpretation rule as readable assertion and narrative context. However, the JSON does not structurally distinguish a Term definition from a usage relationship or an example, nor does it provide typed links from a Term to a Domain. Those distinctions remain text in `assertion` and `context`; a consumer cannot reliably query them without interpreting prose. Source and authority details also remain narrative. No new field or Type is adopted by this trial.

## Meaning Checks

| Check | Markdown and JSON result |
|---|---|
| Explain why Domain and KnowledgeArea are distinct without claiming classification establishes shared meaning, ownership, or hierarchy. | Preserved in the Domain definition, KnowledgeArea definition, and their contexts. |
| Do not infer usage from Term names, examples, Glossary display, or KnowledgeArea membership. | Preserved as an explicit interpretation assertion and in each relevant context. |
| Preserve the three approved assignments and report other usage as unknown rather than absent. | Preserved as three usage assertions and an explicit interpretation assertion. |
| Distinguish provisional KnowledgeArea and MetaLayer concepts from settled universal rules. | Preserved in definition applicability and source context. |
| Treat parenthesized name qualifications as explanatory, not as additional assignments or evidence of WMS operational behavior. | Preserved in the assertion contexts, but not as a separately queryable example relationship. |

## Limits and Next Modeling Step

This is a selected example, not a complete export. The JSON uses an existing provisional KnowledgeStatement structure but does not resolve whether definitions, examples, and usage relationships should remain untyped assertions or use separately represented relationships. The trial does not select an authoritative transfer representation or establish recipient adoption.

**User decision (2026-10-07):** Accept the narrative-only distinctions for this example. This does not adopt the model as an authoritative schema or settle whether a Term-to-Domain usage relationship should be represented separately.

Explore a more structured candidate model later during the MetaExport workflow. A Term-to-Domain usage relationship remains a candidate for further Type review because it has distinct meaning and provenance; no new Type name or structure is adopted here.
