# Full Glossary Export

**Registered:** 2026-10-07. Completed; user acceptance remains separate.

## Scope

Create a command-line export that writes the complete Glossary as structured JSON records, rather than filtering Terms by their recorded known-usage Domain labels. The selected record fields are `term`, `definitions`, `examples`, and `domains`, matching the existing Glossary display shape.

This is separate from [MetaExport](./meta-export.md), which explores transfer of concern-planning and development/meta knowledge, and from [Term Editing](./term-editing-workflow.md), which concerns changing Glossary entries. The user authorized this local implementation; it does not authorize external transmission or changes to the Glossary's source of truth.

## Steps

1. **Agreed:** Generate structured JSON via a command-line script, using `term`, `definitions`, `examples`, and `domains` records. Write it to `design/glossary-export.generated.json`.
2. **Source decision:** Export defined entries from `.glossary` only; exclude legacy `.terms` content. The current `GET /glossary` endpoint prefers `.glossary` and falls back to `.terms` only when `.glossary` is missing; the export must not use that fallback.
3. **Agreed and implemented:** Reuse the existing `GlossaryEntry` fields and parser through `@shared`; empty `domains` represents unknown/unrecorded usage.
4. **Reviewed:** SC-027 and SC-049 were considered; neither directly covers this unfiltered full export. No concern association or new Type was adopted.
5. **Agreed:** Export every `.glossary` entry in source order, preserving the selected fields, excluding `.terms`, writing only the generated output path, and surfacing read/parse/write errors. Do not establish a second source of truth.
6. **Implemented and verified:** Use Red-Green-Refactor; see the checkpoint for test, coverage, and build results.
7. **Documented:** Results and limitations are recorded. User acceptance remains separate. External transmission and commits require separate permission.

## Checkpoint

**Checkpoint (2026-10-07):** The user changed the initial scope from Domain-filtered export to a full Glossary export. They selected a command-line script that writes structured JSON to `design/glossary-export.generated.json`, with record fields `term`, `definitions`, `examples`, and `domains`. They specified that only defined Glossary entries from `.glossary` are included; legacy `.terms` entries are excluded.

**Source review:** `.glossary` is the defined-term source; `.terms` contains legacy workflow/status labels. `GET /glossary` currently prefers `.glossary` and falls back to `.terms` only when the former is missing. The display parser trims and skips blank lines, associates `- ` lines with the preceding entry, and separates `Example:` and `Domains:` metadata from definitions. The selected record shape preserves those semantic groups, not blank lines or interleaving between groups.

**Type review:** `GlossaryEntry` already had the selected output fields but was local to the Angular component, alongside a private parser. The user approved promoting the existing contract/parser to `@shared` and reusing it in the UI and export script. Empty `domains` means no usage labels are recorded (unknown), not confirmed absence. This refactors an existing Type; no new Type conviction was raised.

**Concern review:** SC-027 concerns scoping Glossary terms by Domain level, whereas this export is unfiltered; SC-049 concerns transfer of concern-planning and development/meta knowledge and does not include Glossary export in its current scope. No direct existing concern is established; keep this workflow unassigned unless the user directs otherwise.

**Acceptance criteria:** Export all `.glossary` entries in source order as records with the selected four fields; preserve every term, definition, example, and recorded usage label; represent unrecorded usage as an empty `domains` array without implying absence; exclude `.terms`; write only the selected generated output path; surface read, parse, and write failures; add no parallel source of truth. Validate with filesystem-boundary mocks, scoped 100% four-metric coverage for changed production code, shared/client builds, and a JSON parse/shape check.

**Implementation and verification (2026-10-07):** The user approved reusing the existing `GlossaryEntry` shape and parser through `@shared`, then authorized implementation. The shared parser replaced the component-local parser. Run `npm run export:glossary` to generate `design/glossary-export.generated.json`; it reads `.glossary` only. The generated output was parsed and compared against the shared parser's output for `.glossary`: all 52 records match exactly, and `.terms` is excluded.

The focused parser/component tests pass (17 tests); focused exporter tests pass (3 tests). Full test runs pass: client 330 tests and server 216 tests. Server coverage passes at 100% statements, branches, functions, and lines, including the exporter. All in-scope client files (`glossary.component.ts`, its template, and `glossary.types.ts`) report 100% on all four metrics. However, the full client coverage command exits nonzero at 99.64% function coverage because the untouched `SharedService` constructor is uncovered; the other global client metrics are 100%. This unrelated no-op constructor was not changed to satisfy the global threshold.

Shared and client builds pass. A TypeScript-aware check of both CLI scripts passes. The test suites use filesystem boundary mocks; no tests mutate the real filesystem. `git diff --check` passes for the implementation and design changes.

Type review: reusing `GlossaryEntry` as a shared contract and parser avoids competing UI/export interpretations. No additional Type name or Domain relationship Type was adopted. SC-027 covers Domain-level scoping, not this unfiltered export; SC-049's current scope excludes Glossary export. No direct concern association was assigned.

**Next:** User review and acceptance of the completed local export. Source ordering and each field's content are preserved; blank lines and ordering between definitions, examples, and usage labels are represented structurally rather than textually. Export is not a second source of truth.
