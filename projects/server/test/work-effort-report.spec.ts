import { describe, expect, it } from '@jest/globals';
import { createWorkEffortReport, workEffortReportToMarkdown } from '../../../scripts/work-effort-report';

function evaluation(id: string, start: string | null, end: string | null) {
    return {
        id, title: id, beneficiary: 'User', intendedOutcome: 'Deliver an outcome',
        successCondition: 'Outcome verified', baseline: 'Not available',
        startedAt: start, completedAt: end, measures: [{ metricId: 'effort', value: null, evidence: null }],
    };
}
const timestamp = (minute: number) => `2026-10-10T00:${String(minute).padStart(2, '0')}:00Z`;
const ledger = {
    schemaVersion: 1, metrics: [{ id: 'effort', name: 'Effort', definition: 'Observed effort', interpretation: 'Unknown stays unknown' }],
    evaluations: [
        evaluation('domain', timestamp(0), timestamp(20)),
        evaluation('domain-overlap', timestamp(5), timestamp(15)),
        evaluation('meta', timestamp(10), timestamp(30)),
        evaluation('mixed', timestamp(35), timestamp(40)),
        evaluation('unknown', timestamp(40), timestamp(45)),
        evaluation('unfinished', timestamp(50), null),
        evaluation('untimed', null, null),
    ],
};
const classifications = [
    { id: 'domain', category: 'Problem/Domain', rationale: 'Supported domain behavior.' },
    { id: 'domain-overlap', category: 'Problem/Domain', rationale: 'Supported domain behavior.' },
    { id: 'meta', category: 'Meta/DevEnv', rationale: 'Workflow upkeep.' },
    { id: 'mixed', category: 'Mixed', rationale: 'Inseparable outcomes.' },
];
const gitLog = `${'a'.repeat(40)}\t2025-04-18T00:00:00Z\t2025-04-18T01:00:00Z\tInitial commit\n`;

describe('work effort report', () => {
    it('counts each observed minute once and keeps cross-category overlap separate', () => {
        const report = createWorkEffortReport(ledger, classifications, gitLog);
        expect(report.observedWindowsMs).toEqual({
            'Problem/Domain': 10 * 60000,
            'Meta/DevEnv': 10 * 60000,
            Mixed: 5 * 60000,
            Unclassified: 5 * 60000,
            'Cross-category overlap': 10 * 60000,
        });
        expect(report.observedTotalMs).toBe(40 * 60000);
        expect(report.humanActiveEffortMs).toBeNull();
        expect(report.waitingMs).toBeNull();
        expect(report.agentExecutionMs).toBeNull();
        expect(report.rows.filter(row => row.elapsedMs !== null)).toHaveLength(5);
        expect(report.rows.find(row => row.id === 'unfinished')?.elapsedMs).toBeNull();
        expect(report.rows.find(row => row.id === 'unknown')?.category).toBe('Unclassified');
        expect(report.commits).toEqual([{
            sha: 'a'.repeat(40), authoredAt: '2025-04-18T00:00:00Z',
            committedAt: '2025-04-18T01:00:00Z', subject: 'Initial commit',
            category: 'Unclassified',
        }]);
        const markdown = workEffortReportToMarkdown(report);
        expect(markdown).toContain('| Problem/Domain | 0:10:00 | 10.00 | 25.00% |');
        expect(markdown).toContain('| Meta/DevEnv | 0:10:00 | 10.00 | 25.00% |');
        expect(markdown).toContain('| Problem + Meta subtotal | 0:20:00 | 20.00 | 50.00% |');
        expect(markdown).toContain('| Total observed union | 0:40:00 | 40.00 | 100.00% |');
        expect(markdown).toContain('Human active effort: **unknown**');
        expect(markdown).toContain('Initial commit');
        expect(markdown).toContain('devenv-value-evaluation.json');
        expect(markdown).toContain('Unfinished or untimed evaluations: 2');
    });

    it('handles no usable intervals without reporting zero active effort or invented proportions', () => {
        const report = createWorkEffortReport({ ...ledger, evaluations: [evaluation('unknown', null, null)] }, [], '');
        expect(report.observedTotalMs).toBe(0);
        const markdown = workEffortReportToMarkdown(report);
        expect(markdown).toContain('| Problem/Domain | 0:00:00 | 0.00 | unknown |');
        expect(markdown).toContain('| Problem + Meta subtotal | 0:00:00 | 0.00 | unknown |');
        expect(markdown).toContain('| Total observed union | 0:00:00 | 0.00 | unknown |');
    });

    it('renders elapsed duration with unbounded hours and rounds to the nearest second', () => {
        const report = createWorkEffortReport({
            ...ledger,
            evaluations: [evaluation('domain', '2026-10-08T00:00:00Z', '2026-10-09T01:02:59.600Z')],
        }, [classifications[0]], '');
        const markdown = workEffortReportToMarkdown(report);
        expect(markdown).toContain('| Window category | Duration (h:mm:ss) | Minutes | Share of observed union |');
        expect(markdown).toContain('| Problem/Domain | 25:03:00 | 1502.99 | 100.00% |');
        expect(markdown).toContain('| Problem + Meta subtotal | 25:03:00 | 1502.99 | 100.00% |');
        expect(markdown).toContain('| Total observed union | 25:03:00 | 1502.99 | 100.00% |');
    });

    it.each([
        ['invalid date', 'invalid', timestamp(2)],
        ['negative interval', timestamp(3), timestamp(2)],
        ['invalid end', timestamp(1), 'invalid'],
    ])('rejects %s rather than silently excluding it', (_name, start, end) => {
        expect(() => createWorkEffortReport({
            ...ledger, evaluations: [evaluation('bad', start, end)],
        }, [], '')).toThrow('Invalid evaluation interval');
    });

    it.each([
        null, [{}], [{ id: 'domain', category: 'Other', rationale: 'Reason' }],
        [{ id: 'domain', category: 'Meta/DevEnv', rationale: '' }],
        [{ id: 'absent', category: 'Meta/DevEnv', rationale: 'Reason' }],
        [classifications[0], classifications[0]],
        [{ id: 1, category: 'Meta/DevEnv', rationale: 'Reason' }],
    ])('rejects invalid classification input %j', input => {
        expect(() => createWorkEffortReport(ledger, input, '')).toThrow('Invalid work classification');
    });

    it('uses the existing ledger validator', () => {
        expect(() => createWorkEffortReport({}, [], '')).toThrow('Invalid WorkEvaluationDataset');
    });

    it('rejects malformed Git evidence', () => {
        expect(() => createWorkEffortReport(ledger, classifications, 'not a git record')).toThrow('Invalid Git evidence');
    });

    it('retains evidence and safely renders table text without mutating input', () => {
        const input = { ...ledger, evaluations: [{ ...ledger.evaluations[0], title: 'A | B\nnew' }] };
        const before = JSON.stringify(input);
        const report = createWorkEffortReport(input, [classifications[0]], '');
        expect(workEffortReportToMarkdown(report)).toContain('A \\| B new');
        expect(JSON.stringify(input)).toBe(before);
    });
});
