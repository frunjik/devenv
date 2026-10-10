---
name: "tdd"
description: "Use when implementing or changing production behavior. Do not claim TDD for documentation-only or design-only work."
---

# Test-Driven Development

Use for production behavior changes; do not claim TDD for documentation or design alone.

## Before writing tests

Identify external dependencies and search nearby code and tests for existing boundary contracts and mocks/fakes. Reuse suitable contracts and plain mocks through injection.

If none fits, propose a small boundary based on the consumer's actual operations and lifecycle needs. Discuss consequential names and scope before implementation. Do not introduce interfaces for internal details merely to enable mocking.

## Red

Announce **Red** and its current goal before writing the focused failing test.

1. Identify one new or changed production behavior.
2. Write only the smallest focused test sufficient to fail for that behavior. Compilation failures count as Red.
3. Run the test and observe the failure before changing production code. Report the Red phase.

Do not claim TDD for documentation-only or design-only work.

## Green

Announce **Green** and its current goal before implementing the minimal production change.

1. Write only enough production code to satisfy the failing test.
2. Run the focused test and verify it passes. Report the Green phase.
3. Do not implement unrelated behavior or speculative future requirements.

## Refactor

Announce **Refactor** and its current goal before making any behavior-preserving cleanup.

1. Once tests are green, improve clarity and remove duplication without changing behavior.
2. Keep tests green throughout refactoring; rerun relevant checks after changes.
3. Report the Refactor phase and summarize verification.

## Public behavior and mocking

- Derive tests where possible from real problem-domain tasks and scenarios. Use realistic examples and observable outcomes through public interfaces, not private implementation details.
- Do not mock internal collaborators or use spies to inspect them. Use simple mocks at external/system boundaries while retaining actual application/domain behavior.
- Verify boundary arguments, results, errors and cleanup.
- Spies and fake time are allowed in boundary-adapter and mock/fake tests. Explain necessary interception; consumer tests should use injected boundary contracts.
- If interception is necessary in a consumer test, explain before using it why an existing or proposed boundary does not fit.

## Test isolation

Test setup, scenarios, cleanup and invoked application/subprocess behavior must not mutate real files or perform network I/O. Localhost servers, listeners and loopback requests are not exempt.

Read-only filesystem access, console logging, isolated test-local memory/DOM, and runner-generated reports/caches are allowed. These exceptions do not permit application-data writes.

## Coverage

- Require 100% statement, branch, function and line coverage on every production module changed by the task. Depending on an unchanged module does not expand that scope.
- Do not change production code merely to simplify tests or raise coverage. Before changing untestable code on that basis, demonstrate that it is unreachable and cannot be exercised through the public interface.
- If full coverage cannot be reached, report the uncovered code and blocker; do not claim the requirement is satisfied.

## Completion checks

- Follow [Agent Essentials' requested-outcome verification](../../../AGENTS.md#1-verify-the-requested-outcome).
- Run the narrowest relevant tests and all four coverage metrics for changed production modules.
- For TypeScript changes, run an appropriate type-aware check/build covering changed code and relevant consumers. Tests and editor diagnostics alone are insufficient.
- Review duplication after Green. Review practice compliance separately from behavior, coverage and build results, including boundary choices, test I/O and exceptions.
- Import used Jest helpers from `@jest/globals` on the first line of created or modified Jest test files.
- Report failures, blockers, unavailable checks and unrelated errors explicitly. Do not silently waive requirements.
