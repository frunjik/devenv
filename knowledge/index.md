# Project Knowledge Index

This index locates the knowledge accumulated while designing and building DevEnv. It is a navigation aid, not a replacement for the records themselves. Exploratory ideas, historical notes, agreed rules, and validation evidence have different authority.

## Topic Sections

- [Architecture](./architecture): current structure and deployment views.
- [Domain models](./domain-models): concepts, constraints, and the concern register.
- [Practices](./practices): reasoning, modelling, and portable guidance.
- [Workflows](./workflows): selection, checkpoints, and resumable work.
- [Research](./research): investigations and intact exploration collections.
- [Knowledge transfer](./knowledge-transfer): transfer examples and experiments.

Topics do not establish authority: retain each record's decisions, proposals, evidence, and limits. Active agent instructions remain outside this collection.

## Where to Start

When resuming work, consult:

1. The [System Concern register](./domain-models/problem-inquiry-system/concerns.md), including its [Meta Notes](./domain-models/problem-inquiry-system/concerns.md#meta-notes).
2. The [System Task Principles](../.agents/system-task-principles.md).
3. The [assistant/project guidance](../AGENTS.md).
4. The [Glossary](../.glossary).

## Decisions, Learning, and Working Rules

| Location | What we use it for |
|---|---|
| [System Concern register](./domain-models/problem-inquiry-system/concerns.md) | The main development knowledge register: concerns, open questions, user decisions, scope boundaries, Type assessments, progress, verification evidence, and acceptance status. |
| [Meta Notes](./domain-models/problem-inquiry-system/concerns.md#meta-notes) | Lessons about how we build and reason: recurring patterns, naming issues, evidence limitations, and reflections on the process. |
| [System Task Principles](../.agents/system-task-principles.md) | Agreed development principles, their source, scope, and practice: TDD, coverage, Type review, commit approval/naming, continuation checkpoints, and filesystem-free tests. |
| [AGENTS.md](../AGENTS.md) | Operational assistant guidance: project structure, commands, conventions, and summaries of the principles. Keep it consistent with the principle register. |
| [Glossary](../.glossary.json) | Authoritative structured definitions of domain/system vocabulary, including Problem, Inquiry, System Concern, Goal, and Work Item. The generated [Markdown view](../.glossary) is for human reading. |
| [Terms](../.terms) | Less structured terms and earlier workflow labels. This legacy file is excluded from the Glossary API; its entries are not automatically agreed definitions. |

## Knowledge by Subject: Separation Experiment

**Decision (user, 2026-10-07):** Keep WMS subject knowledge separate from Problem Inquiry knowledge. First classify the existing records here without moving source files or choosing an external interchange format. The purpose is to understand the boundaries before possible extraction to an external meta/meta target.

These are working navigation categories, not a new Type hierarchy. Classify a passage by what it describes, not by its filename or the screen displaying it. A concern can contain domain knowledge as well as planning information; a Meta Note can contain a project-specific observation rather than a reusable principle.

| Subject | Knowledge and source locations | Boundary |
|---|---|---|
| **WMS subject knowledge** | [Warehouse scenario and assumptions](./research/explorations/2026-10-05-warehouse-web-modernization/README.md); operational scenarios and warehouse concepts in the [candidate model](./research/explorations/2026-10-05-warehouse-web-modernization/domain-model.md); source descriptions in the [input guide](../input-sources/README.md); report-specific evidence in [SC-001](./domain-models/problem-inquiry-system/concerns.md#sc-001--distinguish-input-from-ticket) and [SC-002](./domain-models/problem-inquiry-system/concerns.md#sc-002--preserve-source-provenance). | What warehouse work means and what the legacy/replacement system must support. Most of this material is hypothetical or scenario-derived, not validated warehouse knowledge. |
| **Problem Inquiry knowledge** | Source/note/ticket distinctions and workflow decisions in SC-001 through SC-017 in the [register](./domain-models/problem-inquiry-system/concerns.md); review, lifecycle, storage, assignment, metrics, and dependency decisions in SC-020, SC-021, SC-028, SC-029, SC-042, SC-043, and SC-047; [problem-framing inquiry](./research/explorations/2026-10-05-problem-framing-assumption/README.md). | Meaning and behavior of the inquiry application: preserving uncertainty, human review, framing, and managing tickets. WMS examples inform this knowledge but are not its definition. |
| **Concern-planning knowledge** | [Concern record and acceptance conventions](./domain-models/problem-inquiry-system/concerns.md#concern-record); SC-019, SC-035 through SC-040, and SC-056 in the [register](./domain-models/problem-inquiry-system/concerns.md); work/Goal concepts in the [System Type review](../reviews/system-types.md#types-needed-to-express-and-track-work-toward-goals); [RICE decision model](../reviews/rice-prioritization.md). | How topics needing attention, work, prerequisites, progress, evidence, and acceptance are organized. A System Concern is not automatically a Work Item or an application Problem Ticket. |
| **Development/meta practices** | [Principles](../.agents/system-task-principles.md); [project guidance](../AGENTS.md); [TDD method](../.agents/test-driven-developer.agent.md); [Type-detection method](../.agents/type-detector.agent.md); [removal method](../.agents/demolition-worker.agent.md); [domain-design skill](../.agents/skills/domain-type-design/SKILL.md); [development instructions](../WORKSPACE.md). | How builders and assistants perform and verify work. Keep reusable methods distinct from this repository's commands, paths, UI conventions, and commit preferences. |
| **Meta/meta observations** | [Meta Notes](./domain-models/problem-inquiry-system/concerns.md#meta-notes), especially recurring duplication, principle evolution, and cadence evaluation; [knowledge soundness review](../reviews/knowledge-soundness-2026-10-07.md); SC-049 and SC-052 in the [register](./domain-models/problem-inquiry-system/concerns.md). | Examining whether our planning, principles, vocabulary, and knowledge-preservation practices themselves work well. These observations and proposals do not become instructions merely by being recorded. |

### Cross-Cutting and Mixed Records

- The [Glossary](../.glossary) spans all these subjects. Do not export it wholesale as a single domain's agreed vocabulary; the initial term classification below does not settle domain-specific meanings under SC-027.
- The [warehouse candidate model](./research/explorations/2026-10-05-warehouse-web-modernization/domain-model.md#keep-two-models-distinct) explicitly separates warehouse meaning from modernization knowledge. Its Claim, Evidence, PatternTrial, and ParityClaim concepts describe how we investigate replacement, not warehouse operations themselves.
- The [AI-assisted authoring exploration](./research/explorations/2026-10-05-ai-assisted-wms-authoring/README.md) describes builders' work in a WMS context. It is primarily development/meta inquiry, not evidence of actual warehouse rules or proof of useful AI assistance.
- The [Domain Design System model](./domain-models/domain-design-system-model.md), [exploration](./domain-models/domain-design-system-exploration.md), [Meta-Type rationale](./domain-models/meta-type-system-purpose.md), and [Type Description model](./domain-models/type-description-model.md) are proposals for describing domains and supporting consumers. They may be relevant to an external target, but neither the word "meta" nor a reusable shape establishes that they belong to that target or should be implemented there.
- The [System Type review](../reviews/system-types.md) mixes repository contract findings, conceptual testing knowledge, and goal-oriented planning. The [soundness review](../reviews/knowledge-soundness-2026-10-07.md) similarly crosses subjects; extract individual findings with their rationale rather than assigning the entire document to one domain.
- The [README](../README.md) mixes application behavior and development instructions. [Historical material](#practical-documentation-and-historical-material) supplies context, not current authority.

### Before Extracting or Moving Knowledge

For each selected passage, retain its source link and revision, subject/context, authority (proposal, agreed decision, or historical observation), supporting evidence and limits, and dependencies on other concepts. Keep the original available until the target's ownership and source-of-truth relationship are agreed.

Distinguish reusable meaning from local bindings: a public-interface testing principle may transfer, while a repository path, npm command, or concern-prefix preference may require adaptation. An external target must not silently promote a hypothesis to a rule, source provenance to verified truth, or a passed test to domain usefulness.

SC-027 remains the place to decide domain-scoped vocabulary; SC-049 remains the exploration of a portable Rule Set. This classification neither completes those concerns nor authorizes moving documents, exporting data, or implementing a new schema.

### Initial Glossary Classification by KnowledgeArea

**Decision (user, 2026-10-07):** Add `KnowledgeArea` as a provisional Glossary term and classify terms first, keeping the current glossary file and UI working. Separate files and shared-definition handling are not decided.

The following is the initial proposed subject mapping of the 50 terms present in [.glossary](../.glossary) when the classification was recorded, not a change to its definitions or a claim that those definitions have been domain-validated. Later additions, including MetaLayer and SubjectDomain, are not classified in this snapshot. Membership is non-exclusive. Shared terms remain defined once; use in an area does not transfer ownership or establish a new meaning. Unstructured entries in [.terms](../.terms) are not promoted to defined vocabulary by this mapping.

| Terms | Proposed KnowledgeAreas | Interpretation boundary |
|---|---|---|
| Term, Domain, Abstraction, System, Type, Type Instance, Contract, Glossary | Cross-cutting: applicable in all five areas | General vocabulary, not warehouse-specific definitions. A use in each area still needs context. |
| Problem, Inquiry, Evidence, System Observation, Artifact | WMS subject knowledge; Problem Inquiry; concern planning; development/meta practices; meta/meta observations | Shared inquiry/evidence vocabulary. A warehouse observation is not the same claim as a test observation or an observation about our process. |
| Goal, Acceptance Criterion, Goal Assessment | Problem Inquiry; concern planning; development/meta practices; meta/meta observations; potentially WMS subject knowledge | State the beneficiary, outcome, and assessment scope. Merely applying these words to a WMS example does not validate a warehouse goal. |
| System Concern, Work Item, Work Status, Dependency, Blocker, Deliverable, Progress | Concern planning; development/meta practices | These definitions describe planning/work. In particular, Dependency currently means a Work Item prerequisite, not automatically a ticket dependency or warehouse relation. |
| Test Case, Test Result, Test Suite, Coverage Scope, Coverage Metric, Coverage Report, Type Invariant | Development/meta practices; concern planning where verification evidence is assessed | Tests and coverage are engineering evidence, not direct proof of warehouse usefulness or Goal achievement. |
| Prioritization Candidate, Estimate, Impact Scale, RICE Model, RICE Assessment, Prioritization Decision, Reach, Impact, Confidence, Effort, Scoring Context, RICE Score, Monetary Cost, Monetary Comparison | Concern planning; potentially Problem Inquiry | These definitions belong to the conceptual prioritization model. The implemented ticket ratings and simplified metrics do not automatically have the same scales, units, or semantics. |
| Domain Design System, Domain Definition, Type Description, Hydration, Transformation | Development/meta practices; meta/meta observations | Exploratory domain-description and representation concepts. Their suitability for an external target remains undecided; they are not warehouse entities. |
| KnowledgeArea | Meta/meta observations; development/meta practices; concern planning | Provisional organizing term for this separation experiment; not an implemented Class or a ranked level. |

There are currently no warehouse-specific defined terms in `.glossary`. Warehouse candidate vocabulary stays provisional in the [WMS exploration](./research/explorations/2026-10-05-warehouse-web-modernization/domain-model.md). Likewise, note/proposal/ticket vocabulary is recorded in the [concern register](./domain-models/problem-inquiry-system/concerns.md), but is not automatically a Glossary definition.

Next decisions under SC-027 include which memberships to agree, whether a shared meaning needs area-specific refinement, and how separate glossaries would reference a shared definition without duplication. No glossary API, parser, or UI classification/filtering is introduced by this documentation step.

## Design Rationale and Exploratory Knowledge

These documents distinguish hypotheses and candidates from validated conclusions.

| Location | What we use it for |
|---|---|
| [Domain Design System](./domain-models/domain-design-system.md) | Entry point describing the proposed system and guiding ideas. |
| [Domain Design System model](./domain-models/domain-design-system-model.md) | Candidate goals, conceptual distinctions, areas of concern, and contracts. |
| [Domain Design System exploration](./domain-models/domain-design-system-exploration.md) | Inquiry methods, design lenses, and preserving learning toward implementation. |
| [Meta-Type System purpose](./domain-models/meta-type-system-purpose.md) | Rationale, prior art, benefits, and risks. |
| [Type Description model](./domain-models/type-description-model.md) | Exploration of machine-readable Type descriptions and consumers; no runtime format is committed. |
| [Warehouse modernization exploration](./research/explorations/2026-10-05-warehouse-web-modernization/README.md) and [candidate domain model](./research/explorations/2026-10-05-warehouse-web-modernization/domain-model.md) | Scenario-based reasoning about replacing a legacy warehouse UI, with candidate Terms and Types; not independently validated against the screen corpus. |
| [AI-assisted WMS authoring exploration](./research/explorations/2026-10-05-ai-assisted-wms-authoring/README.md) | Hypotheses and candidate models for human/AI collaboration, evidence, decisions, and continuity. |
| [Problem-framing exploration](./research/explorations/2026-10-05-problem-framing-assumption/README.md) | A planned paper exercise about separating observation, interpretation, cause, outcome, and response; planned, not conducted. |

## Reviews and Reusable Methods

| Location | What we use it for |
|---|---|
| [System Type review](../reviews/system-types.md) | Recorded findings, invariant problems, strengths, and candidate improvements; not proof that recommendations were implemented. |
| [Knowledge soundness review (2026-10-07)](../reviews/knowledge-soundness-2026-10-07.md) | Dated assessment of conceptual soundness and consistency across the indexed documents, with proposed improvements and review limits. Recommendations are pending discussion, not agreed rules. |
| [UI design review (2026-10-07)](../reviews/ui-design-review-2026-10-07.md) | Point-in-time visual review of selected DevEnv desktop/mobile views; records three improvement opportunities and evidence limits, with implementation progress tracked in a workflow checkpoint. |
| [RICE prioritization review](../reviews/rice-prioritization.md) | Scoring concepts, rules, contracts, and interpretation. |
| [Example-Led Knowledge Modeling](./practices/example-led-knowledge-modeling.md) | User-agreed pattern for deriving a knowledge-transfer model from meaning and contrasting examples before choosing an authoritative representation. |
| [Commit Process](./practices/commit-process.md) | First Markdown transfer example, distinguishing current procedure, local preferences, source decisions, overrides, and open modeling questions. Not an independent rule source or agreed export schema. |
| [Portable topic commit process](./practices/portable-commit-process.generated.md) | Typed JSON proposal and interactive setup for topic branches, incremental commits, separate push approval, and pipeline-owned integration. Not activated in DevEnv. |
| [MetaExport](./workflows/meta-export.md) | Provisional transfer concept for concern-planning and development/meta/meta-meta knowledge; starts from Commit Process and records what a candidate model must preserve. No external transmission or schema is agreed. |
| [Glossary MetaExport Example](./knowledge-transfer/glossary-meta-export-example.md) | Draft Markdown transfer example for three refined Terms, their approved usage assignments, and interpretation limits; not an agreed schema or authority. |
| [Glossary MetaExport JSON trial](./knowledge-transfer/glossary-meta-export-example.json) | Illustrative KnowledgeStatement JSON for the Glossary example; distinctions remain narrative and the structure is not authoritative. |
| [External agent and skill candidates (2026-10-07)](./research/agent-skill-landscape-2026-10-07.md) | Point-in-time research shortlist for possible agent/skill additions; recommendations are proposals, not adopted project guidance. |
| [Workflow TODO List](./workflows/workflow-todo-list.md) | Repository-wide workflow selection, status, and links to authoritative resume checkpoints; not a replacement for SystemConcerns or detailed steps. |
| [Full Glossary Export](./workflows/full-glossary-export-workflow.md) | Completed migration to authoritative `.glossary.json`, generated `.glossary` Markdown, and a JSON-consuming UI; checkpoint records verification. |
| [Domain Type design skill](../.agents/skills/domain-type-design/SKILL.md) | Reusable procedure for defining/reviewing goal-oriented domain Types and keeping vocabulary consistent. |
| [Typed JSON and Markdown skill](../.agents/skills/typed-json-markdown/SKILL.md) | JSON-to-Markdown generation and an optional reviewed extraction helper when no structured source exists; no automatic authority changes or bidirectional synchronization. |
| [TDD developer guidance](../.agents/test-driven-developer.agent.md) | Detailed Red-Green-Refactor method. |
| [Type detector guidance](../.agents/type-detector.agent.md) | Type-detection and review lens used at checkpoints. |
| [Type Detector findings (2026-10-07)](../reviews/type-detector-2026-10-07.json) | Authoritative future-enhancement record; distinguishes proposed refinements, unresolved questions, and leave-as-is conclusions. No implementation authorized. |
| [C4 research and recommendations (2026-10-07)](./research/c4-research-2026-10-07.json) | Sources, DevEnv view recommendations, evidence limits, and the requested diagram follow-up. |
| [DevEnv C4 views](./architecture/devenv-c4.md) | Authoritative JSON model and generated context, container, and local-development diagrams; current-architecture drafts for review. |
| [Portable practices and Glossary checklist](./practices/portable-practices-checklist.generated.md) | Preparation checklist for proposed cross-domain guidance; JSON owns checklist state, and existing project rules remain unchanged. |
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
