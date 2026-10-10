import { describe, expect, it } from '@jest/globals';
import { createWorkEffortReport, workEffortReportSlicesToMarkdown, workEffortReportSummaryToMarkdown, workEffortReportToMarkdown } from '../../../scripts/work-effort-report';

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
const registry = {
    schemaVersion: 2,
    workPlans: [{
        id: 'plan', title: 'Plan', description: 'Plan',
        topics: [
            { id: 'alpha', title: 'Alpha', description: 'Alpha', tasks: [{
                id: 'task-alpha', title: 'Task', description: 'Task', status: 'Completed',
                measurement: 'Measured', evaluationIds: ['domain', 'domain-overlap'],
            }] },
            { id: 'beta', title: 'Beta', description: 'Beta', tasks: [{
                id: 'task-beta', title: 'Task', description: 'Task', status: 'Completed',
                measurement: 'Measured', evaluationIds: ['meta'],
            }] },
        ],
    }],
};
const emptyRegistry = { schemaVersion: 2, workPlans: [] };

describe('work effort report', () => {
    it('omits the Untimed column while retaining unknown durations', () => {
        const report = createWorkEffortReport(ledger, classifications, '');
        const output = workEffortReportSlicesToMarkdown(report, emptyRegistry);
        const table = output.split('\n').filter(line => line.startsWith('|'));
        expect(table[0].split('|').slice(1, -1).map(value => value.trim()))
            .toEqual(['Slice (evaluation ID: title)', 'Category', 'WorkPlan topic', 'Duration (h:mm:ss)', 'Minutes']);
        for (const row of table) expect(row.split('|').slice(1, -1)).toHaveLength(5);
        expect(output.replace(/ {2,}/g, ' '))
            .toContain('| unfinished: unfinished | Unclassified | No linked WorkPlan topic | unknown | unknown |');
    });

    it.each([63, 64, 65])('caps a %i-character slice description at 64 characters including ellipsis', length => {
        const title = 'x'.repeat(length - 'short: '.length);
        const report = createWorkEffortReport({
            ...ledger, evaluations: [{ ...evaluation('short', timestamp(0), timestamp(1)), title }],
        }, [], '');
        const before = JSON.stringify(report);
        const table = workEffortReportSlicesToMarkdown(report, emptyRegistry).split('\n');
        const line = table.find(row => row.startsWith('| short:'))!;
        const description = line.split('|')[1].trim();
        const fullDescription = `short: ${title}`;
        expect(description).toBe(length > 64 ? `${fullDescription.slice(0, 61)}...` : fullDescription);
        expect(description.length).toBeLessThanOrEqual(64);
        expect(workEffortReportToMarkdown(report)).toContain(fullDescription);
        expect(JSON.stringify(report)).toBe(before);
    });

    it('separates same-category cross-topic overlap so topic totals reconcile to category totals', () => {
        const splitRegistry = {
            ...registry,
            workPlans: registry.workPlans.map(plan => ({
                ...plan,
                topics: plan.topics.map(topic => ({
                    ...topic,
                    tasks: topic.tasks.map(task => ({
                        ...task, evaluationIds: topic.id === 'alpha' ? ['domain'] : ['domain-overlap', 'meta'],
                    })),
                })),
            })),
        };
        const report = createWorkEffortReport(ledger, classifications, '');
        const before = JSON.stringify(report);
        const output = workEffortReportSlicesToMarkdown(report, splitRegistry).replace(/ {2,}/g, ' ');
        expect(output).toContain('| Topic total | Problem/Domain | Plan / Alpha | 0:05:00 | 5.00 |');
        expect(output).toContain('| Topic total | Problem/Domain | Plan / Beta | 0:00:00 | 0.00 |');
        expect(output).toContain('| Cross-topic overlap | Problem/Domain | - | 0:05:00 | 5.00 |');
        expect(output).toContain('| Category total | Problem/Domain | - | 0:10:00 | 10.00 |');
        expect(output.indexOf('| domain: domain')).toBeLessThan(output.indexOf('| domain-overlap: domain-overlap'));
        expect(JSON.stringify(report)).toBe(before);
    });

    it('keeps multiple topic links in one group, deduplicates repeated links and breaks title ties by IDs', () => {
        const linkedRegistry = {
            ...registry,
            workPlans: registry.workPlans.map(plan => ({
                ...plan,
                topics: plan.topics.map(topic => ({
                    ...topic, title: 'Same title',
                    tasks: [
                        { ...topic.tasks[0], evaluationIds: topic.id === 'alpha' ? ['domain', 'domain-overlap'] : ['domain', 'meta'] },
                        { ...topic.tasks[0], id: `${topic.id}-extra-task`, evaluationIds: ['domain'] },
                    ],
                })),
            })),
        };
        const tiedLedger = { ...ledger, evaluations: ledger.evaluations.map(row => ({ ...row, title: 'Same title' })) };
        const report = createWorkEffortReport(tiedLedger, classifications, '');
        const output = workEffortReportSlicesToMarkdown(report, linkedRegistry).replace(/ {2,}/g, ' ');
        expect(output).toContain('| domain: Same title | Problem/Domain | Multiple linked topics: Plan / Same title; Plan / Same title |');
        expect(output.split('\n').filter(line => line.startsWith('| domain: Same title |'))).toHaveLength(1);
        expect(output.indexOf('| unfinished: Same title')).toBeLessThan(output.indexOf('| unknown: Same title'));
        expect(output.indexOf('| unknown: Same title')).toBeLessThan(output.indexOf('| untimed: Same title'));

        const sameLabelRegistry = {
            ...linkedRegistry,
            workPlans: linkedRegistry.workPlans.map(plan => ({
                ...plan,
                topics: plan.topics.map(topic => ({
                    ...topic, tasks: [{ ...topic.tasks[0], evaluationIds: topic.id === 'alpha' ? ['domain'] : ['domain-overlap'] }],
                })),
            })),
        };
        const sameLabelOutput = workEffortReportSlicesToMarkdown(report, sameLabelRegistry).replace(/ {2,}/g, ' ');
        expect(sameLabelOutput.indexOf('| domain: Same title')).toBeLessThan(sameLabelOutput.indexOf('| domain-overlap: Same title'));
    });

    it('rejects invalid registries and stale evaluation links explicitly', () => {
        const report = createWorkEffortReport(ledger, classifications, '');
        expect(() => workEffortReportSlicesToMarkdown(report, {})).toThrow('Invalid WorkPlanRegistry');
        const staleReport = createWorkEffortReport({ ...ledger, evaluations: [ledger.evaluations[0]] }, [classifications[0]], '');
        expect(() => workEffortReportSlicesToMarkdown(staleReport, registry))
            .toThrow('Invalid WorkPlanRegistry: unknown evaluation "domain-overlap"');
    });

    it('reports unknown totals when every slice is untimed', () => {
        const report = createWorkEffortReport({ ...ledger, evaluations: [evaluation('untimed', null, null)] }, [], '');
        const output = workEffortReportSlicesToMarkdown(report, emptyRegistry).replace(/ {2,}/g, ' ');
        expect(output).toContain('| Topic total | Unclassified | No linked WorkPlan topic | unknown | unknown |');
        expect(output).toContain('| Category total | Unclassified | - | unknown | unknown |');
        expect(output).toContain('| Total observed union | All categories | - | unknown | unknown |');
    });

    it('orders slices by category and linked topic with overlap-safe topic and category totals', () => {
        const report = createWorkEffortReport({ ...ledger, evaluations: [...ledger.evaluations].reverse() }, classifications, '');
        const output = workEffortReportSlicesToMarkdown(report, registry).replace(/ {2,}/g, ' ');
        expect(output.indexOf('domain: domain')).toBeLessThan(output.indexOf('domain-overlap: domain-overlap'));
        expect(output.indexOf('domain-overlap: domain-overlap')).toBeLessThan(output.indexOf('meta: meta'));
        expect(output).toContain('| Topic total | Problem/Domain | Plan / Alpha | 0:10:00 | 10.00 |');
        expect(output).toContain('| Category total | Problem/Domain | - | 0:10:00 | 10.00 |');
        expect(output).toContain('| Topic total | Meta/DevEnv | Plan / Beta | 0:10:00 | 10.00 |');
        expect(output).toContain('| unfinished: unfinished | Unclassified | No linked WorkPlan topic | unknown | unknown |');
        expect(output).toContain('| Category total | Unclassified | - | 0:05:00 | 5.00 |');
        expect(output).toContain('| Cross-category overlap | Cross-category overlap | - | 0:10:00 | 10.00 |');
        expect(output).toContain('| Total observed union | All categories | - | 0:40:00 | 40.00 |');
    });

    it('lists every slice once with aligned text and numbers, including unknown intervals', () => {
        const report = createWorkEffortReport(ledger, classifications, '');
        const table = workEffortReportSlicesToMarkdown(report, emptyRegistry).split('\n').filter(line => line.startsWith('|'));
        expect(table).toHaveLength(ledger.evaluations.length + 12);
        const columns = table.map(line => line.split('|').slice(1, -1));
        const widths = columns[0].map(column => column.length - 2);
        for (const row of columns) {
            row.forEach((column, index) => {
                expect(column).toBe(` ${index < 3 ? column.trim().padEnd(widths[index]) : column.trim().padStart(widths[index])} `);
            });
        }
        const compact = table.join('\n').replace(/ {2,}/g, ' ');
        expect(compact).toContain('| domain: domain | Problem/Domain | No linked WorkPlan topic | 0:20:00 | 20.00 |');
        expect(compact).toContain('| mixed: mixed | Mixed | No linked WorkPlan topic | 0:05:00 | 5.00 |');
        expect(compact).toContain('| unfinished: unfinished | Unclassified | No linked WorkPlan topic | unknown | unknown |');
        expect(compact).toContain('| untimed: untimed | Unclassified | No linked WorkPlan topic | unknown | unknown |');
        expect(report.observedTotalMs).toBe(40 * 60000);
    });

    it('preserves empty-ledger rejection and renders zero durations without inventing time', () => {
        expect(() => createWorkEffortReport({ ...ledger, evaluations: [] }, [], ''))
            .toThrow('Invalid WorkEvaluationDataset: expected at least one work evaluation');
        const report = createWorkEffortReport({
            ...ledger, evaluations: [{ ...evaluation('zero', timestamp(0), timestamp(0)), title: 'A | B\nnew' }],
        }, [], '');
        expect(workEffortReportSlicesToMarkdown(report, emptyRegistry).replace(/ {2,}/g, ' '))
            .toContain('| zero: A \\| B new | Unclassified | No linked WorkPlan topic | 0:00:00 | 0.00 |');
    });

    it.each(['2026-10-10T01:00:00Z', '9999-12-31T23:59:59Z'])('aligns summary columns with spaces for an interval ending %s', end => {
        const report = createWorkEffortReport({
            ...ledger, evaluations: [evaluation('domain', timestamp(0), end)],
        }, [classifications[0]], '');
        const table = workEffortReportSummaryToMarkdown(report).split('\n').filter(line => line.startsWith('|'));
        expect(table).toHaveLength(9);
        const columns = table.map(line => line.split('|').slice(1, -1));
        const widths = columns[0].map(column => column.length - 2);
        for (const row of columns) {
            row.forEach((column, index) => {
                expect(column.length).toBe(widths[index] + 2);
                expect(column).toBe(` ${index === 0 ? column.trim().padEnd(widths[index]) : column.trim().padStart(widths[index])} `);
            });
        }
        expect(columns[1][0].trim()).toMatch(/^-+$/);
        for (const separator of columns[1].slice(1)) expect(separator.trim()).toMatch(/^-+:$/);
    });

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
        const markdown = workEffortReportToMarkdown(report).replace(/ {2,}/g, ' ');
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
        const markdown = workEffortReportToMarkdown(report).replace(/ {2,}/g, ' ');
        expect(markdown).toContain('| Problem/Domain | 0:00:00 | 0.00 | unknown |');
        expect(markdown).toContain('| Problem + Meta subtotal | 0:00:00 | 0.00 | unknown |');
        expect(markdown).toContain('| Total observed union | 0:00:00 | 0.00 | unknown |');
    });

    it('renders elapsed duration with unbounded hours and rounds to the nearest second', () => {
        const report = createWorkEffortReport({
            ...ledger,
            evaluations: [evaluation('domain', '2026-10-08T00:00:00Z', '2026-10-09T01:02:59.600Z')],
        }, [classifications[0]], '');
        const markdown = workEffortReportToMarkdown(report).replace(/ {2,}/g, ' ');
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
