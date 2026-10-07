# Commit Process

**Recorded:** 2026-10-07
**Status:** Initial Markdown transfer example; provisional names agreed, but no export Type structure or JSON format agreed.
**Method:** [Example-Led Knowledge Modeling](./example-led-knowledge-modeling.md).

## Meaning and Context

This example describes how a user and assistant prepare and authorize a Git commit. It belongs to development/meta practices, not SubjectDomain (WMS) behavior or application ticket lifecycle.

The recipient must distinguish readiness, permission to initiate, approval of a particular message, successful execution, and user acceptance of the delivered behavior. These are not interchangeable.

## Current Procedure

1. Finish and verify a bounded scope. For production code, use Red-Green-Refactor, public-interface tests at 100% statement/branch/function/line coverage for the declared scope, appropriate Type review, and a TypeScript-aware check when TypeScript changes. Documentation-only work does not require code tests/builds unless relevant documentation tests exist. Report blocked or failed checks rather than presenting the scope as verified.
2. Leave changes uncommitted. A stable checkpoint is not permission to initiate a commit or solicit commit approval.
3. When the user explicitly requests a commit, inspect the actual changes and scope. Exclude unrelated changes and do not discard other work.
4. Read the current commit rules before drafting a subject. Check naming, the specific contribution, and the current attribution preference. Present the draft for approval; a request to commit is not approval of an unseen message.
5. After approval, commit only the reviewed scope with the approved subject. Apply the current attribution preference; currently, omit the Copilot co-author trailer. Report execution failures explicitly.
6. Verify the resulting commit and worktree state. Report remaining changes accurately.

No history rewriting or amendment follows from this procedure without explicit permission. Commit permission and message approval do not establish domain truth or user acceptance of a concern's outcome.

## Local Preferences and Bindings

These settings belong to this repository; a recipient must not silently treat them as universal requirements.

- Short, subject-only drafts are the current default.
- A concern-focused subject uses `SystemConcern-NNN:` followed by this commit's specific contribution. The register still identifies concerns as `SC-NNN`.
- Ordinary commits do not require a concern prefix merely because they change the repository.
- Omit the Copilot `Co-authored-by` trailer until the user says otherwise. This standing waiver applies whether the assistant helps with the message, documentation, or code.
- Project validation commands and source-file scope are resolved from current project guidance; this example does not prescribe this repository's npm commands to another system.

## Sources and Precedence

- Baseline repository revision: `bb7673c7712d5bf03d5a31ed449215a503ffc34c`.
- [P-001 through P-005](../.agents/system-task-principles.md): development and verification prerequisites, checkpoint practice, and message approval.
- [P-011](../.agents/system-task-principles.md#p-011--identify-the-referenced-concern-in-commit-messages): naming and pre-draft checks.
- [Project guidance](../AGENTS.md): operational summaries and project bindings.
- User instruction on 2026-10-07: "stop with self commit", followed by acknowledgment to stop initiating commits and approval prompts. This overrides automatic initiation in the earlier P-005 rule. It was recorded in P-005 and guidance in the working tree after the baseline revision, alongside this example.
- The earlier co-author trailer requirement was an execution requirement, not a user decision, and was absent from the baseline principle files. The user explicitly waived it on 2026-10-07 and asked to preserve that waiver until further instruction; the current preference is recorded in P-011 and project guidance.

This example is a derived description, not a second independent rule source. If source decisions change, revise the example before export. Saving this example is not approval of every proposed transfer field or permission to send it externally.

## Examples for Checking Preserved Meaning

- Tests pass but there is no commit request: leave changes uncommitted and do not initiate an approval prompt.
- The user says "commit": inspect the scope and ask approval of a compliant subject before committing.
- A concern commit draft says `SC-044:`: correct it to `SystemConcern-044:` before presenting it.
- The user approves the subject: this authorizes the reviewed commit, not acceptance of the concern's outcome.
- A required check fails: report the blocker; do not claim the completed scope meets the verification requirements.

## Open Modeling Questions

Which distinctions need identity-bearing records? How should an override identify the instruction it supersedes? How should a recipient resolve project bindings and attribution? What source evidence is sufficient when a decision originated in conversation?

The provisional names MetaExport and KnowledgeStatement are agreed for the modeling experiment in [MetaExport](./meta-export.md). Their structures and further candidate Type and field names remain to be discussed before adoption. No automated validator, generator, or export mechanism is introduced.
