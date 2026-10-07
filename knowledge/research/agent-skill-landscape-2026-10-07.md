# External Agent and Skill Candidates

**Reviewed:** 2026-10-07  
**Status:** Research shortlist only. No external agent or skill has been adopted; the recommendations below require user review.

The shortlist was compared with DevEnv's existing project-specific agent guidance and principles. Prefer selectively adapting useful material over adding competing instructions or importing a generic workflow wholesale.

| Candidate | Recommendation | Fit and evidence | Caveats |
|---|---|---|---|
| [Anthropic Claude Code Security Review](https://github.com/anthropics/claude-code-security-review) | Consider adapting its review checklist into local security-review guidance; evaluate the Action separately if CI review is desired. | Official repository under `anthropics`; PR-diff-oriented security findings complement DevEnv's existing security-review practice without a corresponding local agent file. | It is a GitHub Action, not an editor skill; use requires an Anthropic API key. Its documentation warns it is not hardened against prompt injection and should only be used with trusted PRs. |
| [Angular PR review skill](https://github.com/angular/angular/blob/main/.agent/skills/pr_review/SKILL.md) | Consider adapting its checklist and approval gates into local code-review guidance. | Located in the official Angular repository; adds a general review process complementary to DevEnv's TDD and Type-review guidance. | Written for Angular framework contributions, so framework-specific instructions and contribution mechanics need to be removed. |
| [Angular developer skill](https://github.com/angular/angular/blob/main/skills/dev-skills/angular-developer/SKILL.md) | Optional reference for targeted Angular topics; do not import wholesale. | Official Angular-authored skill with topic-specific references that may complement the project's version-specific Angular practices. | Generic guidance may conflict with DevEnv conventions or known build limitations; consult only relevant references when needed. |
| [obra/superpowers](https://github.com/obra/superpowers) — verification-before-completion and requesting-code-review skills | Borrow a specific technique only if a gap is identified; do not adopt the TDD skill as a replacement. | Its project is listed in Anthropic's official plugin marketplace; its verification and review-dispatch patterns may offer useful examples. | Its TDD method substantially overlaps the existing local TDD agent. It is a broader skills collection, and its unusually high reported star count was not relied on as the quality signal. |

## Not Recommended

- The official [Anthropic skills repository](https://github.com/anthropics/skills) is useful as a reference for the Agent Skills format, but the reviewed catalog did not provide a directly relevant TDD, Type-review, security-review, or Angular implementation skill to add.
- Unofficial "awesome-copilot"-style prompt aggregators were excluded because their curation and provenance did not meet the requested quality bar.
- No authoritative TypeScript-specific Type-review skill or comparably authoritative Express/Node review skill was identified in this review. The local Type Reviewer remains a distinctive project practice.

## Research Limits

This is a point-in-time shortlist, not an endorsement or an exhaustive survey. The Angular skills were reviewed at their top-level instructions; their reference files should be inspected before adapting any specific recommendation. External repositories and marketplace listings may change.
