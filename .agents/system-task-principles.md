# System Task Principles

**Purpose:** Durable, additive principles for designing and implementing the system that guides problem tickets and challenges through inquiry to an insight or concrete result.

These principles are active from their recorded date and apply to future work in this system. Add later rules as new entries; do not silently replace existing ones. If principles conflict, identify the conflict and ask for a decision before choosing which to follow.

## Principle Register

### P-001 — Red-Green-Refactor

- **Recorded:** 2026-10-05
- **Source:** User instruction; `.agents/test-driven-developer.agent.md`
- **Applies to:** Production-code changes.
- **Rule:** Follow the TDD sequence: write and run the smallest focused test that fails; write only enough production code to pass it; once green, refactor without changing behavior and keep tests green.
- **Practice:** Do not write production code before a failing test. Treat compile failures as red. For non-code design work, make no claim of TDD execution.

### P-002 — Review for Missing or Refinable Types

- **Recorded:** 2026-10-05
- **Source:** User instruction; `.agents/type-reviewer.agent.md`
- **Applies to:** Domain modeling, workflow design, and implementation that changes domain concepts or their representation.
- **Rule:** Regularly inspect the model for concepts that need a Type and existing Types whose boundaries or structure should be refined. Report a justified conviction that a Type is needed to the user; distinguish confirmed Types from candidates and unresolved questions.
- **Checkpoints:** After identifying the workflow concepts; after considering scope variation and important exceptions; and before completing the task.
- **Review prompts:** Are distinct lifecycle states, outcomes, evidence, decisions, scope levels, roles, or relationships being collapsed into strings or unstructured fields? Does a proposed Type have a distinct meaning, constraints, or lifecycle? Would separating it clarify the model, or merely add ceremony?

### P-003 — Verify Type Safety Before Completion

- **Recorded:** 2026-10-05
- **Source:** User instruction
- **Applies to:** Coding tasks that change TypeScript.
- **Rule:** Before calling a coding task done, run an appropriate TypeScript-aware type-check or build covering the changed code, and resolve the resulting type errors.
- **Practice:** Choose the narrowest repository-supported command that checks the changed project and its relevant consumers. Tests and editor diagnostics alone do not establish type safety. If a check cannot run or has known unrelated failures, report that explicitly and do not claim full type-safety verification.

### P-004 — Domain-Driven Public-Interface Tests at Full Coverage

- **Recorded:** 2026-10-05
- **Source:** User instruction
- **Applies to:** Production code changed or relied on in a coding task.
- **Rule:** Achieve 100% statement, branch, function, and line coverage for the production code in scope. Derive tests, wherever possible, from known Problem Domain tickets, tasks, and scenarios. Exercise behavior through the public interface; do not test private implementation details.
- **Test boundaries:** Do not use spies or mock internal collaborators. Simple mocks are permitted only at external/system boundaries. Prefer realistic domain examples and observable outcomes.
- **Production-change restriction:** Do not change production code merely to make tests easier or coverage rise. If code cannot be covered, first demonstrate that it is unreachable and cannot be tested through the public interface; only then may production code be changed to improve or remove the unreachable behavior.
- **Verification:** Run coverage for all metrics on the in-scope production code. If 100% cannot be reached, explain the uncovered code and blocker; do not claim the rule is satisfied.

### P-005 — Commit at Stable Checkpoints

- **Recorded:** 2026-10-05
- **Source:** User instruction
- **Applies to:** Coding tasks that reach a validated, stable state.
- **Rule:** Once all tests are green, in-scope production code has 100% statement, branch, function, and line coverage, and no remaining Type cleanup or refactoring is identified, create a git commit for the completed scope before continuing to the next task step.
- **Exception:** Do not commit past an explicit user review; pause for that review instead. Keep the commit scoped to the completed work and follow the repository's commit-message conventions.

## Applying the Register

Keep the inquiry traceable from ticket and evidence through findings, decisions, and outcomes. Principles guide how work is performed; they do not by themselves establish domain facts or authorize unreviewed production changes.
