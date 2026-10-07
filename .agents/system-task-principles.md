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
- **Source:** User instruction; `.agents/type-detector.agent.md`
- **Applies to:** Domain modeling, workflow design, and implementation that changes domain concepts or their representation.
- **Rule:** Regularly inspect the model for concepts that need a Type and existing Types whose boundaries or structure should be refined. Report a justified conviction that a Type is needed to the user; distinguish confirmed Types from candidates and unresolved questions.
- **Checkpoints:** After identifying the workflow concepts; after considering scope variation and important exceptions; and before completing the task.
- **Review prompts:** Are distinct lifecycle states, outcomes, evidence, decisions, scope levels, roles, or relationships being collapsed into strings or unstructured fields? Does a proposed Type have a distinct meaning, constraints, or lifecycle? Would separating it clarify the model, or merely add ceremony?

- **Knowledge-transfer modeling pattern (user, 2026-10-07):** Use [Example-Led Knowledge Modeling](../knowledge/practices/example-led-knowledge-modeling.md): meaning, a concrete Markdown example, a candidate Type, JSON, and a check that meaning is preserved. Try a contrasting example before choosing an authoritative representation. Ask for names before adopting them; do not equate a serialization format with the conceptual Type.

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
- **Original rule (automatic initiation superseded by the 2026-10-07 override below):** Once all tests are green, in-scope production code has 100% statement, branch, function, and line coverage, and no remaining Type cleanup or refactoring is identified, create a git commit for the completed scope before continuing to the next task step.
- **Exception:** Do not commit past an explicit user review; pause for that review instead. Keep the commit scoped to the completed work and follow the repository's commit-message conventions.
- **Message approval (recorded 2026-10-06):** Before running `git commit`, present the drafted commit message to the user and let them approve it, edit it, or choose among alternatives, rather than committing it unilaterally. Applies to every commit, including regular feature work, not only meta/process changes. The current default is short and subject-only, but this is a revisable preference, not a fixed rule — the user may change it at any point, and a past choice of style is not binding on later commits.

- **Commit initiation override (user, 2026-10-07):** Do not initiate commits or commit-approval prompts at stable checkpoints. Leave changes uncommitted unless the user explicitly requests a commit. This supersedes automatic initiation in the earlier rule, not the verification requirements or message approval after an explicit request.

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
- **Practice:** Record the note in `knowledge/domain-models/problem-inquiry-system/concerns.md` under "Meta Notes", numbered `Meta-NNN` in the order added (introduced 2026-10-06, same 3-digit style as `SC-NNN`/`P-NNN`). Notes are observations and proposals, not decisions; raise consequential ones with the user.
- **Meta-meta cadence (recorded 2026-10-06):** This whole project is a learning sandbox, not only a system being built. After roughly every 10 implemented feature slices (real code, tests, and a commit — not documentation-only or principle-only changes), step up a level beyond per-slice Meta Notes: evaluate whether the accumulated principles, conventions, and register are still serving that learning purpose, and report the evaluation to the user rather than only acting on it silently. Track the count toward 10 in the session database; reset it after each such evaluation.

### P-011 — Identify the Referenced Concern in Commit Messages

- **Recorded:** 2026-10-06
- **Source:** User instruction
- **Applies to:** Commit messages for changes that implement, extend, or register a System Concern (SC-NN).
- **Rule:** When a commit's primary subject is one or more SC-NN, start the commit subject with the identifier(s), rendered using the current commit-prefix preference below, followed by a colon and a short phrase describing what this commit contributes. That phrase describes this change, not the concern as a whole: a concern's Title in `concerns.md` is stable across every slice built toward it, while the commit phrase is specific to the current slice and will differ between commits against the same SC-NN.
- **Practice:** Prefer existing, already-understood vocabulary (a commit subject line) over inventing a new proprietary term for this pairing; the "Three ID schemes" meta note already flags the risk of home-grown naming unrelated to external conventions. When a commit touches several concerns, either lead with the most central one or list them (for example "SystemConcern-045, SystemConcern-046: record export and import concerns").
- **User override option:** The user may, at their own discretion and at any time, redefine `NN`, `XX` (the prefix shared by a whole category, for example all of `SC`), or both. The two scopes are written down differently:
  - A word for one concern's `NN` is local to that concern: record it in that concern's own entry in `concerns.md` and use it in that concern's subsequent commit subjects.
  - A word for `XX` renames the whole category, not one entry: reflect it everywhere that prefix's meaning is documented or used as a literal pattern — at minimum the Concern Record format/legend in `concerns.md`, the "Three ID schemes" Meta Note, and this principle itself.
- **Standing default (recorded 2026-10-06):** For now, always use `SystemConcern-NN` (PascalCase, no space or underscore) as the commit-subject prefix in place of `SC-NN`, without asking each time — the user settled on this after trying several styles live (Meta-008, Meta-017). This is still a current preference, not a permanent rule (see "Applying the Register" below); revisit if the user says otherwise.
  Do not pre-assign such words unprompted; this stays an option the user invokes, not a default naming step.
- **Clarification and pre-draft check (user, 2026-10-07; attribution updated by the override below):** Preserve the register's three-digit number in commit subjects, for example `SC-044` becomes `SystemConcern-044:`. Before drafting any commit message for approval, read P-005 and this principle, then check the current naming preference, the scope-specific subject, and the current attribution preference. Approval follows validation and does not replace it. Keep the short project guidance consistent with this preference. Automated enforcement is not authorized by this decision.
- **Co-author attribution override (user, 2026-10-07):** Omit the Copilot `Co-authored-by` trailer from commits until the user says otherwise. This is a standing waiver of the earlier trailer requirement, including when the assistant edits code or documentation; it is not limited to commit-message assistance. Commit initiation and message approval rules remain unchanged. The pre-draft check must use this current attribution preference rather than adding the earlier trailer.

### P-012 — Review Naming Decisions From Either Direction

- **Recorded:** 2026-10-06; merged with the former P-013 on 2026-10-06 after the user flagged the two as one topic split across separate entries.
- **Source:** User instruction
- **Applies to:** Moments where a name for a new Type, Term, or other mapping/identifier is being considered or proposed, whichever side raises it.
- **Rule:** When a candidate name surfaces — whether I consider it mid-reasoning (per P-002/P-009) or the user proposes it directly — do not silently accept it or only record it in the artifact. Check it against existing names in `.glossary`, the shared Types, and the principle register for consistency (style, collisions with an existing meaning), then either ask the user for their view (if I raised the candidate) or report my honest assessment (if they raised it) before it is adopted.
- **Practice:** Keep this to genuine candidate Type/Term *names*, not every passing word already noted in the register. Use the `ask_user` tool when I raise a candidate; report findings plainly when the user raises one. Final agreement on any name still rests with the user; this is a check-and-surface step, not a veto.

- **Definition and reference policy (user, 2026-10-07):** Glossary entries explain Terms; instructions for how we refer to them belong in working guidance, not their definitions. When referring to our current SubjectDomain, write `SubjectDomain (WMS)` to make the concrete subject explicit. This qualifies the reference, not the abstract Term's meaning.
- **Concrete reference rule (user, 2026-10-07):** For concepts we introduce, including process names and Terms, accompany the abstract name with a named concrete instance from the actual system or meta practice, for example `SubjectDomain (WMS)` or `KnowledgeStatement (commit-attribution)`. This improves reader understanding without equating the concept with that instance. Use a genuine instance, not an invented mapping; if none is known, make that gap explicit. Keep abstract Glossary definitions separate from this reference policy.
- **Example selection preference (user, 2026-10-07):** Prefer Term examples from SubjectDomain (WMS), DevEnv, or our meta practices. Choose a clear, genuine example; do not force a fit or invent domain facts. These are preferred example contexts, not a decision that each is a separate formal Domain.
- **SubjectDomain name override (user, 2026-10-07):** Rename the Glossary entry to `SubjectDomain (WMS AI)`, including the example in the Term name while retaining its abstract definition. The user shortened the initial wording "AI for WMS" to "WMS AI". Use this name for that example instead of the earlier `SubjectDomain (WMS)` reference preference. Historical WMS references retain their context; this rename does not assign defining Domains or change export scope.

### P-013 — *(retired, merged into P-012)*

- **Recorded:** 2026-10-06; retired 2026-10-06. Originally "Verify User-Suggested Names for Consistency and Sense" — the user pointed out, while asking for an honest evaluation of the pace of recent principle additions, that this was the same topic as P-012 split across two entries. Merged into P-012 rather than deleted, so the record of the change stays visible.

### P-014 — Keep Tests Free of Filesystem Mutations

- **Recorded:** 2026-10-06
- **Source:** User instruction; SC-053
- **Applies to:** Test setup, cleanup, and application/subprocess behavior exercised by tests.
- **Rule:** Do not write to or otherwise mutate the real filesystem from tests, including temporary fixtures. Reads are allowed. Use simple Boundary Mocks at filesystem or subprocess boundaries, retaining actual application/domain behavior under test.
- **Exception (user, 2026-10-06):** The test runner may write coverage reports and caches.
- **Migration:** Existing suites that perform mutations are tracked in SC-053. Migrate them in bounded slices without silently dropping persistence or Git behavior coverage.

### P-015 — Maintain Structured Data in JSON and Generate Markdown Views

- **Recorded:** 2026-10-07
- **Source:** User instruction
- **Applies to:** Structured data storage and transfer in this system, unless the user specifies otherwise.
- **Rule:** Use JSON as the source of truth for structured data. Generate Markdown views from that JSON rather than maintaining Markdown as a second authoritative copy.
- **Practice:** Keep the generated view reproducible from its JSON source, identify it as generated, and do not let application behavior depend on parsing the view when the structured JSON is available.

- **Format preference refinement (user, 2026-10-07):** Prefer structured formats over unstructured representations for data storage. The default order is **Typed JSON, then YAML, then Markdown**. Typed JSON means JSON with an explicit interface describing its structure; JSON alone is not typed, and an interface alone does not validate runtime input. Prefer generating `.md` views from the authoritative structured source rather than extracting the authoritative data from Markdown. Include this preference in the portable practices package, not only local project policy. Preserve meaning when choosing a format and record justified exceptions or explicit user choices. This does not authorize automatic migration of existing Markdown sources.

### P-016 — Verify Practices and Report Deviations

- **Recorded:** 2026-10-08
- **Source:** User instruction
- **Applies to:** Requested work, user proposals/actions encountered during that work, and the assistant's own approach.
- **Rule:** Use confirmed, applicable good practices rather than unverified assumptions. Check existing project processes first and consult maintained guidance, official documentation, or credible evidence where needed. Do not claim a preference or plausible recommendation is a confirmed standard.
- **Reporting:** When an approach conflicts with good practice or differs from an existing process, provide a concise report in the conversation: observation, applicable process or practice with evidence, likely impact, and recommended alternative. Distinguish a harmful practice from a legitimate variation; make uncertainty explicit. A separate persisted report is not required unless requested or needed by the existing workflow.
- **Decision boundary:** Raise consequential conflicts before implementing them and seek a decision where needed. Do not silently override project policy, automatically adopt an external recommendation, or expand the task into unrelated cleanup. An intentional deviation may be valid; record its agreed rationale in the appropriate existing checkpoint.
- **Actual instance:** DevEnv skills were initially stored in root `skills`, which is not a standard Copilot discovery location. The corrected project location is `.agents/skills`; file placement follows documented discovery conventions, while discovery on a receiving client still requires verification.
- **Optional method prompt (user, 2026-10-08):** When a decision compares competing optional work candidates, assess whether RICE is appropriate and ask whether to apply it before scoring. Use the [RICE prioritization guidance](../reviews/rice-prioritization.md): comparable contexts, explicit estimates and evidence, and separate decision rationale. Missing evidence is a reason to gather estimates or recommend a simpler comparison, not invent scores. Do not ask routinely for single already-selected tasks, use RICE to rank binding rules, or let it override dependencies and mandatory constraints.
- **Prioritization example:** The pending Principle Register Organization and Priority Review and Term Editing workflows are actual optional work candidates. RICE could inform their execution order only if a common goal/context and defensible estimates can be established; it would not establish precedence among the P-NNN rules themselves.

## Applying the Register

Keep the inquiry traceable from ticket and evidence through findings, decisions, and outcomes. Principles guide how work is performed; they do not by themselves establish domain facts or authorize unreviewed production changes.

Stylistic and naming choices the user makes within these principles (for example a commit-message length, a word for `XX`/`NN` per P-011, or a candidate Term per P-012) are current preferences, not permanent commitments. Treat them as part of an ongoing experiment: it is fine, and expected, for the user to revisit any of them later without needing special justification, and a past choice does not bind a future one.
