import { validateWorkEvaluationDataset, type WorkEvaluation } from '../projects/shared/src/lib/value-evaluation.types';
import { validateWorkPlanRegistry } from '../projects/shared/src/lib/work-plan.types';

export type WorkCategory = 'Problem/Domain' | 'Meta/DevEnv' | 'Mixed' | 'Unclassified';
type WindowCategory = WorkCategory | 'Cross-category overlap';
export interface WorkClassification {
    id: string;
    category: WorkCategory;
    rationale: string;
}
export interface ReportEvaluation extends WorkEvaluation {
    category: WorkCategory;
    rationale: string;
    elapsedMs: number | null;
}
export interface CommitEvidence {
    sha: string;
    authoredAt: string;
    committedAt: string;
    subject: string;
    category: 'Unclassified';
}
export interface WorkEffortReport {
    schemaVersion: 1;
    humanActiveEffortMs: null;
    waitingMs: null;
    agentExecutionMs: null;
    observedWindowsMs: Record<WindowCategory, number>;
    observedTotalMs: number;
    rows: ReportEvaluation[];
    commits: CommitEvidence[];
}
const categories: WorkCategory[] = ['Problem/Domain', 'Meta/DevEnv', 'Mixed', 'Unclassified'];

interface ObservedWindow {
    elapsedMs: number;
    rows: ReportEvaluation[];
}

function observedWindows(rows: ReportEvaluation[]): ObservedWindow[] {
    const intervals = rows.filter(row => row.elapsedMs !== null).map(row => ({
        start: Date.parse(row.startedAt!), end: Date.parse(row.completedAt!), row,
    }));
    const endpoints = [...new Set(intervals.flatMap(interval => [interval.start, interval.end]))].sort((a, b) => a - b);
    const windows: ObservedWindow[] = [];
    for (let index = 1; index < endpoints.length; index++) {
        const start = endpoints[index - 1];
        const end = endpoints[index];
        const active = intervals.filter(interval => interval.start < end && interval.end > start).map(interval => interval.row);
        if (active.length > 0) windows.push({ elapsedMs: end - start, rows: active });
    }
    return windows;
}

function validateClassifications(value: unknown, ids: Set<string>): Map<string, WorkClassification> {
    if (!Array.isArray(value)) throw new Error('Invalid work classification: expected an array');
    const result = new Map<string, WorkClassification>();
    for (const item of value) {
        if (item === null || typeof item !== 'object'
            || typeof item.id !== 'string' || !ids.has(item.id) || result.has(item.id)
            || !categories.includes(item.category) || typeof item.rationale !== 'string' || !item.rationale.trim()) {
            throw new Error('Invalid work classification: require a unique evaluation ID, category and rationale');
        }
        result.set(item.id, { id: item.id, category: item.category, rationale: item.rationale });
    }
    return result;
}

export function createWorkEffortReport(ledger: unknown, classifications: unknown, gitLog: string): WorkEffortReport {
    const dataset = validateWorkEvaluationDataset(ledger);
    const selected = validateClassifications(classifications, new Set(dataset.evaluations.map(e => e.id)));
    const rows = dataset.evaluations.map(evaluation => {
        let elapsedMs: number | null = null;
        if (evaluation.startedAt !== null && evaluation.completedAt !== null) {
            elapsedMs = Date.parse(evaluation.completedAt) - Date.parse(evaluation.startedAt);
            if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new Error(`Invalid evaluation interval: ${evaluation.id}`);
        }
        const classification = selected.get(evaluation.id);
        return {
            ...evaluation,
            category: classification?.category ?? 'Unclassified',
            rationale: classification?.rationale ?? 'No outcome classification supplied; no allocation inferred.',
            elapsedMs,
        };
    });
    const observedWindowsMs: Record<WindowCategory, number> = {
        'Problem/Domain': 0, 'Meta/DevEnv': 0, Mixed: 0, Unclassified: 0, 'Cross-category overlap': 0,
    };
    // Split at every endpoint: same-category overlap counts once; competing categories stay unallocated.
    for (const window of observedWindows(rows)) {
        const active = new Set(window.rows.map(row => row.category));
        const category: WindowCategory = active.size === 1 ? [...active][0] : 'Cross-category overlap';
        observedWindowsMs[category] += window.elapsedMs;
    }
    const commits: CommitEvidence[] = gitLog.split('\n').filter(Boolean).map(line => {
        const [sha, authoredAt, committedAt, ...subject] = line.split('\t');
        if (!/^[a-f0-9]{40}$/.test(sha) || !Number.isFinite(Date.parse(authoredAt))
            || !Number.isFinite(Date.parse(committedAt)) || subject.length === 0) {
            throw new Error('Invalid Git evidence: expected hash, author/commit timestamps and subject');
        }
        return { sha, authoredAt, committedAt, subject: subject.join('\t'), category: 'Unclassified' };
    });
    return {
        schemaVersion: 1, humanActiveEffortMs: null, waitingMs: null, agentExecutionMs: null,
        observedWindowsMs, observedTotalMs: Object.values(observedWindowsMs).reduce((a, b) => a + b, 0),
        rows, commits,
    };
}

function cell(value: string): string {
    return value.replace(/\|/g, '\\|').replace(/[\r\n]/g, ' ');
}

function duration(ms: number): string {
    const seconds = Math.round(ms / 1000);
    return `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function alignedTable(headers: string[], rows: string[][], numericColumns: number[]): string {
    const widths = headers.map((header, index) => Math.max(header.length, ...rows.map(row => row[index].length)));
    const separators = widths.map((width, index) => numericColumns.includes(index) ? `${'-'.repeat(width - 1)}:` : '-'.repeat(width));
    return [headers, separators, ...rows].map(row =>
        `| ${row.map((value, index) => numericColumns.includes(index) ? value.padStart(widths[index]) : value.padEnd(widths[index])).join(' | ')} |`).join('\n');
}

interface SliceTopic {
    key: string;
    label: string;
}

function sliceTopics(report: WorkEffortReport, registryValue: unknown): Map<ReportEvaluation, SliceTopic> {
    const registry = validateWorkPlanRegistry(registryValue);
    const links = new Map(report.rows.map(row => [row.id, new Map<string, string>()]));
    for (const plan of registry.workPlans) {
        for (const topic of plan.topics) {
            for (const task of topic.tasks) {
                for (const id of task.evaluationIds) {
                    const linked = links.get(id);
                    if (!linked) throw new Error(`Invalid WorkPlanRegistry: unknown evaluation "${id}"`);
                    linked.set(topic.id, `${plan.title} / ${topic.title}`);
                }
            }
        }
    }
    return new Map(report.rows.map(row => {
        const linked = links.get(row.id)!;
        const labels = [...linked.values()].sort((a, b) => a.localeCompare(b));
        return [row, {
            key: JSON.stringify([...linked.keys()].sort()),
            label: labels.length === 0 ? 'No linked WorkPlan topic'
                : labels.length === 1 ? labels[0] : `Multiple linked topics: ${labels.join('; ')}`,
        }];
    }));
}

export function workEffortReportSlicesToMarkdown(report: WorkEffortReport, registryValue: unknown): string {
    const topics = sliceTopics(report, registryValue);
    const windows = observedWindows(report.rows);
    const rows: string[][] = [];
    const append = (label: string, category: string, topic: string, ms: number | null, untimed: number) => {
        rows.push([cell(label), category, cell(topic), ms === null ? 'unknown' : duration(ms),
            ms === null ? 'unknown' : (ms / 60000).toFixed(2), String(untimed)]);
    };
    for (const category of categories) {
        const members = report.rows.filter(row => row.category === category);
        if (members.length === 0) continue;
        const groups = new Map<string, ReportEvaluation[]>();
        for (const row of members) {
            const key = topics.get(row)!.key;
            const group = groups.get(key) ?? [];
            group.push(row);
            groups.set(key, group);
        }
        const allocated = new Map([...groups.keys()].map(key => [key, 0]));
        let crossTopicMs = 0;
        for (const window of windows) {
            if (!window.rows.every(row => row.category === category)) continue;
            const active = new Set(window.rows.map(row => topics.get(row)!.key));
            if (active.size > 1) {
                crossTopicMs += window.elapsedMs;
            } else {
                const key = [...active][0];
                allocated.set(key, allocated.get(key)! + window.elapsedMs);
            }
        }
        const sortedGroups = [...groups.values()].sort((a, b) =>
            topics.get(a[0])!.label.localeCompare(topics.get(b[0])!.label)
            || topics.get(a[0])!.key.localeCompare(topics.get(b[0])!.key));
        for (const group of sortedGroups) {
            const topic = topics.get(group[0])!;
            group.sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
            for (const row of group) {
                const description = `${row.id}: ${row.title}`;
                append(description.length > 64 ? `${description.slice(0, 61)}...` : description,
                    category, topic.label, row.elapsedMs, Number(row.elapsedMs === null));
            }
            append('Topic total', category, topic.label,
                group.some(row => row.elapsedMs !== null) ? allocated.get(topic.key)! : null,
                group.filter(row => row.elapsedMs === null).length);
        }
        if (crossTopicMs > 0) append('Cross-topic overlap', category, '-', crossTopicMs, 0);
        append('Category total', category, '-',
            members.some(row => row.elapsedMs !== null) ? report.observedWindowsMs[category] : null,
            members.filter(row => row.elapsedMs === null).length);
    }
    append('Cross-category overlap', 'Cross-category overlap', '-', report.observedWindowsMs['Cross-category overlap'], 0);
    append('Total observed union', 'All categories', '-',
        report.rows.some(row => row.elapsedMs !== null) ? report.observedTotalMs : null,
        report.rows.filter(row => row.elapsedMs === null).length);
    return [
        '## Recorded slices', '',
        `Recorded evaluations: ${report.rows.length}. This lists available evaluation records, not every historical change in the repository.`,
        'Durations are elapsed delivery windows, not active effort. Individual elapsed values overlap and must not be summed.',
        'Ordered by category, WorkPlan topic, then slice title and ID. Unlinked slices stay in No linked WorkPlan topic; multiple links form one explicit combined group.',
        'Topic totals exclude cross-category and cross-topic overlaps, which have separate rows. Category totals include cross-topic overlap but exclude cross-category overlap.',
        'Untimed counts identify excluded unknown intervals; totals with no complete intervals remain unknown. Subtotals and totals must not be added to their detail rows.', '',
        alignedTable(['Slice (evaluation ID: title)', 'Category', 'WorkPlan topic', 'Duration (h:mm:ss)', 'Minutes', 'Untimed'], rows, [3, 4, 5]),
    ].join('\n');
}

export function workEffortReportSummaryToMarkdown(report: WorkEffortReport): string {
    const summaryRows: [string, number][] = [
        ...Object.entries(report.observedWindowsMs),
        ['Problem + Meta subtotal', report.observedWindowsMs['Problem/Domain'] + report.observedWindowsMs['Meta/DevEnv']],
        ['Total observed union', report.observedTotalMs],
    ];
    const headers = ['Window category', 'Duration (h:mm:ss)', 'Minutes', 'Share of observed union'];
    const rows = summaryRows.map(([category, ms]) => [
        category, duration(ms), (ms / 60000).toFixed(2),
        report.observedTotalMs === 0 ? 'unknown' : `${(100 * ms / report.observedTotalMs).toFixed(2)}%`,
    ]);
    return [
        'Human active effort: **unknown**. Waiting time: **unknown**. Agent/tool execution time: **unknown**.',
        'The table below describes the union of recorded evaluation delivery windows, not hours worked or the entire repository history.',
        'Same-category overlaps count once. Windows containing multiple categories are kept in Cross-category overlap, not assigned to either category.',
        'Mixed means inseparable outcomes; Unclassified means insufficient classification evidence. Gaps and incomplete intervals are excluded, not treated as zero effort.',
        'Percentages use only the recorded window union as denominator; they are not proportions of all work.', '',
        'Durations use hours:minutes:seconds, rounded to the nearest second. The Problem + Meta subtotal excludes Mixed, Unclassified and Cross-category overlap; the total includes all five categories. Subtotal and total rows summarize the categories and must not be added to them.', '',
        alignedTable(headers, rows, [1, 2, 3]),
    ].join('\n');
}

export function workEffortReportToMarkdown(report: WorkEffortReport): string {
    const lines = [
        '# Problem/Domain versus Meta/DevEnv time evidence', '',
        'Generated from the report JSON snapshot. Regenerate; do not edit this view.', '',
        '## What can be concluded', '',
        workEffortReportSummaryToMarkdown(report),
        '',
        `Evaluations reviewed: ${report.rows.length}. Complete intervals: ${report.rows.filter(row => row.elapsedMs !== null).length}.`,
        `Unfinished or untimed evaluations: ${report.rows.filter(row => row.elapsedMs === null).length}.`,
        `Reachable commits inventoried: ${report.commits.length}; all commit durations and outcome classifications remain unknown.`,
        '',
        '## Evaluation evidence', '',
        'Source: [evaluation ledger](./devenv-value-evaluation.json). IDs identify exact records; the JSON snapshot retains original timestamps, outcomes and metric evidence.',
        'Individual elapsed values below overlap and must not be summed.', '',
        '| Evaluation | Category | Elapsed minutes (not effort) | Classification rationale |',
        '|---|---|---:|---|',
        ...report.rows.map(row => `| ${cell(row.id)}: ${cell(row.title)} | ${row.category} | ${row.elapsedMs === null ? 'unknown' : (row.elapsedMs / 60000).toFixed(2)} | ${cell(row.rationale)} |`),
        '', '## Git evidence inventory', '',
        'Author and commit dates are events, not work intervals. No time is inferred from commit gaps. Inspect referenced diffs before assigning older work to outcomes.',
        '| Commit | Author timestamp | Commit timestamp | Subject |',
        '|---|---|---|---|',
        ...report.commits.map(commit => `| ${commit.sha} | ${commit.authoredAt} | ${commit.committedAt} | ${cell(commit.subject)} |`),
        '',
    ];
    return lines.join('\n');
}
