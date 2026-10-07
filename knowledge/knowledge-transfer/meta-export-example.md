# MetaExport Example: Commit Process

**Recorded:** 2026-10-07

**Source system:** DevEnv, repository `frunjik/devenv`, reviewed at revision `6f0b42d72b09fce8bbe6dbd38cab589d05d0f4bb`.

**Status:** Draft Markdown example, not an agreed schema or executable instruction package.

## Context

This example transfers development/meta knowledge about a user and assistant preparing Git commits. It excludes application behavior and SubjectDomain (WMS) knowledge.

The proposed statements below describe current source-system instructions, not universal rules or authorization for a recipient to commit. Group headings organize them; they are not Types. List numbers are navigation aids, not stable identities.

## KnowledgeStatements

### Verification

Source: P-001 through P-005; documentation exception in Commit Process and project guidance.

1. Verify the bounded scope before committing; unresolved checks must not be presented as passing.
2. For production changes, use Red-Green-Refactor: run a focused failing test, implement enough to pass, then refactor while green.
3. For in-scope production code, require 100% line, statement, branch, and function coverage through public-interface, domain-derived tests.
4. Use simple mocks only at external/system boundaries, not for internal collaborators.
5. Do not change production code merely for testability or coverage without first proving it unreachable and otherwise untestable through its public interface.
6. Review missing or refinable Types at workflow, exception, and completion checkpoints; report candidates separately from confirmed Types.
7. For TypeScript changes, run an appropriate TypeScript-aware check and resolve resulting errors.
8. Documentation-only work needs no code tests/builds unless documentation tests apply.
9. Report failed or blocked checks and remaining Type cleanup or refactoring before claiming readiness.

### Permission and Scope

Source: P-005 and the current procedure and observed trial in Commit Process.

10. Leave changes uncommitted unless the user explicitly requests a commit.
11. Do not initiate approval prompts merely because work is ready.
12. After a request, inspect the actual changes and reviewed scope.
13. Before drafting, retrieve current commit rules, including naming and attribution.
14. Present the proposed message for user approval before executing the reviewed commit.
15. An abort stops that requested commit; do not treat its earlier request as continuing permission.
16. Commit only the reviewed scope.
17. Preserve unrelated work.
18. Pause for explicitly requested user review.

### Local Message Preferences

Source: P-005 and P-011; register terminology and ordinary-commit distinction in Commit Process.

19. For concern-focused subjects, use `SystemConcern-NNN:`; `SC-NNN` remains the register identifier, not the commit prefix.
20. Describe this commit's specific contribution after the prefix, not the concern's stable Title.
21. Ordinary commits need no concern prefix.
22. Use short, subject-only drafts by default; the user may revise this preference.
23. Omit the Copilot `Co-authored-by` trailer until the user says otherwise, including for code or documentation assistance.

### Execution and Interpretation

Source: Commit Process, current procedure and observed trial.

24. After approval, execute the reviewed commit with the approved message and current attribution preference.
25. Report execution failures explicitly.
26. Verify the resulting commit and report remaining worktree changes accurately.
27. Do not amend or rewrite history without explicit permission.
28. A successful commit does not establish user acceptance of the concern's outcome.

Validation commands must come from the receiving project's guidance, not be copied blindly from DevEnv.

## Sources and Overrides

The statements summarize [P-001 through P-005 and P-011](../../.agents/system-task-principles.md) and [Commit Process](../practices/commit-process.md) at the source revision. Links provide traceability; the text above supplies the operative meaning.

P-005's original checkpoint instruction said to commit once verification was complete. The user's 2026-10-07 override says:

> Leave changes uncommitted unless the user explicitly requests a commit.

Only automatic initiation is superseded; verification and message approval remain.

The earlier execution requirement included a Copilot trailer. The user's standing 2026-10-07 waiver, recorded in P-011, says:

> Omit the Copilot `Co-authored-by` trailer from commits until the user says otherwise.

This changes attribution, not initiation, approval, or verification.

## Meaning Checks

- Green tests without a request: no commit or approval prompt.
- Request followed by abort: no execution; a fresh request can restart preparation.
- Approved subject: commit the reviewed scope without the Copilot trailer.
- Attribution preference changes: approval and verification still apply.
- A required check fails: report the blocker rather than claim readiness.
- Unrelated work remains: exclude it and report it, rather than claim a clean worktree.
- Successful commit: report execution, not concern acceptance.

These are expected interpretations, not evidence of recipient validation.

## Limits

Original sources remain authoritative. Conversation decisions are summarized, not accompanied by a transcript. This example covers the commit process, not all project guidance. The recipient must explicitly adopt or adapt it and resolve missing dependencies or conflicts.

No external transmission, JSON format, generator, or completed SC-049 is implied.

## Step 1 Review

**Reviewed:** 2026-10-07 against the source revision above. The original eight entries bundled independently changeable instructions; the revised decomposition is a candidate, not an adopted Type structure.

Current initiation, approval, prefix, and attribution wording matches the reviewed rules. Superseded initiation and attribution requirements remain historical, not active.

**Still needed for a complete export:** Select supporting excerpts from the TDD and Type-review methods, clarify how a recipient identifies the reviewed scope and approval, and represent per-statement provenance and override relationships without relying on group-level citations. Stable statement identities and the distinction between agreement and current applicability remain unresolved. No recipient validation has occurred.

## Step 2: Candidate Type Meaning

**Status:** Candidate structure described and illustrated in JSON. Preserved revisions under one instruction identity are selected; no production Type or authoritative schema is adopted.

| Necessary distinction | Concrete example |
| --- | --- |
| Assertion and applicable context | Omit the Copilot trailer for this project's commits until the user says otherwise. |
| Source and authority | User instruction on 2026-10-07, recorded in P-011; this export is a derived summary. |
| Agreement versus current applicability | The older automatic-commit rule was agreed, but its initiation requirement is superseded. It must not become active merely because it was agreed. |
| Replacement and unaffected instructions | Attribution changes do not replace approval or verification. |
| Source decision versus recipient adoption | A current DevEnv instruction is not automatically an adopted recipient instruction. |
| Supporting material and limits | Recorded source excerpts support interpretation; no conversation transcript or recipient validation is supplied. |

An instruction may also be a local preference. An observation can support Evidence without itself authorizing execution. These distinctions do not justify one exclusive category list.

### Decision: Preserve Instruction Revisions

**Decision history (2026-10-07):** The user initially selected a new superseding statement, then reconsidered after clarifying that revisions can also preserve history. The current user-selected approach is preserved revisions under one instruction identity.

For example, restoring the Copilot trailer would create a new revision of the attribution instruction, retaining its earlier revisions. Do not overwrite their assertions or provenance. Unrelated approval and verification instructions retain their own identities. This hypothetical example does not change the current instruction to omit the trailer.

References must distinguish the instruction identity from the particular revision being cited. Current applicability must remain contextual, not inferred solely from agreement or the highest revision number. Exact reference names and formats are not yet agreed.

The decision does not settle editorial corrections, partial replacements, or replacements spanning several instructions. Separate-statement supersession remains an unresolved candidate for those cases, not the selected approach for the attribution example.

### Provisional Structure (User-Approved Names, 2026-10-07)

A KnowledgeStatement has `id` and `revisions`. Each preserved revision has:

- `revision`: an exact revision label within that identity.
- `assertion`: the recorded meaning.
- `context`: scope and conditions, including local bindings.
- `source`: origin, authority, date/revision, and evidence limits.
- `applicability`: where and when it applies, distinct from original agreement.

For the experiment, IDs are readable strings and revision labels are positive integers. This is an illustrative encoding, not a selected global identity scheme. IDs must be unique within the example and revision labels unique within their statement. Earlier revisions retain their assertions and provenance. Current applicability is explicit, not inferred from the largest label.

Sources and applicability use narrative text rather than silently inventing additional Types or lifecycle enums. Structured source records and exact-reference relationships remain unresolved.

## Step 3: JSON Example

[The JSON example](./meta-export-example.json) contains eleven representative KnowledgeStatements, including preserved initiation and attribution history. It is a subset of the Markdown process, not a complete export or schema. The historical assertions are derived summaries, not verbatim copies or a claim that historical sources already used this revision model.

The hypothetical restoration of attribution is deliberately absent: the current waiver remains unchanged. Recipient adoption is not asserted. The array represents selected statements, not a fully modeled MetaExport envelope.

## Preliminary Meaning Check

| Scenario | JSON support |
| --- | --- |
| Ready without request | Current initiation revision and approval-prompt instruction prohibit automatic action. |
| Request then abort | Abort instruction stops execution; message approval remains required after a fresh request. |
| Approved commit | Scope, current attribution, and verification instructions still apply. |
| Attribution changes | Only attribution's history changes; separate approval and verification identities remain. |
| Failed check or unrelated work | Verification, scope, unrelated-work, and execution-report assertions prevent success-shaped reporting. |
| Commit succeeds | Outcome-acceptance assertion prevents treating execution as acceptance. |

This is a manual interpretation check, not recipient validation. JSON parsing and example-shape checks do not establish semantic completeness.

**Resume at step 4:** Complete the meaning review, decide whether the selected subset is sufficient, and address narrative-only source/relationship references before a full export. Then try a contrasting example. No generator, importer, or external transmission is introduced.

## Derived Markdown Generator

**Added scope (user, 2026-10-07):** Generate a separate [Markdown view](./meta-export-example.generated.md) with `npm run export:meta:markdown`. This supersedes the earlier no-generator boundary only for this local renderer; it does not choose an authoritative representation or implement import/transmission.

The generator preserves every assertion, context, source, applicability description, identity, and revision in input order. It rejects unrecognized fields rather than silently dropping knowledge. Its shape validation is specific to this JSON experiment, not an agreed general MetaExport schema.

The JavaScript script follows the existing repository script format. Tests exercise its public write operation with filesystem boundary mocks; tests do not write real files. No new domain Type is introduced: structured provenance and contextual applicability remain unresolved candidates. The hand-written narrative still owns interpretation checks and limitations, which are not automatically included in the JSON-derived view.
