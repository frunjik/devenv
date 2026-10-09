# Principle Register Organization and Priority Review

**Status:** In progress: concise guidance trial prepared; practice version pending.
**Source:** User request, 2026-10-08.
**Scope:** [System task principles](../../.agents/system-task-principles.md) and their summary in [AGENTS.md](../../AGENTS.md).

## Goal

Assess whether the accumulated P-NNN rules are easy to find, apply, and resolve consistently. Propose a clearer organization and justified priority or precedence where needed, without weakening agreed requirements.

## Initial Assessment

- The register is additive and its identifiers reflect recorded rules, not an established priority ranking.
- The user's concern about order is a hypothesis to investigate, not a confirmed defect.
- Reading order, practical importance, and precedence in a conflict are different questions. Grouping or a navigation summary may be sufficient without assigning every rule a rank.
- RICE prioritizes product-development candidates; it should not be used to rank binding rules without a separately justified fit. Mandatory safeguards are not optional because they score lower.
- Preserve stable P-NNN identifiers and historical overrides so existing references remain meaningful. Do not renumber or change rule meaning as an incidental cleanup.

## Review Steps

1. Read the complete current register and guidance; identify duplication, overrides, dependencies, ambiguities, and any concrete conflicts.
2. Compare reading-order/grouping improvements with explicit precedence rules. Recommend the smallest change supported by actual application examples.
3. Exercise the proposal against actual DevEnv cases: commit initiation versus explicit approval, structured-data preference versus native skill Markdown, and the three-minute continuation gate during ongoing work.
4. Present evidence, proposed organization, any semantic changes, and unresolved questions for user approval before implementation.
5. If approved, update the register and directly related guidance/references together. Verify every existing rule, exception, identifier, and link remains accounted for.

## Acceptance Criteria

- Distinguish organizational improvements from changes to obligations.
- Account for all current rules and overrides; preserve identifiers and history.
- Explain any proposed precedence using concrete conflicts or scenarios, not arbitrary scores.
- Obtain approval for the proposed organization and any changed meaning before applying it.
- Verify related guidance and references remain consistent after any approved implementation.

## Checkpoint

### Concise guidance trial (2026-10-10)

- User approved trying a trimmed entry point without changing obligations and updating the practice version. Tracking opted in to this existing workflow; WorkEvaluation skipped by explicit choice because this is guidance-only and improved consistency is unmeasured.
- Evidence: recent new global-grid work omitted the separate metrics decision, and stable UI summaries omitted the informational suggested commit subject. These are observed execution omissions, not proof of instruction-loading or settings failure.
- Preserve all prior AGENTS.md content in root agent-practices.md so its relative links remain valid. New AGENTS.md promotes start/implement/verify/pause/report/commit checkpoints and links to the detailed practices and additive principle register. No principle removed, weakened or renumbered; no model, editor setting or automated enforcement changed.
- Preservation map: the former overview, development/build commands, change guidelines, focused work loop, historical checklist trial and detailed reminders all remain in agent-practices.md. All P-NNN meanings/exceptions remain authoritative in the unchanged register. The concise entry point explicitly preserves required global reports, three-minute gates, phase handling, separate tracking/metrics choices and commit approvals.
- Practice version 4 is pending. The user chose the existing two-commit policy: first commit the guidance after an explicit request and approved subject, then add version 4 pinned to that actual guidance commit and regenerate its Markdown. Do not claim activation or invent timestamps.
- Next: validate local Markdown links and preserved guidance; review the diff. Then user review/commit decision, followed by the version-entry update. Trial a fresh chat's new-task, follow-up and commit checkpoints; record failures/corrections and unknowns rather than claiming reliability now.
- Verification: the new entry point is 24 lines versus the former 107. A normalized-content comparison confirms all former guidance is preserved exactly except its heading and preservation notice. Entry-point/companion local links resolve. Workflow JSON regenerated twice to identical Markdown; diff formatting passes. The first preservation check needed line-ending normalization, not a content correction. Documentation-only: no production tests/build required. Version 4 and fresh-chat behavioral verification remain pending; global active selection is unchanged.

**Review completed:** Read the complete P-001–P-026 register, `AGENTS.md`, and the linked TDD and Typed JSON/Markdown practices. The register is chronological; its preamble already says identifiers are not a priority ranking and directs conflicts to be raised for a decision.

- **Commit initiation vs explicit approval:** P-005 prohibits initiating commits without an explicit request and requires subject approval; P-011 adds a subject prefix only when a commit concerns a System Concern. The stable-summary subject suggestion is explicitly informational. No conflict found.
- **Structured-data preference vs skill Markdown:** P-015 applies to structured data and generated views. Skill files are procedural instructions in their required Markdown discovery format, not structured records being stored as data. No conflict found.
- **Three-minute continuation gate:** P-008 requires pausing at a stable point and waiting for permission; P-026 says not to repeat the task-start tracking question when continuing the same task. These govern different moments and can both apply. No conflict found.
- **Navigation evidence:** The focused-work-loop summary in `AGENTS.md` directly calls out several P-NNN gates but does not cite P-026, even though its Select step carries the new-task question. This is a narrow cross-reference gap.

**Decision and implementation:** Approved. Kept P-NNN order, meanings, and history unchanged; did not assign a global priority ranking, add blanket precedence rules, or add a thematic index. Added the P-026 cross-reference to the focused-work-loop Select step in `AGENTS.md`.

**Verification:** Regenerated the Workflow TODO Markdown twice and confirmed identical output. All 61 tests across the focused workflow/evaluation suites passed, and `git diff --check` passed.

**Next step:** No further register-review work is planned. Reopen this workflow only if a concrete navigation or precedence issue arises.
