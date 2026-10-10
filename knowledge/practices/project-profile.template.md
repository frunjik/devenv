---
applyTo: "**"
description: "Project profile: project-specific rules, paths and commands for the generic Agent Essentials and Agent Phase Guide."
---
# Project profile

Project-specific rules for the generic [Agent Essentials](../../AGENTS.md) and [Agent Phase Guide](../agents/agent-phase-guide.agent.md). These rules apply together with the generic ones; ruleset changes here also require approval.

Replace each placeholder or remove sections that do not apply.

## Safeguards

- _Project-specific safeguards, for example runtime constraints on shared packages._

## Applicable defaults

Not completion gates; briefly justify meaningful deviations.

- **UI layout:** _layout system and where it is defined._
- **Tests:** _test-framework conventions for created or modified test files, for example required imports._

## WorkTask registry

Remove this section if tracking is not used. Tracking requires a registry; add an
evaluation ledger only if measurement is also used. Choices and on-request toggles
follow the generic core's tracking and measurement guidance.

- WorkTask registry: _path to the WorkPlan/WorkTask source._
- Evaluation ledger: _path to the evaluation ledger._
- _How to regenerate views of the registry and ledger._

## Commit subjects

- _Commit-subject conventions, if any._

## Repository quick reference

Informational.

- _Project layout._
- _Smallest relevant test, build and dev commands._
