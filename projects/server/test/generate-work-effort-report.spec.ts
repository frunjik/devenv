import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { resolve } from 'node:path';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';

describe('work effort report generator entry', () => {
    afterEach(() => {
        jest.dontMock('node:fs');
        jest.dontMock('node:child_process');
        jest.restoreAllMocks();
    });

    it('reads source evidence and writes a traceable JSON snapshot and its Markdown view through boundaries', () => {
        const ledger = {
            schemaVersion: 1,
            metrics: [{ id: 'effort', name: 'Effort', definition: 'Effort', interpretation: 'Unknown stays unknown' }],
            evaluations: [{
                id: 'unknown', title: 'Unknown work', beneficiary: 'User', intendedOutcome: 'Outcome',
                successCondition: 'Verified', baseline: 'Unknown', startedAt: null, completedAt: null,
                measures: [{ metricId: 'effort', value: null, evidence: null }],
            }, {
                id: 'problem', title: 'Problem work', beneficiary: 'User', intendedOutcome: 'Outcome',
                successCondition: 'Verified', baseline: 'Unknown',
                startedAt: '2026-10-10T00:00:00Z', completedAt: '2026-10-10T01:00:00Z',
                measures: [{ metricId: 'effort', value: null, evidence: null }],
            }, {
                id: 'meta', title: 'Meta work', beneficiary: 'Developer', intendedOutcome: 'Outcome',
                successCondition: 'Verified', baseline: 'Unknown',
                startedAt: '2026-10-10T01:00:00Z', completedAt: '2026-10-10T01:30:00Z',
                measures: [{ metricId: 'effort', value: null, evidence: null }],
            }],
        };
        const files = createMemoryTextFileSystem({
            [resolve('knowledge/workflows/devenv-value-evaluation.json')]: JSON.stringify(ledger),
            [resolve('knowledge/workflows/work-effort-classifications.json')]: JSON.stringify([
                { id: 'problem', category: 'Problem/Domain', rationale: 'Domain outcome.' },
                { id: 'meta', category: 'Meta/DevEnv', rationale: 'Development tooling.' },
            ]),
            [resolve('knowledge/workflows/workflow-todo-list.json')]: '{}',
            [resolve('knowledge/workflows/work-plans.json')]: '{}',
            [resolve('knowledge/workflows/sample.md')]: 'No time here.\nElapsed time unknown.\n',
        });
        // The entry executes on import, so intercept only filesystem and subprocess boundaries; retain the real report calculation.
        jest.doMock('node:fs', () => files);
        jest.doMock('node:child_process', () => ({
            execFileSync: (_command: string, args: string[]) => {
                if (args[0] === 'rev-parse') return `${'a'.repeat(40)}\n`;
                if (args[0] === 'ls-files') return 'knowledge/workflows/sample.md\nknowledge/workflows/work-effort-report.generated.md\n';
                return '';
            },
        }));
        const output: string[] = [];
        // Capture the console boundary to verify user-visible output without intercepting report collaborators.
        jest.spyOn(console, 'log').mockImplementation((message: string) => { output.push(message); });
        jest.isolateModules(() => { require('../../../scripts/generate-work-effort-report'); });
        const snapshot = JSON.parse(files.readFileSync(resolve('knowledge/workflows/work-effort-report.json'), 'utf8'));
        expect(snapshot.sourceCommit).toBe('a'.repeat(40));
        expect(snapshot.sourceHashes).toHaveLength(4);
        expect(snapshot.workflowTimingEvidence).toEqual([{
            path: 'knowledge/workflows/sample.md',
            sha256: expect.any(String),
            statements: [{ line: 2, text: 'Elapsed time unknown.' }],
        }]);
        const markdown = files.readFileSync(resolve('knowledge/workflows/work-effort-report.generated.md'), 'utf8');
        expect(markdown).toContain('Elapsed time unknown.');
        const terminal = output.join('\n');
        expect(terminal.split('\n').filter(line => line.startsWith('|')))
            .toEqual(markdown.split('\n').filter(line => line.startsWith('|')).slice(0, 9));
        expect(terminal).toContain('Generated report: 3 evaluations, 0 commits, 1 workflow documents.');
        expect(terminal).toContain('Human active effort: **unknown**');
        for (const row of [
            '| Problem/Domain | 1:00:00 | 60.00 | 66.67% |',
            '| Meta/DevEnv | 0:30:00 | 30.00 | 33.33% |',
            '| Problem + Meta subtotal | 1:30:00 | 90.00 | 100.00% |',
            '| Total observed union | 1:30:00 | 90.00 | 100.00% |',
        ]) {
            expect(terminal.replace(/ {2,}/g, ' ')).toContain(row);
            expect(markdown.replace(/ {2,}/g, ' ')).toContain(row);
        }
        expect(terminal).not.toContain('## Git evidence inventory');
    });
});
