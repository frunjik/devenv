# Knowledge Organization Migration

**Status:** Completed; changes uncommitted.

## Checkpoint

**Decision:** The user approved renaming `design` to `knowledge` with architecture, domain-models, practices, workflows, research, and knowledge-transfer sections. Preserve meanings and clone exclusions; no commit requested.

**Progress:** Files organized into the six approved topics; the index explains their boundaries. Relative links, source references, runtime paths, UI labels, tests, package commands, and regeneration instructions updated. System Plan and Workflow TODO read the relocated resources. Workflow checkpoint references can reach generated practice documents without losing their relative path. Clone exports still exclude knowledge and reviews. Empty old folders removed.

**Verification:** Full maintained suites passed before the final cross-section test additions: 346 client and 229 server tests. Subsequent focused runs passed 22 client and 25 server tests, including the added cross-section and traversal cases. Changed workflow component and System Plan/Workflow TODO handlers achieved 100% statement, branch, function, and line coverage. Client/server test configurations and the relocated typed checklist passed TypeScript checks. Repository Markdown file links passed inspection; C4, MetaExport, and checklist views regenerated at their new paths. Formatting checks passed.

**Next:** Review the organization; commit only if requested, after subject approval.

**Limits:** No fresh browser interaction or production build was performed. Historical references to removed design artifacts remain historical, not live paths. Existing mixed records and their authority distinctions were preserved.

## Review Preparation

The first completion claim was too broad: a live exploration-storage instruction still referenced the old folder. That instruction is now corrected. A follow-up inspection verified all 34 original document destinations; comparison excluding path/link relocation found only index navigation, export wording, workflow tracking, a generated link label, and blank-line changes. All 165 local knowledge links, including heading anchors, passed a further check.

Review the rename-aware staged diff in three groups: relocated documents, external references and generation paths, then route/UI behavior and tests. Staging is for review only, not commit authorization. Untracked personal notes remain excluded.
