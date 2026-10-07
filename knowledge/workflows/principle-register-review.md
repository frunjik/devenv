# Principle Register Organization and Priority Review

**Status:** Pending.
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

**Decision:** Register a pending review; no rule reordering, ranking, renumbering, or policy changes are authorized yet.

**Open question:** Does the register need better navigation/grouping, explicit conflict precedence, or both? Resolve from evidence during the review.

**Next step:** Read the complete register and produce an evidence-backed organization/precedence proposal.
