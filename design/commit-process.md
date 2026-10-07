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

## Example-Led Trial: The Documentation Commit

**Observed example:** Commit `a719b1e9d9fb9f280a446a728c0e83f1922d2c08`, made on 2026-10-07 with subject `SystemConcern-049: establish example-led MetaExport design`.

The user requested a commit, then explicitly aborted it during message approval. The assistant did not execute that aborted commit. The user subsequently established a standing preference to omit the Copilot co-author trailer. After a documentation-consistency check, the user made a fresh commit request, approved the proposed subject, and the assistant committed the six reviewed documentation files. The resulting message had no co-author trailer, and the worktree was clean.

This is an execution observation, not a new instruction. The conversation supplies the request, abort, and approval sequence; the Git commit supplies the resulting subject and committed files, but cannot by itself prove user authorization. This document summarizes that conversation; it is not an attached transcript.

### What a Recipient Must Be Able to Explain

| Point in the example | Meaning that must survive transfer |
| --- | --- |
| Documentation is ready, without a commit request | Readiness alone permits neither a commit nor an approval prompt. |
| A commit request is followed by an abort | The earlier request is not continuing permission to execute that commit. |
| The user establishes the attribution preference | Omission of the trailer is a standing instruction, not merely a property of this one commit. |
| A fresh request is made | Preparation may resume, but the particular subject still needs approval. |
| The subject is approved | Execution is authorized for the reviewed scope and message, not for unrelated changes or future commits. |
| Git reports success and a clean worktree | The commit succeeded; this does not establish acceptance of the concern's outcome. |

### Candidate KnowledgeStatement Boundaries

The example suggests independently referenceable statements rather than a single indivisible process paragraph:

- Do not initiate commits or approval prompts without an explicit user commit request.
- Obtain approval of the proposed message before executing the reviewed commit.
- Omit the Copilot co-author trailer until the user says otherwise.
- Use the current concern prefix for concern-focused subjects.
- The documentation commit above succeeded with the approved subject and no co-author trailer.

The first four express instructions or preferences; the last records an observation. A local preference can also be an instruction, so these descriptions must not become mutually exclusive categories without further discussion.

**Boundary decision (user, 2026-10-07):** One KnowledgeStatement represents one independently revisable assertion. The complete commit-process description is assembled from statements rather than treated as one indivisible KnowledgeStatement. The particular decomposition above remains a candidate; no complete Type structure is agreed. Revising or superseding a statement must not accidentally replace unrelated rules. For example, changing attribution must not remove the message-approval requirement.

### Candidate Type Constraints Derived From This Example

Without choosing field names yet, a KnowledgeStatement would need to preserve its assertion, the context in which it applies, its source and authority, and whether it is current, superseded, or still proposed. A relationship to an earlier statement must specify what is replaced and what is retained.

Recorded knowledge must not be confused with authorization for a particular execution. Nor should the example imply that KnowledgeStatement is necessarily the Type for a live approval or commit event.

The narrative and the proposed statement boundaries are the current experiment. JSON comes after discussing those boundaries and naming the necessary parts. No full transfer package or recipient adoption is demonstrated yet.
