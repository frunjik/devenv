# Domain-Filtered Glossary Export

**Registered:** 2026-10-07. Pending exploration; output format and destination are undecided.

## Scope

Explore exporting Glossary Terms selected by their recorded known-usage Domain labels. "Domain-filtered" refers to usage labels such as `WMS`, `DevEnv`, or `Meta`; it does not mean that the Domain owns or defines the Term. Unknown usage must not be treated as confirmed absence.

This is separate from [MetaExport](./meta-export.md), which explores transfer of concern-planning and development/meta knowledge, and from [Term Editing](./term-editing-workflow.md), which concerns changing Glossary entries. This workflow does not authorize implementation, external transmission, or changes to the Glossary's source of truth.

## Steps

1. Clarify the intended consumer and destination, export format, selection behavior, and whether the output includes only Term names or also definitions, examples, usage labels, and supporting context.
2. Inspect current Glossary metadata and parser behavior. Confirm how recorded usage labels and unknown usage should appear in exported results; do not infer usage from entry names or examples.
3. Review necessary Types and relationships, and assess whether this is related to SC-027, SC-049, or another concern. Keep any Term-to-Domain usage relationship as a candidate until agreed.
4. Agree a bounded export contract and measurable success criteria before implementation. Preserve existing sources and unrelated entries; do not establish a second authoritative Glossary.
5. If implementation is authorized, use Red-Green-Refactor and validate public behavior, coverage, TypeScript safety, errors, and accessible user interaction where applicable.
6. Document results, limitations, remaining decisions, and user acceptance separately. External transmission and commits require separate permission.

## Checkpoint

**Next:** Step 1 when selected. The user clarified that the personal TODO item means exporting Terms according to their recorded known-usage Domain labels. The destination, format, consumer, and whether definitions or examples accompany selected Terms remain undecided. No implementation or System Concern association has been approved.
