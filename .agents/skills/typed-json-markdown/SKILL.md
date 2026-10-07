---
name: typed-json-markdown
description: "Generate Markdown views from authoritative Typed JSON, or help extract candidate Typed JSON from Markdown when no structured source exists. Use for JSON-to-Markdown generation, regeneration, interface checks, and reviewed Markdown-to-JSON migration; not automatic bidirectional synchronization."
---

# Typed JSON and Markdown

## Boundaries

- Prefer structured storage: Typed JSON, then YAML, then Markdown. Typed JSON has an explicit interface; interfaces do not replace runtime validation.
- Keep one authoritative source. Generated Markdown is a readable view, not independently editable data.
- Confirm source, output, interface, and intended scope. Search for an existing structured source and generator before creating either.
- Reuse specialized generators; do not force unrelated document meanings into one schema or build a universal converter.
- Preserve unrelated work. Do not change authority, migrate originals, or overwrite hand-written documents without approval.

## Default: Typed JSON to Markdown

1. Identify the authoritative JSON and explicit interface. Check the actual JSON against that interface, not merely a disconnected example. Resolve missing or refinable Types and discuss candidate names before adoption.
2. Parse the source and check applicable constraints. Report malformed or unsupported data explicitly; do not silently drop fields, revisions, exceptions, or unknown meaning. Use runtime validation where the consumer requires it.
3. Reuse or create the smallest appropriate deterministic renderer. Follow project test requirements for new executable code; use boundary mocks rather than tests that mutate real files.
4. Generate a labelled view linking to its authoritative source. Include a reproducible command or link to the renderer. Escape text for its Markdown context, preserve intended links, and resolve relative links from the output location.
5. Verify required information and distinctions survive: context, authority, decisions versus proposals, uncertainty, exceptions, sources, and ordering where meaningful. Check local links and anchors where applicable.
6. Regenerate twice and compare outputs for reproducibility. Run the appropriate interface/type check and focused renderer tests. Report what was checked and any gaps.

**Actual instance:** the portable topic commit process uses JSON, an explicit interface, and a generated reading view. Its saved proposal status must not become an active policy merely because it is rendered.

## Optional Helper: Markdown to Candidate Typed JSON

Use only when no authoritative structured source exists. If JSON or YAML already exists, use it rather than reconstructing authority from a view.

1. Keep the original Markdown unchanged. Identify the intended consumer and what meaning must survive, including narrative context, sources, examples, exceptions, and unresolved questions.
2. Start with one concrete example and a contrasting case. Propose the smallest interface that preserves their distinctions; reuse existing Types and discuss new names. Do not invent facts or fill unknown fields with success-shaped defaults.
3. Extract candidate JSON, retaining source references and uncertainty. Check it against the explicit interface and applicable constraints. Explain information that does not fit; do not assume arbitrary prose is reliably convertible.
4. Render the candidate to a separate comparison view. Compare semantic meaning with the original, not identical formatting. Have the user review ambiguities and any loss or reinterpretation.
5. Ask approval before making JSON authoritative or retiring the original. On approval, update relevant consumers, references, and regeneration instructions within the agreed scope. Keep the original available as history until its disposition is agreed; avoid two active sources of truth.

**Contrasting case:** a provisional inquiry narrative may need to remain Markdown when a structured candidate would discard its uncertainty or context. No migration is better than a lossy conversion.

## Completion Report

State source and output paths, the interface and generator used, verification results, unresolved meaning, and whether authority changed. Saving or generating files is not permission to activate policy, commit, or transmit content.
