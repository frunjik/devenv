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
- **Message approval (recorded 2026-10-06):** Before running `git commit`, present the drafted commit message to the user and let them approve it, edit it, or choose among alternatives, rather than committing it unilaterally. Applies to every commit, including regular feature work, not only meta/process changes. Default to a short, subject-only message (no body) unless the user asks for more detail on a given commit.

### P-006 — Ask Before Changing Surrounding Code

- **Recorded:** 2026-10-05
- **Source:** User instruction revising the surrounding-code restriction
- **Applies to:** Changes where existing code outside the immediate feature scope blocks a sound solution, especially styling and layout work.
- **Rule:** Existing surrounding code may be relied upon when reasonably stable, but must not be changed or removed without the user's permission. If a specific, non-generic part of surrounding code is a real blocker, explain the constraint, why a narrowly scoped change is needed, and its likely impact; ask permission before changing it.
- **Boundary:** Do not make broad or application-wide changes on this basis. If the blocker is generic or the impact is uncertain, keep it unchanged and offer a safer scoped alternative or ask for further direction.

### P-007 — Import Jest Globals Explicitly

- **Recorded:** 2026-10-06
- **Source:** User instruction
- **Applies to:** Test files created or modified for this system.
- **Rule:** Verify that every Jest helper a touched test file uses is explicitly imported from `@jest/globals`; put that import on the first line of the file.
- **Practice:** Import only the used helpers (for example, `describe`, `it`, `expect`, `beforeEach`, and `jest`). Do not rely on Jest's ambient globals in touched test files.

### P-008 — Ask Before Continuing Long Tasks

- **Recorded:** 2026-10-06
- **Source:** User instruction
- **Applies to:** Ongoing tasks that take more than three minutes.
- **Rule:** After more than three minutes of work, pause at the next stable point and ask the user whether to continue. Do not continue until the user explicitly permits it; stop if they ask to stop.
- **Loop:** If the user permits continuation, record any new user-provided rule in this register and the relevant project guidance before resuming. Apply the same three-minute gate again while the task remains ongoing.

### P-009 — Review Domain Wording for Vocabulary and Concerns

- **Recorded:** 2026-10-06
- **Source:** User instruction
- **Applies to:** Reviewing or working from note and Problem descriptions.
- **Rule:** When encountering a concept or wording in a note or Problem description, evaluate whether it warrants a Glossary entry, a new or refined Type, or another general system concern.
- **Practice:** Do not automatically add definitions or Types. Record justified candidates and distinguish them from agreed domain meaning; raise unresolved or consequential interpretations for user review.

### P-010 — Reflect on Meta-Level Knowledge

- **Recorded:** 2026-10-06
- **Source:** User instruction
- **Applies to:** Ongoing work, after it has been under way for a while (at the same stable points as the P-008 gate).
- **Rule:** Consider whether the work has produced knowledge worth recording at the outer (meta) level, such as improvements to the SC-NN numbering and concern conventions, or the realization that the same thing has been done repeatedly in different shapes. If so, make a note on the meta level.
- **Practice:** Record the note in `design/problem-inquiry-system/concerns.md` under "Meta Notes". Notes are observations and proposals, not decisions; raise consequential ones with the user.

### P-011 — Identify the Referenced Concern in Commit Messages

- **Recorded:** 2026-10-06
- **Source:** User instruction
- **Applies to:** Commit messages for changes that implement, extend, or register a System Concern (SC-NN).
- **Rule:** When a commit's primary subject is one or more SC-NN, start the commit subject with the identifier(s) followed by a colon and a short phrase describing what this commit contributes. That phrase describes this change, not the concern as a whole: a concern's Title in `concerns.md` is stable across every slice built toward it, while the commit phrase is specific to the current slice and will differ between commits against the same SC-NN.
- **Practice:** Prefer existing, already-understood vocabulary (a commit subject line) over inventing a new proprietary term for this pairing; the "Three ID schemes" meta note already flags the risk of home-grown naming unrelated to external conventions. When a commit touches several concerns, either lead with the most central one or list them (for example "Add SC-045 and SC-046: export to and import from external systems").
- **User override option:** The user may, at their own discretion and at any time, redefine `NN`, `XX` (the prefix shared by a whole category, for example all of `SC`), or both. The two scopes are written down differently:
  - A word for one concern's `NN` is local to that concern: record it in that concern's own entry in `concerns.md` and use it in that concern's subsequent commit subjects.
  - A word for `XX` renames the whole category, not one entry: reflect it everywhere that prefix's meaning is documented or used as a literal pattern — at minimum the Concern Record format/legend in `concerns.md`, the "Three ID schemes" Meta Note, and this principle itself.
  Do not pre-assign such words unprompted; this stays an option the user invokes, not a default naming step.

### P-012 — Review Naming Decisions From Either Direction

- **Recorded:** 2026-10-06; merged with the former P-013 on 2026-10-06 after the user flagged the two as one topic split across separate entries.
- **Source:** User instruction
- **Applies to:** Moments where a name for a new Type, Term, or other mapping/identifier is being considered or proposed, whichever side raises it.
- **Rule:** When a candidate name surfaces — whether I consider it mid-reasoning (per P-002/P-009) or the user proposes it directly — do not silently accept it or only record it in the artifact. Check it against existing names in `.glossary`, the shared Types, and the principle register for consistency (style, collisions with an existing meaning), then either ask the user for their view (if I raised the candidate) or report my honest assessment (if they raised it) before it is adopted.
- **Practice:** Keep this to genuine candidate Type/Term *names*, not every passing word already noted in the register. Use the `ask_user` tool when I raise a candidate; report findings plainly when the user raises one. Final agreement on any name still rests with the user; this is a check-and-surface step, not a veto.

### P-013 — *(retired, merged into P-012)*

- **Recorded:** 2026-10-06; retired 2026-10-06. Originally "Verify User-Suggested Names for Consistency and Sense" — the user pointed out, while asking for an honest evaluation of the pace of recent principle additions, that this was the same topic as P-012 split across two entries. Merged into P-012 rather than deleted, so the record of the change stays visible.

## Applying the Register

Keep the inquiry traceable from ticket and evidence through findings, decisions, and outcomes. Principles guide how work is performed; they do not by themselves establish domain facts or authorize unreviewed production changes.
