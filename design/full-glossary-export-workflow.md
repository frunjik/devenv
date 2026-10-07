# Full Glossary Export

**Registered:** 2026-10-07. Paused; source-of-truth migration is not implemented.

## Scope

Use `.glossary.json` as the authoritative Glossary source, generate the existing `.glossary` Markdown view from that JSON, and make the UI consume the authoritative JSON records. The record fields are `term`, `definitions`, `examples`, and `domains`, matching the existing Glossary display shape. This supersedes the earlier design in which `.glossary` was the source and `design/glossary-export.generated.json` was derived.

This is separate from [MetaExport](./meta-export.md), which explores transfer of concern-planning and development/meta knowledge, and from [Term Editing](./term-editing-workflow.md), which concerns changing Glossary entries. The earlier local CLI implementation does not authorize external transmission.

## Steps

1. **Superseded:** The previous CLI exported `.glossary` to `design/glossary-export.generated.json`. The user now specifies `.glossary.json` as the authoritative data source and `.glossary` as generated Markdown.
2. **Agreed:** Use structured records with `term`, `definitions`, `examples`, and `domains`. Exclude legacy `.terms` entries.
3. **Agreed and implemented:** Reuse the existing `GlossaryEntry` fields and parser through `@shared`; empty `domains` represents unknown/unrecorded usage.
4. **Reviewed:** SC-027 and SC-049 were considered; neither directly covers this unfiltered full export. No concern association or new Type was adopted.
5. **Agreed:** `.glossary.json` is the one editable source of truth; `.glossary` is a generated view and must not be independently edited.
6. Rework CLI generation, API, and UI so the UI consumes JSON and Markdown is generated from JSON. Surface read/parse/write failures.
7. Verify with filesystem-boundary mocks, scoped coverage, builds, JSON/Markdown equivalence, and update documentation. External transmission and commits require separate permission.

## Checkpoint

**Checkpoint (2026-10-07):** The user changed the initial scope from Domain-filtered export to full Glossary export, then specified a source-of-truth migration: `.glossary.json` at the repository root is authoritative, `.glossary` is generated Markdown, and the UI must use authoritative JSON. The prior `design/glossary-export.generated.json` is superseded; decide whether to remove it during migration.

**Source review before migration:** `.glossary` contains current Terms; `.terms` contains legacy workflow/status labels. The current `GET /glossary` endpoint prefers `.glossary` and falls back to `.terms`. The shared parser already maps Markdown lines to the agreed JSON record shape.

**Type review:** `GlossaryEntry` already had the selected output fields but was local to the Angular component, alongside a private parser. The user approved promoting the existing contract/parser to `@shared` and reusing it in the UI and export script. Empty `domains` means no usage labels are recorded (unknown), not confirmed absence. This refactors an existing Type; no new Type conviction was raised.

**Concern review:** SC-027 concerns scoping Glossary terms by Domain level, whereas this export is unfiltered; SC-049 concerns transfer of concern-planning and development/meta knowledge and does not include Glossary export in its current scope. No direct existing concern is established; keep this workflow unassigned unless the user directs otherwise.

**Acceptance criteria:** Export all `.glossary` entries in source order as records with the selected four fields; preserve every term, definition, example, and recorded usage label; represent unrecorded usage as an empty `domains` array without implying absence; exclude `.terms`; write only the selected generated output path; surface read, parse, and write failures; add no parallel source of truth. Validate with filesystem-boundary mocks, scoped 100% four-metric coverage for changed production code, shared/client builds, and a JSON parse/shape check.

**Previous implementation and verification (2026-10-07):** The initial CLI export and shared parser were committed in `844fbec`. It generated 52 records from `.glossary`; prior test/build results are retained below as a baseline, not final migration verification.

**New user rule (2026-10-07):** Unless otherwise specified, structured data is maintained as JSON source of truth and Markdown is generated from JSON as a human-readable view. This is a general project convention.

**Agreed architecture:** `.glossary.json` is the repository-root authority; `.glossary` is generated Markdown. The UI reads JSON directly. `.terms` remains excluded.

The focused parser/component tests pass (17 tests); focused exporter tests pass (3 tests). Full test runs pass: client 330 tests and server 216 tests. Server coverage passes at 100% statements, branches, functions, and lines, including the exporter. All in-scope client files (`glossary.component.ts`, its template, and `glossary.types.ts`) report 100% on all four metrics. However, the full client coverage command exits nonzero at 99.64% function coverage because the untouched `SharedService` constructor is uncovered; the other global client metrics are 100%. This unrelated no-op constructor was not changed to satisfy the global threshold.

Shared and client builds pass. A TypeScript-aware check of both CLI scripts passes. The test suites use filesystem boundary mocks; no tests mutate the real filesystem. `git diff --check` passes for the implementation and design changes.

Type review: reusing `GlossaryEntry` as a shared contract and parser avoids competing UI/export interpretations. No additional Type name or Domain relationship Type was adopted. SC-027 covers Domain-level scoping, not this unfiltered export; SC-049's current scope excludes Glossary export. No direct concern association was assigned.

**Progress before pause (2026-10-07):** The user clarified that `.glossary.json` at the repository root is the authoritative source, `.glossary` at its existing path is a generated Markdown view, and the UI should consume the JSON. The user authorized continuation and then asked to pause. The general convention has been recorded as P-015 in the System Task Principles and summarized in `AGENTS.md`.

The previously committed implementation remains unchanged: `npm run export:glossary` still parses `.glossary` and writes `design/glossary-export.generated.json`; the API still reads Markdown lines and falls back to `.terms`. No migration or generated-view change has been made yet.

**Next:** Resume with Red phase tests for (1) serving validated `.glossary.json` through the API with no `.terms` fallback, and (2) generating `.glossary` Markdown from authoritative JSON through a filesystem boundary mock. Then migrate the existing 52 records from the generated JSON to root `.glossary.json`, implement the shared JSON validation/API/UI contract and JSON-to-Markdown generator, remove the obsolete `design/glossary-export.generated.json`, update docs, and validate builds, scoped coverage, generated Markdown equivalence, and full suites. Keep the user's unrelated `TODO.md` change untouched.
