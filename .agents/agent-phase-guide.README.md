# AgentPhaseGuide

A portable set of agent instructions for doing software-engineering work through
**Understand -> Explore -> Make -> Evaluate**, repeating when needed.
One coordinator retains ownership of the task and loads applicable skills.
Four phases do not require four agents or four formal handoffs for every request.

This package contains guidance, not an application or a runtime enforcement system.
It includes no project application code, dependencies, test runner or tracking database.

## What is included

| File or folder | Purpose |
|---|---|
| [AGENTS.md](./AGENTS.md) | Always-on generic practices, defaults and safeguards. |
| [Agent Phase Guide](./.github/agents/agent-phase-guide.agent.md) | Optional coordinator agent with phase responsibilities and handoffs. |
| [Phase and supporting skills](./.agents/skills) | Understand, Explore, Make, Evaluate, TDD and opt-in UI design review. |
| [Project profile](./.github/instructions/project-profile.instructions.md) | Template for project-specific safeguards, layout, test conventions, commands and optional tracking storage. |
| [Glossary JSON](./.glossary.json) and [glossary Markdown](./.glossary) | Focused definitions and examples of the AgentPhaseGuide concepts. |
| [Export manifest](./agent-phase-guide.manifest.json) | Exported file list and the source commit identifying the package content. |

## Install and configure

1. Review the practices before adopting them. In particular, the generic setup
   requires TDD for production behavior changes and full changed-module coverage.
2. Copy the files into the receiving repository, preserving their relative paths.
   Inspect existing instructions, agents and skills first; reconcile conflicts
   rather than blindly overwriting another project's configuration.
3. Fill in the project profile or remove sections that do not apply. Replace
   placeholders with actual safeguards, test/build commands and project conventions.
   Do not treat placeholder registry or ledger paths as configured tracking storage.
4. Use a client supporting these customization locations. In VS Code with compatible
   Copilot support, the profile's `applyTo: "**"` targets all files. Other clients
   may require different discovery paths or explicit loading of the profile.
5. Open a fresh chat and verify that repository instructions, the Agent Phase Guide
   and the skills are discovered. Select the coordinator when wanted and verify
   applicable skills actually load; links and copied files alone do not prove invocation.
6. Try a small task and check the requested outcome and the observed workflow.
   Installation does not establish that these practices are effective in your project.

No npm installation is needed merely to copy these instruction files. The receiving
project supplies its own tools, test infrastructure and runtime capabilities.

## How the work loop operates

- **Understand:** establish intent, constraints and observable success conditions.
- **Explore:** inspect existing evidence, code, tests and boundaries; reuse suitable
  contracts and mocks, compare options and obtain required approvals.
- **Make:** produce the agreed change, checking it during execution.
- **Evaluate:** compare the result directly with success conditions; report evidence,
  failures, unknowns and the next step separately from practice compliance.

Announce the current phase and purpose using the format in AGENTS.md.
Scale the loop to the task; selecting or delegating
to another agent does not transfer responsibility for scope and authorization.

### TDD inside Make

For production behavior changes, [TDD](./.agents/skills/tdd/SKILL.md) requires:

1. **Red:** write a focused test and observe it fail before production changes.
2. **Green:** implement enough to pass and verify it.
3. **Refactor:** review duplication and cohesion; improve real responsibilities
   without changing behavior, keeping tests green.

Documentation-only work does not claim TDD. Tests use external boundary mocks/fakes,
not internal collaborator mocking, and must not mutate real files or perform network
I/O, including localhost. Read-only filesystem checks are allowed.
Changed production modules require 100% statement, branch, function and line coverage.
Coverage and passing tests do not replace verification of the actual requested outcome.

## Defaults and safeguards

The generic core includes TypeScript conventions: use `interface` for grouped records
and `type` for values, choices and named union alternatives. These apply to TypeScript,
not as a requirement to use TypeScript in every project.

Other applicable defaults include meaningful type/complexity review, typed JSON with
generated Markdown for structured data, nearby code conventions, and short comments
explaining non-obvious constructs. Narrative and native customization Markdown are
exceptions to the generated-data preference.

Safeguards include preserving unrelated work and stored formats, approval before
ruleset changes, honest reporting of unavailable checks, and commits only on explicit
request with approval of the exact subject. Commit approval does not authorize push,
merge, branch deletion or history rewriting.

[UI design review](./.agents/skills/ui-design-review/SKILL.md) is available only with
explicit request or agreement; it does not automatically implement changes.

## Optional tracking and measurement

These are distinct choices:

- **Tracking** records task status, decisions, blockers and next steps in a configured registry.
- **Measurement** records baseline, outcome evidence and observed metrics in a configured
  evaluation ledger. It requires tracking.

For a new implementation task without a retained choice, ask once whether to track it.
If tracked and measurement is undecided, ask separately whether to measure it.
Do not repeat prompts for ongoing work, explanations, quick lookups or documentation-only
changes. Retain choices across follow-ups.

Requests such as `tracking on`, `tracking off`, `measurement on` and `measurement off`
change the current task's conversational choices. Measurement on while tracking is off
requires agreement to enable tracking first. Tracking off stops both; measurement off
leaves tracking on. Preserve prior records and evidence; do not invent time or metrics
for periods without measurement.

Configure actual registry and ledger locations before enabling these practices.
This export supplies neither a schema implementation nor storage. Human active effort,
elapsed time, waiting and agent execution are not interchangeable; missing evidence
remains unknown.

## Provenance and limitations

The manifest pins the source commit used for export. It is not a signed integrity
certificate, an installation record, or proof that the receiving client follows the rules.
The glossary is derived from the source project's main glossary by selecting the
AgentPhaseGuide domain; it is explanatory data, not additional active rules.

There are no hooks, UI toggles, automatic phase-switching controls or runtime-enforced
tool restrictions in this package. Capabilities depend on the receiving client.
Review any host, organization and repository instructions for compatibility.
