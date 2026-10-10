import { validateWorkEvaluationDataset, type WorkEvaluation } from '../projects/shared/src/lib/value-evaluation.types';

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
    const intervals = rows.filter(row => row.elapsedMs !== null).map(row => ({
        start: Date.parse(row.startedAt!), end: Date.parse(row.completedAt!), category: row.category,
    }));
    // Split at every endpoint: same-category overlap counts once; competing categories stay unallocated.
    const endpoints = [...new Set(intervals.flatMap(interval => [interval.start, interval.end]))].sort((a, b) => a - b);
    for (let index = 1; index < endpoints.length; index++) {
        const start = endpoints[index - 1];
        const end = endpoints[index];
        const active = new Set(intervals.filter(interval => interval.start < end && interval.end > start).map(i => i.category));
        if (active.size === 0) continue;
        const category: WindowCategory = active.size === 1 ? [...active][0] : 'Cross-category overlap';
        observedWindowsMs[category] += end - start;
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

export function workEffortReportToMarkdown(report: WorkEffortReport): string {
    const summaryRows: [string, number][] = [
        ...Object.entries(report.observedWindowsMs),
        ['Problem + Meta subtotal', report.observedWindowsMs['Problem/Domain'] + report.observedWindowsMs['Meta/DevEnv']],
        ['Total observed union', report.observedTotalMs],
    ];
    const lines = [
        '# Problem/Domain versus Meta/DevEnv time evidence', '',
        'Generated from the report JSON snapshot. Regenerate; do not edit this view.', '',
        '## What can be concluded', '',
        'Human active effort: **unknown**. Waiting time: **unknown**. Agent/tool execution time: **unknown**.',
        'The table below describes the union of recorded evaluation delivery windows, not hours worked or the entire repository history.',
        'Same-category overlaps count once. Windows containing multiple categories are kept in Cross-category overlap, not assigned to either category.',
        'Mixed means inseparable outcomes; Unclassified means insufficient classification evidence. Gaps and incomplete intervals are excluded, not treated as zero effort.',
        'Percentages use only the recorded window union as denominator; they are not proportions of all work.', '',
        'Durations use hours:minutes:seconds, rounded to the nearest second. The Problem + Meta subtotal excludes Mixed, Unclassified and Cross-category overlap; the total includes all five categories. Subtotal and total rows summarize the categories and must not be added to them.', '',
        '| Window category | Duration (h:mm:ss) | Minutes | Share of observed union |',
        '|---|---:|---:|---:|',
        ...summaryRows.map(([category, ms]) =>
            `| ${category} | ${duration(ms)} | ${(ms / 60000).toFixed(2)} | ${report.observedTotalMs === 0 ? 'unknown' : `${(100 * ms / report.observedTotalMs).toFixed(2)}%`} |`),
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
