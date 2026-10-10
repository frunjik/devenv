import { describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';
import {
    agentPhaseGuideCoreFiles,
    exportAgentPhaseGuide,
    projectProfilePath,
    projectProfileTemplatePath,
} from '../../../scripts/agent-phase-guide-export';

const commit = '0123456789abcdef0123456789abcdef01234567';
const sourceRoot = resolve('source');
const destination = resolve('guide-export');

function sourceFiles(): Record<string, string> {
    return Object.fromEntries([...agentPhaseGuideCoreFiles, projectProfileTemplatePath]
        .map(path => [join(sourceRoot, path), `content of ${path}\n`]));
}

function exportFileSystem(files = sourceFiles()) {
    return { ...createMemoryTextFileSystem(files), mkdirSync: jest.fn() };
}

describe('AgentPhaseGuide export', () => {
    it('writes the generic core, the profile template as the project profile and a commit-pinned manifest', () => {
        const fileSystem = exportFileSystem();

        const manifest = exportAgentPhaseGuide(sourceRoot, destination, { commit, uncommittedPaths: [] }, fileSystem);

        for (const path of agentPhaseGuideCoreFiles) {
            expect(fileSystem.files.get(join(destination, path))).toBe(`content of ${path}\n`);
        }
        expect(fileSystem.files.get(join(destination, projectProfilePath)))
            .toBe(`content of ${projectProfileTemplatePath}\n`);
        expect(manifest).toEqual({
            name: 'agent-phase-guide',
            commit,
            files: [...agentPhaseGuideCoreFiles, projectProfilePath],
        });
        expect(JSON.parse(fileSystem.files.get(join(destination, 'agent-phase-guide.manifest.json')) ?? '')).toEqual(manifest);
        expect(fileSystem.mkdirSync).toHaveBeenCalledWith(join(destination, '.agents', 'skills', 'tdd'), { recursive: true });
    });

    it('rejects export when exported sources have uncommitted changes, without writing', () => {
        const fileSystem = exportFileSystem();

        expect(() => exportAgentPhaseGuide(sourceRoot, destination, {
            commit,
            uncommittedPaths: ['README.md', 'AGENTS.md'],
        }, fileSystem)).toThrow('Uncommitted AgentPhaseGuide sources: AGENTS.md');
        expect(fileSystem.files.size).toBe(Object.keys(sourceFiles()).length);
    });

    it('allows unrelated uncommitted changes', () => {
        const fileSystem = exportFileSystem();

        expect(() => exportAgentPhaseGuide(sourceRoot, destination, {
            commit,
            uncommittedPaths: ['README.md'],
        }, fileSystem)).not.toThrow();
    });

    it.each(['', 'HEAD', '0123abc'])('rejects commit %p that is not a full commit hash', invalidCommit => {
        expect(() => exportAgentPhaseGuide(sourceRoot, destination, {
            commit: invalidCommit,
            uncommittedPaths: [],
        }, exportFileSystem())).toThrow('full commit hash');
    });

    it.each([sourceRoot, join(sourceRoot, 'export')])('rejects destination %s inside the source', invalidDestination => {
        expect(() => exportAgentPhaseGuide(sourceRoot, invalidDestination, {
            commit,
            uncommittedPaths: [],
        }, exportFileSystem())).toThrow('outside the source folder');
    });

    // Source-consistency check: reads the committed core files to catch DevEnv-specific content leaking into the generic export.
    it.each(agentPhaseGuideCoreFiles)('keeps %s free of DevEnv-specific rules', path => {
        const content = readFileSync(resolve(__dirname, '../../..', path), 'utf8');
        for (const marker of ['knowledge/workflows', '@jest/globals', 'SystemConcern', 'projects/', 'npm run', '@shared']) {
            expect(content).not.toContain(marker);
        }
    });
});
