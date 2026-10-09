---
name: tdd
description: "Use when implementing or changing production behavior. Apply Red-Green-Refactor with the smallest failing test first, minimal production changes, and explicit phase reporting."
---

# Test-Driven Development

Use this workflow for production-code changes. Do not claim to have performed TDD for documentation-only or design-only work.

## Red

1. Identify one new or changed behavior.
2. Write only the smallest focused test sufficient to fail for that behavior. Treat compilation failures as failures.
3. Run the test and observe the failure before changing production code. Report that the task is in the **Red** phase.

## Green

1. Write only enough production code to satisfy the failing test.
2. Run the focused test and verify it passes. Report that the task is in the **Green** phase.
3. Do not implement unrelated behavior or speculative future requirements.

## Refactor

1. Once tests are green, improve clarity and remove duplication without changing behavior.
2. Keep tests green throughout refactoring; rerun relevant checks after changes.
3. Report the **Refactor** phase and summarize the verification performed.

Follow the repository's applicable system principles for public-interface testing, coverage, mocking, type checks, and build requirements. This skill describes the TDD sequence; it does not replace project-specific verification policy.
