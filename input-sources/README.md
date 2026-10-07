# Problem Inputs

`inbox/` holds unstructured incoming text. Imported, structured problem records belong under `problem-domain/problem-sets/`.

The original sample flow is:

1. [`inbox/wms-ticket-fragments.txt`](./inbox/wms-ticket-fragments.txt) contains eight synthetic free-text reports.
2. [`../problem-domain/problem-sets/wms-problem-set.sample.json`](../problem-domain/problem-sets/wms-problem-set.sample.json) contains their structured import as a `ProblemSet`.
3. Fragment labels (`WMS-001`, etc.) are retained as ticket IDs to make this sample's source mapping inspectable.

These are hypothetical examples from brainstorming, not observed incidents or verified WMS evidence. The text intentionally does not mirror the TypeScript fields. Preserve original source and uncertainty for real inputs.

Additional **unconverted** synthetic sources are also in the inbox:

- Grouped notes: [`grouped/operator-shift-notes.txt`](./inbox/grouped/operator-shift-notes.txt), [`grouped/screen-corpus-questions.txt`](./inbox/grouped/screen-corpus-questions.txt).
- Separate reports: [`unclear-validation-report.txt`](./inbox/unclear-validation-report.txt), [`unplaced-screen-note.txt`](./inbox/unplaced-screen-note.txt), [`ai-handoff-concern.txt`](./inbox/ai-handoff-concern.txt).

These added samples have not been imported into the structured ProblemSet.

The proposed distinction between source fragments, imported notes, and Problem Tickets—and the remaining provenance Type questions—is tracked under [SC-001 and SC-002](../knowledge/domain-models/problem-inquiry-system/concerns.md#sc-001--distinguish-input-from-ticket).
