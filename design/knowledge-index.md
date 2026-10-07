# Project Knowledge Index

This index locates the knowledge accumulated while designing and building DevEnv. It is a navigation aid, not a replacement for the records themselves. Exploratory ideas, historical notes, agreed rules, and validation evidence have different authority.

## Where to Start

When resuming work, consult:

1. The [System Concern register](./problem-inquiry-system/concerns.md), including its [Meta Notes](./problem-inquiry-system/concerns.md#meta-notes).
2. The [System Task Principles](../.agents/system-task-principles.md).
3. The [assistant/project guidance](../AGENTS.md).
4. The [Glossary](../.glossary).

## Decisions, Learning, and Working Rules

| Location | What we use it for |
|---|---|
| [System Concern register](./problem-inquiry-system/concerns.md) | The main development knowledge register: concerns, open questions, user decisions, scope boundaries, Type assessments, progress, verification evidence, and acceptance status. |
| [Meta Notes](./problem-inquiry-system/concerns.md#meta-notes) | Lessons about how we build and reason: recurring patterns, naming issues, evidence limitations, and reflections on the process. |
| [System Task Principles](../.agents/system-task-principles.md) | Agreed development principles, their source, scope, and practice: TDD, coverage, Type review, commit approval/naming, continuation checkpoints, and filesystem-free tests. |
| [AGENTS.md](../AGENTS.md) | Operational assistant guidance: project structure, commands, conventions, and summaries of the principles. Keep it consistent with the principle register. |
| [Glossary](../.glossary) | Definitions of domain/system vocabulary, including Problem, Inquiry, System Concern, Goal, and Work Item. The primary vocabulary store. |
| [Terms](../.terms) | Less structured terms and earlier workflow labels. The glossary endpoint reads this file as well as the Glossary; entries are not automatically agreed definitions. |

## Design Rationale and Exploratory Knowledge

These documents distinguish hypotheses and candidates from validated conclusions.

| Location | What we use it for |
|---|---|
| [Domain Design System](./domain-design-system.md) | Entry point describing the proposed system and guiding ideas. |
| [Domain Design System model](./domain-design-system-model.md) | Candidate goals, conceptual distinctions, areas of concern, and contracts. |
| [Domain Design System exploration](./domain-design-system-exploration.md) | Inquiry methods, design lenses, and preserving learning toward implementation. |
| [Meta-Type System purpose](./meta-type-system-purpose.md) | Rationale, prior art, benefits, and risks. |
| [Type Description model](./type-description-model.md) | Exploration of machine-readable Type descriptions and consumers; no runtime format is committed. |
| [Warehouse modernization exploration](./explorations/2026-10-05-warehouse-web-modernization/README.md) and [candidate domain model](./explorations/2026-10-05-warehouse-web-modernization/domain-model.md) | Scenario-based reasoning about replacing a legacy warehouse UI, with candidate Terms and Types; not independently validated against the screen corpus. |
| [AI-assisted WMS authoring exploration](./explorations/2026-10-05-ai-assisted-wms-authoring/README.md) | Hypotheses and candidate models for human/AI collaboration, evidence, decisions, and continuity. |
| [Problem-framing exploration](./explorations/2026-10-05-problem-framing-assumption/README.md) | A planned paper exercise about separating observation, interpretation, cause, outcome, and response; planned, not conducted. |

## Reviews and Reusable Methods

| Location | What we use it for |
|---|---|
| [System Type review](../reviews/system-types.md) | Recorded findings, invariant problems, strengths, and candidate improvements; not proof that recommendations were implemented. |
| [Knowledge soundness review (2026-10-07)](../reviews/knowledge-soundness-2026-10-07.md) | Dated assessment of conceptual soundness and consistency across the indexed documents, with proposed improvements and review limits. Recommendations are pending discussion, not agreed rules. |
| [RICE prioritization review](../reviews/rice-prioritization.md) | Scoring concepts, rules, contracts, and interpretation. |
| [Domain Type design skill](../skills/domain-type-design/SKILL.md) | Reusable procedure for defining/reviewing goal-oriented domain Types and keeping vocabulary consistent. |
| [TDD developer guidance](../.agents/test-driven-developer.agent.md) | Detailed Red-Green-Refactor method. |
| [Type reviewer guidance](../.agents/type-reviewer.agent.md) | Type-review lens used at checkpoints. |
| [Demolition worker guidance](../.agents/demolition-worker.agent.md) | Procedure for assessing usage before removing code. |

## Practical Documentation and Historical Material

| Location | What we use it for |
|---|---|
| [README](../README.md) and [Workspace guide](../WORKSPACE.md) | Project usage, development commands, build/test procedures, and workflows. |
| [Changelog](../CHANGELOG.md) | Release-oriented change history, not a complete record of recent learning. |
| [Input sources guide](../input-sources/README.md) | Source provenance and the distinction between synthetic examples and real evidence. |
| [TODO](../TODO.md), [DEVENVOPDEV](../DEVENVOPDEV.md), [Workflow](../.workflow), and [Ideas](../.ideas) | Earlier backlog, process notes, and brainstorming. Historical material must not be assumed to override the maintained principles. |

## Application Data and Implementation Evidence

[.tickets.json](../.tickets.json) stores application **Problem Tickets**, not the development-learning register.

Git history preserves changes and commit descriptions. Tests preserve executable expectations. Neither usually captures the full rationale, so link relevant learning and decisions back to the durable records above.

## Maintenance

Update this index when knowledge locations or their roles change. Record decisions and lessons in the appropriate source rather than duplicating their full content here. Preserve distinctions between proposals, agreed rules, historical observations, and verified outcomes.
