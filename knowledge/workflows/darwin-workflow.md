# Darwin

## Goal

Develop Agent Essentials as a new ruleset spawned from the current one, guided by observed metrics. Preserve access to older rulesets. Current guidance stays active until replacement approval.

## Plan

1. Generate readable history from the existing [version registry](../practices/practice-set-versions.json): name, version, labelled date, description and exact saved-version links. Preserve original names and unknown dates.
2. Review the backed-up ruleset and [lessons from this work](./darwin-lessons.json), typed as [LessonLearned](./lesson-learned.types.ts).
3. Select essential, actionable rules together; separate repository-specific details. Discuss unclear names and record approved old-to-new names with reasons.
4. Draft a small candidate from a pinned current ruleset, tracing proposed changes to observed metrics.
5. Trial realistic tasks against a recorded baseline; record behavior and overhead.
6. Revise and activate only with approval.

## Tracking

[Evaluation](./devenv-value-evaluation.json): `darwin-agent-essentials`. Continue the existing tracking opt-in. Record evidence at follow-ups; leave unmeasured effort and benefits unknown.

## Checkpoint

- Plan and names agreed: Darwin is the process; Agent Essentials is its output.
- History format agreed: a readable document, not a new UI.
- Baseline: five registered ruleset versions with descriptions and source commits; no per-version names; activation dates unknown. An existing Markdown generator can be extended instead of creating another history authority.
- Started history review: all five source commits and their AGENTS.md entry points resolve locally. Archive SHA256 matches the preserved checksum. The current renderer shows descriptions and activation dates, but only plain source hashes and no names or commit dates.
- Next: extend the existing registry and generated history with nullable names, explicitly labelled source-commit dates and pinned snapshot links. Do not retroactively call older versions Agent Essentials.
- Open decision before drafting: intended destination and scope of Agent Essentials.
- User clarified the LessonLearned: provide a mechanism to spawn a new agent ruleset from the current one based on observed metrics. This replaces the earlier transfer-focused interpretation. Metrics selection, trial conditions and development destination remain open; benefits are unverified.
- User selected v4's explicit TDD procedure and linked mocking, coverage and test requirements. Saved as a [non-active testing candidate](../practices/agent-essentials-testing.candidate.md), pinned to v4 with exceptions and scope. Candidate requires full four-metric coverage, unlike the current Should target. Other historical workflow gates remain unselected; trial effectiveness is unknown.
- No active rules changed; no archived customizations reactivated.
- Saved the agreed [Agent Phase Guide](./agent-phase-guide.json), typed as [AgentPhaseGuide](./agent-phase-guide.types.ts): Understand -> Explore -> Make -> Evaluate. One coordinator retains task ownership; phase skills are the starting point, separate agents are conditional. Runtime controls and routing/handoff trials remain open; no coordinator implemented.
- Approved rename: PhaseCoordinatorDesign -> TaskGuide (display name: Task Guide), to explain its role more simply.
- Subsequent approved rename: TaskGuide -> PhaseGuide (display name: Phase Guide), to avoid overloading "task" and identify the phases it guides.
- Final selected name: PhaseGuide -> AgentPhaseGuide (display name: Agent Phase Guide), to identify whose work it guides.
- User selected the first two retrospective priorities as the start of [Agent Essentials](../practices/agent-essentials.candidate.md): verify the requested outcome, then follow an explicit work loop and TDD. Detailed testing requirements remain authoritative in the linked testing candidate. Draft saved; no new behavioral trial or activation. Next candidate review: remaining essentials and trial success conditions; version-history work remains pending.
- Follow-up selection adds priorities 3 and 4: find/reuse boundary mocks before tests and full four-metric coverage of changed production modules. Candidate links to the existing detailed requirements rather than duplicating their rules and exceptions. No activation or new trial.
- Priorities 5-7 saved in the candidate as intents to explore, not rules: trace work to evaluations, capture baseline/completion evidence with little upkeep, and trial changes in isolation before broad adoption. Names, mechanisms and adoption remain open; existing structures are not automatically inherited.
- User approved JSON authority with generated Markdown, scoped first to new Agent Essentials material. [Core source](../practices/agent-essentials.json) and [testing source](../practices/agent-essentials-testing.json) now use [typed documents](../practices/agent-essentials.types.ts); their existing candidate Markdown paths are generated views. Regenerate with `npm run generate:agent-essentials:markdown`. Mechanical conversion verified unchanged content apart from the generated-source notice.
- Element audit: AgentPhaseGuide and LessonLearned already have typed JSON; version history, workflow TODO and evaluations already have JSON sources. Runtime agent/skill definitions, triggers, enable/disable controls, and any scoped instructions, prompts or hooks remain undesigned. No repository custom agents, scoped instruction files, prompts or hooks found in customization directories; only the UI-review skill remains. Active native guidance, historical content and narrative checkpoints are not converted.
- User approved placing the current commit procedure in AgentPhaseGuide's proposed workflow only. The guide owns explicit-request triggering, scope and subject approval, tracked-work handoff and post-commit verification; this is not a mandatory fifth phase. Active AGENTS.md and the separate portable topic proposal remain unchanged. Procedure is typed as AgentCommitProcedure; runtime implementation and trials remain pending.
- Added a typed TDD practice record to AgentPhaseGuide: prepare boundaries in Explore, execute Red/Green/Refactor in Make, assess results in Evaluate. References the authoritative testing JSON rather than copying its requirements. Proposal only; runtime invocation remains unimplemented.
- User approved a read-only `/agent-guide` page targeting Copilot files, four defined phase skills and a separate TDD skill. [Phase-skill JSON](./agent-phase-skills.json) is authoritative; pure feature-local generation functions project seven files in memory. The Angular component only presents source JSON, limitations and expandable file contents. Tools menu exposes the page; no export/activation controls.
- User approved including the six specific JSON/type dependencies in curated folder exports to preserve client builds; full knowledge/history remains excluded. Clone boundary test failed before the package-list change.
- Verification: 18 preview/route/navigation tests pass with 100% generator/component coverage; 54 clone/tracking tests pass; source JSON type-check and shared/client production builds pass. Existing clone HTTP-adapter lines 234-261 remain uncovered: handler 85.36% statement/line, 76% branch, 75% function coverage; no live-service tests run. Hidden-browser DOM/layout checks at 1440 and 375 px show seven files, source JSON, 44 px summaries and contained code scrolling without page overflow. Real locator clicks timed out in the hidden browser; no visible acceptance or reliable pointer interaction is claimed. Native details behavior is covered through DOM presentation and component tests, not a completed real-click trial.
- Next: user review of the page and proposed skill wording, then routing/export trials only if approved. Existing version-history enhancements remain pending; active customizations unchanged.
