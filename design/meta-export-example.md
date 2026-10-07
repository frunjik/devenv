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

The statements summarize [P-001 through P-005 and P-011](../.agents/system-task-principles.md) and [Commit Process](./commit-process.md) at the source revision. Links provide traceability; the text above supplies the operative meaning.

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
