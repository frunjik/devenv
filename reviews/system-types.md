# System Type Review

## Scope

Reviewed the shared client/server contracts and representative server and client usage. The README describes an experimental Angular client and Express API, but does not state measurable system goals. This review assesses type clarity and consistency; it cannot determine whether the type set completely expresses how the system achieves its goals.

## Findings

### Git status permits invalid or contradictory values

In [`projects/shared/src/lib/types.ts`](../projects/shared/src/lib/types.ts), `GitStatusFile.indexStatus` and `workTreeStatus` accept any string, while `staged`, `unstaged`, `untracked`, and `conflicted` encode facts derived from these status codes. The parser in [`projects/server/src/lib/handlers/git-status.ts`](../projects/server/src/lib/handlers/git-status.ts) derives these flags, but the type permits unsupported status codes and contradictory combinations.

Consider narrowing the status-code types and making derived state explicit or computed.

### Test-run types do not encode state invariants

[`TestRunCacheStatus`](../projects/shared/src/lib/types.ts) combines `available`, a status string, timestamps, and an exit code that can contradict one another. For example, it permits `available: false` with `status: 'passed'`. [`LastTestRun`](../projects/shared/src/lib/types.ts) permits combinations such as a non-null exit code and an error without defining their relationship.

Consider modeling the valid states as a discriminated union so impossible combinations cannot be constructed.

### Runtime data is trusted after type assertions

The shared response types describe expected shapes but do not validate data at runtime. For example, [`test-runner.ts`](../projects/server/src/lib/handlers/test-runner.ts) parses cached JSON and asserts it is `LastTestRun`; the generic HTTP helper in [`backend.service.ts`](../projects/client/src/app/backend.service.ts) similarly assumes responses match their requested type. Malformed cache contents or unexpected responses can therefore be treated as valid.

Validate external and persisted data at the boundary before treating it as a domain value.

### Current-entry formats are implicit

[`CurrentEntryService`](../projects/client/src/app/current-entry.service.ts) accepts a string that may contain either JSON with a description or legacy text. These alternatives are inferred at runtime rather than represented as a named type.

Consider naming the supported formats with a union and making the compatibility behavior explicit.

## Strengths

- Shared client/server contracts are centralized in `projects/shared/src/lib/types.ts`.
- `TestCommandEvent` is a discriminated union with clear event variants.
- Nullable and optional fields are used where absence is expected.

## Recommendations

1. **Document the system goals and boundary.** State the outcomes the client/server system is intended to achieve and how success is observed. Use these goals to decide which concepts belong in the domain model and to assess whether the current contracts are complete.
2. **Validate persisted and external data at its boundaries.** Parse cached test-run JSON and API responses before treating them as typed values. Prefer small, explicit parsers or type guards that report malformed data over unchecked assertions. This protects the existing contracts without requiring an immediate API redesign.
3. **Make test-run states mutually exclusive.** Replace the loosely related cache-status fields with a discriminated union for empty, passed, failed, and error outcomes. Define whether an error can include an exit code, and model `LastTestRun` consistently. Preserve the current JSON shape initially if compatibility with existing client code or cache files is required; otherwise migrate the server, client, and tests together.
4. **Constrain Git status codes and verify derived flags.** Introduce a finite type for the porcelain status characters supported by the parser. Keep the current booleans in the wire contract for compatibility, but test that they are always derived consistently from the status characters. Consider computing them from status codes in a later API revision rather than storing both representations.
5. **Name and isolate current-entry parsing.** Define explicit parsed variants for the structured feature record and legacy text, with a single parser at the client boundary. Keep the raw API string unchanged until producers and consumers can migrate together; add tests for valid structured entries, legacy entries, and malformed JSON.

## Overall Assessment

The contracts are a useful baseline, but the Git-status and test-run types could better encode valid states. Without documented system goals, the completeness of the type set cannot be assessed.
