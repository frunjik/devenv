# Client test repair

## Checkpoint

- User opted into resumable tracking and WorkEvaluation metrics.
- Acceptance: full maintained client Jest suite and test-source type-check pass without reverting intended workflow display or Tools dropdown behavior.
- Baseline: 47 suites, 733 tests; 20 failures in AppComponent, 46 passing suites. Stale current-task assertions, dropdown queries outside the overlay, and unhandled workflow HTTP requests are observed causes.
- Test-only repair planned; HTTP and overlay boundaries remain mocked. No production behavior change intended. Next: update shell integration tests and rerun focused then full client suite.
- Completed: all 38 shell tests and full 47-suite/733-test client run pass; test-source TypeScript check and diff check pass. Update current-task assertions to active-workflow behavior, query Material menu actions through its overlay, and settle live workflow/version boundary requests without attempting to flush lifecycle-cancelled requests. Retain strict HTTP verification.
- Initial repair exposed an inappropriate wait for whole-app stability while HTTP remained pending; remove that wait since the no-animation menu renders synchronously. Follow-up run exposed cancelled-request cleanup and a remaining stale error assertion; both repaired without production edits.
- Metrics: completion 2026-10-10T01:38:52.919+02:00; 2m 45.424s wall-clock including opt-ins and verification. Active effort, waiting, latency and overhead unknown. Test-only: no production coverage/build requirement added; no new Type or runtime behavior introduced. Changes uncommitted. Next: user review or requested commit.
