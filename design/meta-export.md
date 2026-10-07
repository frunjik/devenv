# MetaExport

**Recorded:** 2026-10-07

**Status:** Provisional concept; candidate structure and illustrative JSON drafted, not an authoritative schema.

**Method:** [Example-Led Knowledge Modeling](./example-led-knowledge-modeling.md).

## Meaning and Scope

A transferable collection of concern-planning, development/meta, and meta/meta knowledge; not a receiving system, MetaLayer, or implemented exporter. Initial scope excludes SubjectDomain (WMS) and Problem Inquiry application knowledge.

KnowledgeArea identifies subject; MetaLayer identifies perspective. They are not interchangeable.

**Usage note (user):** `SystemConcern` spans Domains and MetaLayers, matching the Glossary's "System Concern". Preserve each Concern's context.

## Commit Process Example

The [Markdown MetaExport example](./meta-export-example.md) packages the current statements, override meaning, and interpretation checks without requiring repository access to understand them.

Use [Commit Process](./commit-process.md), including its [observed trial](./commit-process.md#example-led-trial-the-documentation-commit). A recipient without repository access must distinguish:

- Readiness, commit request, message approval, execution, and outcome acceptance.
- Current instructions and superseded rules.
- Reusable procedure and local preferences.

Preserve meaning, context, authority, sources, dates/revisions, overrides and unaffected rules, dependencies, evidence limits, unresolved decisions, and adoption requirements. Include supporting content, not merely repository links. The example's baseline predates the initiation and attribution overrides.

These are proposed transfer checks, not demonstrated success.

## KnowledgeStatement

**User-agreed name and boundary:** One independently referenceable, revisable assertion: instruction, definition, proposal, or observation. Processes combine statements. KnowledgeStatement is not synonymous with Evidence or Artifact.

## Boundaries and Next Step

Sources remain authoritative; these documents are derived. Export does not authorize recipient adoption. Keep conflicts explicit.

Ask for further names, derive the Type, try JSON, check preserved meaning, then contrast an in-scope example before choosing authority.

No complete self-contained export, external transmission, authoritative schema, tooling, or production code is agreed. Rule Set's relationship remains unresolved; SC-049 is not completed.

## Resumable Workflow

**Progress (2026-10-07):** Steps 2–3 have a candidate structure with user-approved field names and a [JSON subset](./meta-export-example.json), preserving instruction revisions. Preliminary interpretation checks are recorded in the [example](./meta-export-example.md#preliminary-meaning-check). Resume at step 4. Editorial corrections, partial/multiple replacements, structured references, and export completeness remain unresolved; no recipient validation has occurred.

Complete one step at a time. Record decisions, remaining questions, and the next step here before pausing. Ask for new names before adoption; keep proposals distinct from agreed meaning.

1. **Review the example:** Check each candidate KnowledgeStatement against current sources. Split independently revisable assertions, identify missing dependencies, and confirm scope and completeness.
2. **Describe the candidate Type:** Agree names and meanings for the necessary parts, relationships, and constraints. Preserve authority, provenance, overrides, and local context without treating overlapping concepts as exclusive categories.
3. **Try JSON:** Encode the commit-process example as a documentation experiment, not production code or an authoritative schema.
4. **Check meaning:** Test the existing interpretation scenarios against the JSON. Confirm no lost approval requirements, revived superseded rules, or observations mistaken for authorization. Record failures and revise steps 2–3.
5. **Contrast:** Try an in-scope provisional definition or meta/meta observation. Refine the model without forcing all knowledge into process rules.
6. **Choose authority:** Decide which representation is maintained and which views are derived. Resolve the relationship to Rule Set and how revisions, dependencies, and conflicts are handled.
7. **Prepare the local export:** Assemble selected statements and necessary supporting content. Check understanding without repository access; identify omissions and recipient adaptation requirements.
8. **Review completion:** Present the artifact, checks, and limitations for user review. Assess SC-049 separately: this example alone does not establish import, hydration, or persistence.

Schema validation, generators, import tooling, production code, and external transmission require separate scope decisions. Commit only on explicit request, with message approval.
