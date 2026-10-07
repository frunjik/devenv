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

## Knowledge by Subject: Separation Experiment

**Decision (user, 2026-10-07):** Keep WMS subject knowledge separate from Problem Inquiry knowledge. First classify the existing records here without moving source files or choosing an external interchange format. The purpose is to understand the boundaries before possible extraction to an external meta/meta target.

These are working navigation categories, not a new Type hierarchy. Classify a passage by what it describes, not by its filename or the screen displaying it. A concern can contain domain knowledge as well as planning information; a Meta Note can contain a project-specific observation rather than a reusable principle.

| Subject | Knowledge and source locations | Boundary |
|---|---|---|
| **WMS subject knowledge** | [Warehouse scenario and assumptions](./explorations/2026-10-05-warehouse-web-modernization/README.md); operational scenarios and warehouse concepts in the [candidate model](./explorations/2026-10-05-warehouse-web-modernization/domain-model.md); source descriptions in the [input guide](../input-sources/README.md); report-specific evidence in [SC-001](./problem-inquiry-system/concerns.md#sc-001--distinguish-input-from-ticket) and [SC-002](./problem-inquiry-system/concerns.md#sc-002--preserve-source-provenance). | What warehouse work means and what the legacy/replacement system must support. Most of this material is hypothetical or scenario-derived, not validated warehouse knowledge. |
| **Problem Inquiry knowledge** | Source/note/ticket distinctions and workflow decisions in SC-001 through SC-017 in the [register](./problem-inquiry-system/concerns.md); review, lifecycle, storage, assignment, metrics, and dependency decisions in SC-020, SC-021, SC-028, SC-029, SC-042, SC-043, and SC-047; [problem-framing inquiry](./explorations/2026-10-05-problem-framing-assumption/README.md). | Meaning and behavior of the inquiry application: preserving uncertainty, human review, framing, and managing tickets. WMS examples inform this knowledge but are not its definition. |
| **Concern-planning knowledge** | [Concern record and acceptance conventions](./problem-inquiry-system/concerns.md#concern-record); SC-019, SC-035 through SC-040, and SC-056 in the [register](./problem-inquiry-system/concerns.md); work/Goal concepts in the [System Type review](../reviews/system-types.md#types-needed-to-express-and-track-work-toward-goals); [RICE decision model](../reviews/rice-prioritization.md). | How topics needing attention, work, prerequisites, progress, evidence, and acceptance are organized. A System Concern is not automatically a Work Item or an application Problem Ticket. |
| **Development/meta practices** | [Principles](../.agents/system-task-principles.md); [project guidance](../AGENTS.md); [TDD method](../.agents/test-driven-developer.agent.md); [Type-review method](../.agents/type-reviewer.agent.md); [removal method](../.agents/demolition-worker.agent.md); [domain-design skill](../skills/domain-type-design/SKILL.md); [development instructions](../WORKSPACE.md). | How builders and assistants perform and verify work. Keep reusable methods distinct from this repository's commands, paths, UI conventions, and commit preferences. |
| **Meta/meta observations** | [Meta Notes](./problem-inquiry-system/concerns.md#meta-notes), especially recurring duplication, principle evolution, and cadence evaluation; [knowledge soundness review](../reviews/knowledge-soundness-2026-10-07.md); SC-049 and SC-052 in the [register](./problem-inquiry-system/concerns.md). | Examining whether our planning, principles, vocabulary, and knowledge-preservation practices themselves work well. These observations and proposals do not become instructions merely by being recorded. |

### Cross-Cutting and Mixed Records

- The [Glossary](../.glossary) spans all these subjects. Do not export it wholesale as a single domain's agreed vocabulary; term-level classification and meaning remain to be resolved under SC-027.
- The [warehouse candidate model](./explorations/2026-10-05-warehouse-web-modernization/domain-model.md#keep-two-models-distinct) explicitly separates warehouse meaning from modernization knowledge. Its Claim, Evidence, PatternTrial, and ParityClaim concepts describe how we investigate replacement, not warehouse operations themselves.
- The [AI-assisted authoring exploration](./explorations/2026-10-05-ai-assisted-wms-authoring/README.md) describes builders' work in a WMS context. It is primarily development/meta inquiry, not evidence of actual warehouse rules or proof of useful AI assistance.
- The [Domain Design System model](./domain-design-system-model.md), [exploration](./domain-design-system-exploration.md), [Meta-Type rationale](./meta-type-system-purpose.md), and [Type Description model](./type-description-model.md) are proposals for describing domains and supporting consumers. They may be relevant to an external target, but neither the word "meta" nor a reusable shape establishes that they belong to that target or should be implemented there.
- The [System Type review](../reviews/system-types.md) mixes repository contract findings, conceptual testing knowledge, and goal-oriented planning. The [soundness review](../reviews/knowledge-soundness-2026-10-07.md) similarly crosses subjects; extract individual findings with their rationale rather than assigning the entire document to one domain.
- The [README](../README.md) mixes application behavior and development instructions. [Historical material](#practical-documentation-and-historical-material) supplies context, not current authority.

### Before Extracting or Moving Knowledge

For each selected passage, retain its source link and revision, subject/context, authority (proposal, agreed decision, or historical observation), supporting evidence and limits, and dependencies on other concepts. Keep the original available until the target's ownership and source-of-truth relationship are agreed.

Distinguish reusable meaning from local bindings: a public-interface testing principle may transfer, while a repository path, npm command, or concern-prefix preference may require adaptation. An external target must not silently promote a hypothesis to a rule, source provenance to verified truth, or a passed test to domain usefulness.

SC-027 remains the place to decide domain-scoped vocabulary; SC-049 remains the exploration of a portable Rule Set. This classification neither completes those concerns nor authorizes moving documents, exporting data, or implementing a new schema.

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
