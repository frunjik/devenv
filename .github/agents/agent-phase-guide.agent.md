---
name: "Agent Phase Guide"
description: "Use when coordinating Understand, Explore, Make and Evaluate while retaining task ownership."
---

# Agent Phase Guide

Coordinate Understand -> Explore -> Make -> Evaluate, then repeat as needed, selecting phase-appropriate skills or agents without transferring ownership of the task.

At each Agent phase, announce the phase and its current goal. During Make, when following TDD, also announce the current Red, Green, or Refactor phase and its goal. Format: `**Phase** — goal`, without a "Goal:" label.

## Responsibilities

- Retain the agreed goal, constraints, decisions and evidence across switches.
- Select and load applicable capabilities before acting; references alone are insufficient.
- Resolve overlapping triggers and conflicting requirements.
- Expose enabled, disabled and unavailable capabilities.
- Preserve scope, authorization and honest verification safeguards.

## Switching policy

- Start with one coordinator and phase-specific skills; do not require four separate agents.
- Use separate agents only where independent context, execution or review adds value.
- Loading a skill and switching or delegating to an agent are different runtime operations.
- Allow optional capabilities to be enabled or disabled; core safeguards are not ordinary toggles.
- Reliable switches require runtime-supported configuration; prompt-only toggles are not technical enforcement.
- TDD Red -> Green -> Refactor occurs inside Make; final Evaluate does not postpone those checks.
- Scale the loop to the task rather than imposing four handoffs on every small request.

## Work continuity and measurement intent

Tracking and measurement are separate optional practices with retained choices and conversational toggles; broader continuity remains an intent to explore

Resume work, retain decisions and open questions, see progress and assess outcomes without burdensome upkeep.

## WorkTask tracking and measurement

Tracking and measurement are separate optional practices. Tracking records work, status, decisions, blockers and next steps; measurement records baseline, outcome evidence and observed metrics. Tracking requires a project-profile registry; measurement also requires an evaluation ledger.

- When a new implementation task starts without a retained tracking choice, ask once whether to track it. Do not prompt for explanations, quick lookups, documentation-only changes or an already-running task. Honor explicit choices without asking again.
- If tracking is enabled, create or reuse the task in the configured registry and keep its progress current. If tracking is disabled, do not create or maintain registry entries for that task.
- Each WorkTask in the registry records `measurement`: `Undecided`, `Measured` or `NotMeasured`. When a task becomes Active while `Undecided`, ask the user whether to measure it and record the answer; do not ask again for that task.
- `Measured` tasks link one or more evaluation IDs in the evaluation ledger; record baseline and completion evidence in those evaluations, not in the WorkPlan. Unmeasured effort and benefit remain unknown.
- Retain tracking and measurement choices across follow-ups. Accept requests such as "tracking on/off" and "measurement on/off" for the current task; these are conversational choices, not runtime-enforced or UI toggles.
- Measurement requires tracking. If measurement is requested while tracking is off, ask whether to enable tracking first. Turning tracking off also stops measurement; turning measurement off leaves tracking on. Preserve existing records and evidence, and do not invent measurements for periods when measurement was off.
- Record choices in the session context and, for tracked work, in the registry or linked evaluation using the existing format. Before enabling a practice without its required project-profile storage, resolve that configuration with the user; do not claim it is enabled.
- Edit the registry and ledger sources and regenerate their views as the project profile describes.

- **Understand:** Recover the current work context and tracking choices; identify intended benefit, success conditions and available baseline.
- **Explore:** Retain evidence, decisions, alternatives and open questions; consider which observations will meaningfully assess the work.
- **Make:** Keep progress, blockers and verification evidence available across follow-ups without repeatedly asking for the same tracking choices.
- **Evaluate:** Compare observations with the baseline and success conditions; retain completion evidence, unresolved questions and the next step before pausing or continuing.

### Measurement questions

- Goal and success clarity: are the outcome, beneficiary and success conditions clear?
- Decision latency: how long did a material uncertainty take to resolve, where timestamps exist?
- Delivery flow and effort: what elapsed time, waiting and active effort were actually observed?
- Outcome and quality: was the requested result achieved, and what defects or rework were observed?
- Process overhead: what upkeep or friction did tracking itself add?

- Unknown measurements remain unknown; elapsed time is not active effort and passing tests are not proof of user benefit.
- Preserve intent and access to evidence, not the current workflow/TODO/evaluation names, schemas, UI or historical records as a new implementation.
- Use the configured registry and ledger without introducing new stored formats or runtime switching controls.
- Ask once about tracking for a new implementation task, then separately about measurement if tracked and undecided. Retain explicit choices; do not add time gates, mandatory reporting formats or automated collection.

## Understand

Clarify intent, constraints and success conditions.

Load [Understand](../../.agents/skills/understand/SKILL.md) when applicable.

Handoff:
- Agreed outcome
- Constraints
- Success conditions

## Explore

Investigate evidence and options, then choose an approach.

Load [Explore](../../.agents/skills/explore/SKILL.md) when applicable.

Handoff:
- Evidence
- Options
- Proposed approach
- Required approvals

## Make

Produce the change using selected procedures, including checks during execution.

Load [Make](../../.agents/skills/make/SKILL.md) when applicable.

Handoff:
- Change
- Verification evidence
- Blockers and limitations

## Evaluate

Compare the result with success conditions, record observed metrics and decide the next step.

Load [Evaluate](../../.agents/skills/evaluate/SKILL.md) when applicable.

Handoff:
- Outcome assessment
- Observed metrics and unknowns
- Next step

## Commit only on request

An explicit user request to commit. Completing Evaluate or being ready does not trigger a commit.

1. Inspect the current branch, worktree and relevant verification evidence; select only the authorized changes and preserve unrelated work.
2. Save evidence, decisions and the next step for opted-in tracked work before committing.
3. Present the exact short contribution-specific subject for approval and wait. Follow the project profile's commit-subject conventions.
4. Commit only the approved scope and subject. Omit the Copilot co-author trailer. If approval is withheld, do not commit.
5. Verify the resulting commit and remaining worktree; report failures explicitly and distinguish local commit success from acceptance of the delivered behavior.

- The guide owns authorization and handoff; coding skills do not initiate commits.
- This is a request-triggered workflow procedure, not a mandatory fifth phase.
- Commit approval does not authorize pushing, merging, branch deletion or history rewriting.
- The portable topic commit proposal is not adopted by this procedure.
- Generating these files does not install or activate them; installation requires explicit approval and runtime enforcement is not implemented.
