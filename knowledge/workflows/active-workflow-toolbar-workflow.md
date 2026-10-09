# Active workflow in status toolbar

## Checkpoint

**Status:** Completed; canvas selection restored.

## Toolbar design refinement (2026-10-09)

- User approved all five design recommendations and a separate evaluation (`toolbar-design-refinement`). Empty recorded phase is displayed as TDD: idle, explicitly meaning no recorded phase. Errors remain unavailable, not idle.
- Workflow control is at least 32px tall on desktop and 44px narrow, with 12px label and 13px name, visible Refresh text, keyboard focus outline, full-name tooltip, and deliberate compact label/name arrangement on narrow screens. Phase line-height is explicit; narrow phase and workflow remain side by side in the second toolbar row.
- TDD Red observed old labels and 22px/123px workflow/toolbar heights. Green: six tests pass with 100% four-metric component coverage and client build passes. Refactor removed redundant spacing; tests stay green. Test-source check has no toolbar diagnostics; unrelated existing test errors remain.
- Visible geometry at widths 1200, 380, and 320: workflow height 32/44/44px; toolbar 44/97.781/97.781px. No horizontal overflow or canvas overlap. Keyboard navigation activates the 2px focus-visible outline. Existing bottom reservation retained; no shell edits required.
- Recorded each actual phase in .rgr-phase, verified file/API, and cleared it after TDD completion. Toolbar phase can lag by its 30-second polling interval. Canvas selection restored. Final visible browser shows TDD: idle and the canvas workflow; at 320px the name truncates visually but the full name remains available through the tooltip and accessible description. Narrow screenshot confirms two-row grouping and focus outline. Refresh text contrast is 6.79:1; focus outline contrast against toolbar is 8.02:1. Existing workflow text contrast remains above 4.5:1.
- Completed at 2026-10-09 22:29:23 CEST. A hidden-tab interaction stalled during verification and was retried only after visibility was restored; the stalled check is not treated as acceptance evidence. Elapsed time includes permission and visibility waits; active effort and follow-up outcome remain unknown.
- Type review: presentation refinements reuse existing phase and workflow meaning; no new domain Type. No additional meta-level insight identified. Changes remain uncommitted.

**Purpose:** Show the registered active workflow in the bottom toolbar without changing the feature-store Current task or its commit-message use.

**Acceptance:** Load immediately, refresh every 30 seconds and on click, explicitly display loading, failure, and no-active states, recover after failure, and stop polling and cancel outstanding requests on toolbar destruction. Preserve narrow-screen wrapping.

**Evaluation:** `active-workflow-status-toolbar` records all five existing metrics; unmeasured values remain unknown.

**Decision:** User approved a separate interlude workflow and evaluation. Canvas checkpoint is saved in its existing detailed workflow. Restore canvas selection when this interlude completes.

**Progress:** Red observed missing workflow control. Angular fake-time helper was incompatible with the maintained Jest setup; use Jest fake timers only at the timer boundary. Implemented a separate workflow button, immediate/30-second/manual refresh, explicit display states, and request/polling cleanup. All six focused tests passed before the latest test additions, but the coverage command failed its required threshold: statements 95.12%, branches 100%, functions 88.88%, lines 94.87%. The uncovered code was the existing server-version error path. Added that scenario and outstanding-request cancellation assertions afterward; these latest tests have not yet run. No final build, test-source type-check, or browser layout verification has run for this change.

**Type review:** Reuse WorkflowTodoList's activeWorkflow representation; selection remains distinct from the feature-store Current task. Loading/error fields represent fetch presentation, not a new agreed domain Type. No new Type name adopted.

**Verification:** All six focused tests pass with 100% statement, branch, function, and line coverage for status-toolbar.component.ts. Immediate/manual/timed refresh, no selection, failure/recovery, superseded-request cancellation, and destruction cleanup pass. Client build passes. Test-source type-check caught a Jest-returning afterEach callback; corrected to return void. No changed-file diagnostics remain; unrelated existing Glossary and Workflow TODO test errors still prevent a full passing check.

**Layout:** Visible browser at 1200 x 900 and 380 x 800 shows the selected workflow and separate Current task. Narrow toolbar was about 123px tall and exceeded the old 88px reservation; user approved increasing shell reservation to 132px. Narrow canvas ends at 639px above toolbar top 677.469px; desktop canvas ends at 822px above toolbar top 856px. No page overflow; backing dimensions match content. Manual refresh reads the saved selection.

**Automatic refresh:** Without a click or page reload, the toolbar picked up the restored InteractiveCanvas selection by 2026-10-09 22:12:59 CEST. The 30-second interval is additionally verified with fake timers.

**Next:** Resume the saved canvas checkpoint (real high-density rendering remains outstanding). No feature-store task or commit-message source changes were made. Changes remain uncommitted.

**Pause:** User chose to pause at the three-minute continuation gate. No completion, effort estimate, or runtime acceptance is inferred. The evaluation remains open. No additional meta-level insight identified.

## Scheduling boundary refinement (2026-10-09)

**View-only follow-up:** User requested removing Current task from the toolbar view. Removed its template control only; retained the service/input, application polling, and commit-message source. Active workflow and phase remain visible. No new domain Type or scheduling change.

- User approved IScheduler as the recurring-work boundary, reopening this workflow with a separate five-metric evaluation (`toolbar-scheduling-boundary`). This is not an IClock: the toolbar schedules refreshes but does not read the current time.
- Contract: every(milliseconds, callback) registers recurring delivery, with the first callback after the interval, and returns cancellation. Real implementation delegates to setInterval/clearInterval. Angular SCHEDULER token provides the adapter. Existing Subscription owns cancellation on toolbar destruction.
- Plain MockScheduler records the requested interval and delivers explicit ticks; toolbar tests contain no Jest timer patches. Adapter tests alone use Jest fake time to verify no immediate/early delivery, repeated delivery, and cancellation.
- Red: both suites failed because the boundary module was missing. Green: seven tests pass with 100% statement, branch, function, and line coverage for scheduler.ts and status-toolbar.component.ts; client build passes. Test-source check has no scheduler/toolbar diagnostics, but unrelated existing test errors remain.
- Type review: consumer-derived recurring scheduling is a justified role interface, distinct from canvas current-time reads and animation-frame delivery. No broader timer migration or clock abstraction added. Cancellation is a lifecycle obligation tested behaviorally, not guaranteed by the signature alone. No additional meta-level insight identified.
- Canvas selection restored; visible-browser toolbar picked it up automatically without a click or reload by 2026-10-09 22:17:16 CEST. Refinement complete. Changes remain uncommitted.
