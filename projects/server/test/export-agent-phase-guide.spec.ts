import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { resolve } from 'node:path';

// The entry runs on import, so module mocks intercept its git and export boundaries.
function runEntry(argv: string[], gitOutputs: Record<string, string>) {
    const exportAgentPhaseGuide = jest.fn(() => ({ name: 'agent-phase-guide', commit: 'abc', files: ['AGENTS.md'] }));
    const execFileSync = jest.fn((_command: string, args: string[]) => gitOutputs[args.join(' ')]);
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.doMock('node:child_process', () => ({ execFileSync }));
    jest.doMock('../../../scripts/agent-phase-guide-export', () => ({
        agentPhaseGuideExportFileSystem: {},
        exportAgentPhaseGuide,
    }));
    const originalArgv = process.argv;
    process.argv = ['node', 'export-agent-phase-guide.ts', ...argv];
    try {
        jest.isolateModules(() => {
            require('../../../scripts/export-agent-phase-guide');
        });
    } finally {
        process.argv = originalArgv;
    }
    return { exportAgentPhaseGuide, execFileSync, log };
}

describe('AgentPhaseGuide export entry point', () => {
    afterEach(() => {
        jest.dontMock('node:child_process');
        jest.dontMock('../../../scripts/agent-phase-guide-export');
        jest.restoreAllMocks();
    });

    it('exports to the given destination pinned to HEAD, passing changed and untracked paths', () => {
        const { exportAgentPhaseGuide, execFileSync, log } = runEntry(['../guide'], {
            'rev-parse HEAD': 'abc\n',
            'diff --name-only HEAD': 'AGENTS.md\nREADME.md\n',
            'ls-files --others --exclude-standard': 'new.md\n',
        });

        expect(execFileSync).toHaveBeenCalledWith('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
        expect(exportAgentPhaseGuide).toHaveBeenCalledWith(
            process.cwd(),
            resolve(process.cwd(), '../guide'),
            { commit: 'abc', uncommittedPaths: ['AGENTS.md', 'README.md', 'new.md'] },
            {},
        );
        expect(log).toHaveBeenCalledWith(`Exported 1 AgentPhaseGuide files at abc to ${resolve(process.cwd(), '../guide')}`);
    });

    it('requires a destination argument', () => {
        expect(() => runEntry([], {})).toThrow('Usage: npm run export:agent-phase-guide -- <destination>');
    });
});
