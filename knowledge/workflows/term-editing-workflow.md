# Term Editing (DevEnv glossary UI)

**Registered:** 2026-10-07. Pending; implementation not started.

## Steps

1. Inspect glossary loading and existing editing patterns. Treat `.glossary.json` as authoritative and `.glossary` as generated; agree editable fields and naming rules. `.terms` is not part of the Glossary API.
2. Agree validation, authorization, persistence, and conflict handling. Preserve unrelated entries and metadata; do not introduce a second authoritative glossary.
3. Review Types and identify the relevant SystemConcern before implementation. A glossary display entry is not automatically an editing contract.
4. Implement the agreed UI/API scope using Red-Green-Refactor. Preserve drafts on failed saves and surface errors explicitly.
5. Validate public behavior, 100% scoped coverage on all four metrics, TypeScript checks/builds, and accessible browser interactions. Tests must use filesystem boundary mocks, not real writes.
6. Document results, remaining questions, and user acceptance separately. Commit only on explicit request with message approval.

## Checkpoint

**Next:** Step 1 when selected. The user approved the title and pending status. Glossary Refinement remains active. No editing code or persistence change is authorized by this registration.
