---
name: typed-json-markdown
description: "Only on explicit request or agreement: generate Markdown from authoritative Typed JSON, check interfaces or review a Markdown-to-JSON migration. Not automatic bidirectional synchronization."
---

# Typed JSON and Markdown

## Invocation and boundaries

Invoke only when requested or agreed. Follow the replacement Must/Should/Could distinctions, not old blanket coverage, naming or Type-review gates.

- Keep one authoritative source; derived views are not independently maintained data.
- Prefer Typed JSON with explicit interfaces for structured data. Preserve legitimate narrative/native customization Markdown rather than force a lossy conversion.
- Confirm scope, source and output; search existing sources/renderers first. No authority change, migration or overwrite of hand-written originals without approval.

## JSON to Markdown

1. Check the actual source, not a disconnected example. Prefer an explicit interface; use appropriate runtime validation for external input and report unsupported meaning or shapes explicitly.
2. Reuse a specialized deterministic renderer; do not build a universal converter. New production behavior follows core Red-Green-Refactor with isolated tests; coverage and test design remain applicable Should defaults.
3. Label the derived view and link its authority and renderer/command. Escape Markdown appropriately and resolve relative links from the output location.
4. Verify preserved distinctions: uncertainty, decisions versus proposals, exceptions, sources and meaningful ordering. Regenerate twice to check reproducibility; run relevant tests/type-checks and report unavailable checks.

## Markdown to candidate JSON

Use only when no authoritative structured source already exists. Preserve the original; compare a concrete example and contrasting case before proposing representation.

Prefer a small explicit interface and discuss consequential names provisionally. Extract uncertainty rather than invent facts; identify meaning that does not fit. Render a separate comparison and obtain approval before making the candidate authoritative or retiring the original.

**Concrete instance:** the portable topic commit process has [authoritative JSON](../portable-commit-process.json) and a [derived view](../portable-commit-process.generated.md); rendering does not activate its proposal.

Report source/output, interface/renderer used, checks, unresolved meaning and authority changes. Saving files is not activation, commit or transmission permission.
