import { describe, expect, it, jest } from '@jest/globals';
import { resolve } from 'node:path';

describe('Work Plans Markdown generator entry point', () => {
    it('wires the authoritative JSON registry to its generated view', () => {
        const writeWorkPlanMarkdown = jest.fn();
        jest.doMock('../../../scripts/work-plans-export', () => ({
            workPlanExportFileSystem: {},
            writeWorkPlanMarkdown,
        }));

        jest.isolateModules(() => {
            require('../../../scripts/generate-work-plans-markdown');
        });

        expect(writeWorkPlanMarkdown).toHaveBeenCalledWith(
            resolve(process.cwd(), 'knowledge/workflows/work-plans.json'),
            resolve(process.cwd(), 'knowledge/workflows/devenv-value-evaluation.json'),
            resolve(process.cwd(), 'knowledge/workflows/work-plans.md'),
            {},
        );
        jest.dontMock('../../../scripts/work-plans-export');
    });
});
