# Example-Led Knowledge Modeling

**Recorded:** 2026-10-07
**Status:** User-agreed working pattern; not an implemented export format.

## Purpose

Develop a knowledge-transfer model from concrete meaning and examples rather than choosing a schema or serialization shape prematurely.

## Pattern

**Meaning -> concrete example -> candidate Type -> JSON -> check preserved meaning.**

1. Describe one complete transfer example in Markdown. State what the recipient must understand, including context, current instructions, exceptions, local preferences, source decisions, and unresolved questions.
2. Derive a candidate Type from the distinctions needed to preserve that meaning. A Type defines meaning and constraints; JSON encodes values.
3. Represent the example in JSON. Check for lost information, ambiguity, and proposals incorrectly presented as agreed rules. Do not assume automatic extraction.
4. Try a contrasting example, such as a provisional definition or a SubjectDomain (WMS) observation. Do not force process rules and domain evidence into the same record shape merely for uniformity.
5. Only after these checks, choose the authoritative representation. Generated Markdown views may become useful if the structured model proves adequate; do not maintain two independent authoritative copies.

## Naming and Boundaries

Ask the user for candidate names before adopting them, following P-012. Distinguish a method name, an example's subject, a conceptual Type, and a file or serialization format.

The initial example is [Commit Process](./commit-process.md), the user-selected title. [MetaExport](./meta-export.md) is the user-selected provisional name for the transfer collection, and KnowledgeStatement is the agreed candidate name for an individually referenceable piece of knowledge. Their structures and further candidate Type and field names remain to be agreed. No Class, schema, generator, external destination, or transmission is authorized by recording this pattern.

This pattern supports SC-049's Rule Set exploration; it does not complete that concern or settle whether Rule Set, Domain Definition, or another concept best describes the eventual export.
