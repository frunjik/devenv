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
            }],
        };
        const files = createMemoryTextFileSystem({
            [resolve('knowledge/workflows/devenv-value-evaluation.json')]: JSON.stringify(ledger),
            [resolve('knowledge/workflows/work-effort-classifications.json')]: '[]',
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
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
        jest.isolateModules(() => { require('../../../scripts/generate-work-effort-report'); });
        const snapshot = JSON.parse(files.readFileSync(resolve('knowledge/workflows/work-effort-report.json'), 'utf8'));
        expect(snapshot.sourceCommit).toBe('a'.repeat(40));
        expect(snapshot.sourceHashes).toHaveLength(4);
        expect(snapshot.workflowTimingEvidence).toEqual([{
            path: 'knowledge/workflows/sample.md',
            sha256: expect.any(String),
            statements: [{ line: 2, text: 'Elapsed time unknown.' }],
        }]);
        expect(files.readFileSync(resolve('knowledge/workflows/work-effort-report.generated.md'), 'utf8'))
            .toContain('Elapsed time unknown.');
    });
});
