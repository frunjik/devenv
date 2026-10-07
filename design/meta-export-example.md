# MetaExport Example: Commit Process

**Recorded:** 2026-10-07

**Source system:** DevEnv, repository `frunjik/devenv`, revision `d8e9ef67749c0db8f44a4e47a08722f6d96e21fb`.

**Status:** Draft Markdown example, not an agreed schema or executable instruction package.

## Context

This example transfers development/meta knowledge about a user and assistant preparing Git commits. It excludes application behavior and SubjectDomain (WMS) knowledge.

Each statement below is independently revisable. These statements describe current source-system instructions, not universal rules or authorization for a recipient to commit.

## KnowledgeStatements

1. **Verification:** Verify the bounded scope before committing. Production changes require Red-Green-Refactor, public-interface tests with 100% line/statement/branch/function coverage, Type review, and TypeScript-aware checks for TypeScript changes. Documentation-only work needs no code tests/builds unless documentation tests apply. Report failed or blocked checks.
2. **Initiation:** Leave changes uncommitted unless the user explicitly requests a commit. Do not initiate approval prompts merely because work is ready.
3. **Approval:** After a commit request, inspect the scope and current rules, then present the proposed message for approval before execution.
4. **Scope:** Commit only the reviewed changes; preserve unrelated work. An abort stops the requested commit.
5. **Naming:** For concern-focused subjects, use `SystemConcern-NNN:` and a short phrase describing this commit's contribution. `SC-NNN` remains the register identifier. Other commits need no concern prefix.
6. **Attribution:** Omit the Copilot `Co-authored-by` trailer until the user says otherwise, including for code or documentation assistance.
7. **Execution:** After approval, execute the reviewed commit, report failures, and verify the resulting commit and remaining worktree changes. Do not amend or rewrite history without explicit permission.
8. **Acceptance:** A successful commit does not establish user acceptance of the concern's outcome.

Short, subject-only message drafts are a local default. Validation commands must come from the receiving project's guidance, not be copied blindly from DevEnv.

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
- Successful commit: report execution, not concern acceptance.

These are expected interpretations, not evidence of recipient validation.

## Limits

Original sources remain authoritative. Conversation decisions are summarized, not accompanied by a transcript. This example covers the commit process, not all project guidance. The recipient must explicitly adopt or adapt it and resolve missing dependencies or conflicts.

No external transmission, JSON format, generator, or completed SC-049 is implied.
