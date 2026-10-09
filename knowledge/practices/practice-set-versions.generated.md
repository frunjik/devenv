# Repository Practice Set History

Generated from [practice-set-versions.json](./practice-set-versions.json). Edit JSON, not this view.
Regenerate with `npm run generate:practice-set-versions:markdown` using [the registry renderer](../../scripts/practice-set-versions-markdown.cjs).

**Scope:** Repository\-controlled development rules and practices only\. Instructions supplied by the user, organization, platform, or runtime are outside this registry unless explicitly included\.

**Versioning policy:** Use sequential positive integers\. For each agent or skill, record its tracked revisions by kind and repository path, pinning each revision to the commit containing its content\. Version 1 establishes the initial tracked baseline, not necessarily the artifact's historical introduction\. Commit practice\-set changes first, then add one set\-level version entry in a follow\-up commit pinned to that prior practice\-change commit; never store a commit's own hash\. Record verified UTC activation and deactivation timestamps; null means unknown and must not be inferred from Git commit dates\.

**Latest recorded version:** **4**
**Active version:** **Not verified**
**Duration calculation as of:** Not recorded

Activation dates are recorded only when verified; Git commit dates do not establish when a version entered use.

## Version 1

**Changes:** Baseline before consolidating the coding workflow: TDD and Type Detector were separate custom agents, alongside the existing system principles and skills\.
**Source commit:** `bcea50e90ead2f3a02a83dc4be48fe8ea2601ed4`
**Activated:** Unknown
**Deactivated:** Unknown / not recorded
**Used for:** Unknown (activation dates not fully recorded)
**Activation evidence:** Not recorded
**Deactivation evidence:** Not recorded

## Version 2

**Changes:** TDD and Type Detector are reusable skills coordinated by the Diligent Coder agent; central system principles remain authoritative\.
**Source commit:** `47fced67cde5b94c813559090dedb4d76c793938`
**Activated:** Unknown
**Deactivated:** Unknown / not recorded
**Used for:** Unknown (activation dates not fully recorded)
**Activation evidence:** Not recorded
**Deactivation evidence:** Not recorded

## Version 3

**Changes:** Mock\-first dependency checks precede test writing; the focused work loop separately verifies practice compliance, requires explicit conflict handling rather than silent scope exemptions, and trials checklist reliability across three coding slices\.
**Source commit:** `a2b4ded9a2d8d753e7dffe1e8712e2263b80013c`
**Activated:** Unknown
**Deactivated:** Unknown / not recorded
**Used for:** Unknown (activation dates not fully recorded)
**Activation evidence:** Not recorded
**Deactivation evidence:** Not recorded

## Version 4

**Changes:** Concise checkpoint\-driven agent entry point links to exactly preserved detailed practices; separately prompts for tracking and metrics, and highlights stable\-summary commit subjects without changing policy\. Fresh\-chat consistency trial remains unverified\.
**Source commit:** `1565e27e87d17ed793b842a37abd6c20e76682a5`
**Activated:** Unknown
**Deactivated:** Unknown / not recorded
**Used for:** Unknown (activation dates not fully recorded)
**Activation evidence:** Not recorded
**Deactivation evidence:** Not recorded

## Agent and skill versions

### `.github/agents/demolition-worker.agent.md`

**Kind:** agent
**Current version:** 1
- **v1:** Tracked baseline of the agent that checks references before removing explicitly selected targets\. (source commit: `6df4051e0a7886dfd16c7d16fd7d74be8ad6066e`)

### `.github/agents/diligent-coder.agent.md`

**Kind:** agent
**Current version:** 1
- **v1:** Tracked baseline of the coding agent coordinating scoped implementation, TDD, Type Detector reviews, and verification\. (source commit: `47fced67cde5b94c813559090dedb4d76c793938`)

### `.agents/skills/domain-type-design/SKILL.md`

**Kind:** skill
**Current version:** 1
- **v1:** Tracked baseline of the goal\-oriented domain type design workflow\. (source commit: `d7df187a133f9d174d08ed61e64d790a88abe5b9`)

### `.agents/skills/tdd/SKILL.md`

**Kind:** skill
**Current version:** 1
- **v1:** Tracked baseline of the Red\-Green\-Refactor workflow for production behavior changes\. (source commit: `47fced67cde5b94c813559090dedb4d76c793938`)

### `.agents/skills/type-detector/SKILL.md`

**Kind:** skill
**Current version:** 1
- **v1:** Tracked baseline of the evidence\-first review for Types, invariants, and refinements\. (source commit: `47fced67cde5b94c813559090dedb4d76c793938`)

### `.agents/skills/typed-json-markdown/SKILL.md`

**Kind:** skill
**Current version:** 1
- **v1:** Tracked baseline of the workflow for authoritative Typed JSON and generated Markdown views\. (source commit: `d7df187a133f9d174d08ed61e64d790a88abe5b9`)

### `.agents/skills/ui-design-review/SKILL.md`

**Kind:** skill
**Current version:** 1
- **v1:** Tracked baseline of the review\-only workflow for running user interfaces\. (source commit: `d7df187a133f9d174d08ed61e64d790a88abe5b9`)
