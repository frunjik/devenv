import { describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';
import { glossaryEntriesToMarkdown, validateGlossaryEntries } from '@shared';
import { cloneAgentGuide, guidePackageFiles } from '../../../.agents/guide-package/clone-guide';
import {
    agentPhaseGuideCoreFiles,
    exportAgentPhaseGuide,
    projectProfilePath,
    projectProfileTemplatePath,
} from '../../../scripts/agent-phase-guide-export';

const commit = '0123456789abcdef0123456789abcdef01234567';
const sourceRoot = resolve('source');
const destination = resolve('guide-export');
const readmeSourcePath = '.agents/agent-phase-guide.README.md';
const guideEntry = {
    term: 'AgentPhaseGuide',
    definitions: ['Coordinates the four-phase work loop.'],
    examples: ['Understand before Make.'],
    domains: ['AgentPhaseGuide'],
};
const projectEntry = {
    term: 'Project-specific API',
    definitions: ['A project-specific concept excluded from the generic export.'],
    examples: [],
    domains: ['DevEnv'],
};

function sourceFiles(): Record<string, string> {
    return {
        ...Object.fromEntries([...agentPhaseGuideCoreFiles, projectProfileTemplatePath, readmeSourcePath,
            '.agents/guide-package/package.json', '.agents/guide-package/clone-guide.ts', '.agents/guide-package/clone.ts']
            .map(path => [join(sourceRoot, path), `content of ${path}\n`])),
        [join(sourceRoot, '.glossary.json')]: JSON.stringify([guideEntry, projectEntry]),
    };
}

function exportFileSystem(files = sourceFiles()) {
    return { ...createMemoryTextFileSystem(files), mkdirSync: jest.fn() };
}

describe('AgentPhaseGuide export', () => {
    it('exports actual package sources and clones the adapted package twice without repository dependencies', () => {
        const repository = resolve(__dirname, '../../..');
        const files = Object.fromEntries([
            ...agentPhaseGuideCoreFiles, projectProfileTemplatePath, readmeSourcePath,
            '.agents/guide-package/package.json', '.agents/guide-package/clone-guide.ts',
            '.agents/guide-package/clone.ts', '.glossary.json',
        ].map(file => [join(sourceRoot, file), readFileSync(join(repository, file), 'utf8')]));
        const io = { ...exportFileSystem(files), realpathSync: (path: string) => path };
        const exported = exportAgentPhaseGuide(sourceRoot, destination, { commit, uncommittedPaths: [] }, io);
        expect(exported.files).toEqual(guidePackageFiles);
        const pkg = JSON.parse(io.readFileSync(join(destination, 'package.json'), 'utf8'));
        expect(pkg.scripts).toEqual({ clone: 'tsx scripts/clone.ts' });
        expect(pkg.devDependencies).toEqual({ tsx: '^4.23.15' });
        io.writeFileSync(join(destination, projectProfilePath), 'Adapted project profile\n', 'utf8');
        io.writeFileSync(join(destination, 'project-data.json'), 'private unrelated data', 'utf8');
        const next = resolve('next-guide');
        const final = resolve('final-guide');
        cloneAgentGuide(destination, next, io);
        cloneAgentGuide(next, final, io);
        for (const file of [...guidePackageFiles, 'agent-phase-guide.manifest.json']) {
            expect(io.readFileSync(join(final, file), 'utf8')).toBe(io.readFileSync(join(destination, file), 'utf8'));
        }
        expect(io.files.has(join(final, 'project-data.json'))).toBe(false);
        expect(io.readFileSync(join(final, 'scripts/clone-guide.ts'), 'utf8')).not.toContain('projects/shared');
        expect(io.readFileSync(join(final, 'scripts/clone.ts'), 'utf8')).not.toContain('git');
    });

    it.each(['package.json', 'clone-guide.ts', 'clone.ts'])('rejects uncommitted package source %s', file => {
        const io = exportFileSystem();
        expect(() => exportAgentPhaseGuide(sourceRoot, destination, {
            commit, uncommittedPaths: [`.agents/guide-package/${file}`],
        }, io)).toThrow('Uncommitted AgentPhaseGuide sources');
        expect(io.mkdirSync).not.toHaveBeenCalled();
    });

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
            files: guidePackageFiles,
        });
        expect(JSON.parse(fileSystem.files.get(join(destination, 'agent-phase-guide.manifest.json')) ?? '')).toEqual(manifest);
        expect(fileSystem.mkdirSync).toHaveBeenCalledWith(join(destination, '.agents', 'skills', 'tdd'), { recursive: true });
    });

    it('includes the minimal package and portable clone scripts unchanged', () => {
        const io = exportFileSystem();
        exportAgentPhaseGuide(sourceRoot, destination, { commit, uncommittedPaths: [] }, io);
        for (const [from, to] of [
            ['.agents/guide-package/package.json', 'package.json'],
            ['.agents/guide-package/clone-guide.ts', 'scripts/clone-guide.ts'],
            ['.agents/guide-package/clone.ts', 'scripts/clone.ts'],
        ]) {
            expect(io.readFileSync(join(destination, to), 'utf8')).toBe(`content of ${from}\n`);
        }
    });

    it('copies the portable README to the export root', () => {
        const fileSystem = exportFileSystem();
        exportAgentPhaseGuide(sourceRoot, destination, { commit, uncommittedPaths: [] }, fileSystem);
        expect(fileSystem.readFileSync(join(destination, 'README.md'), 'utf8'))
            .toBe(`content of ${readmeSourcePath}\n`);
    });

    it('rejects an uncommitted README source before writing', () => {
        const fileSystem = exportFileSystem();
        expect(() => exportAgentPhaseGuide(sourceRoot, destination, {
            commit, uncommittedPaths: [readmeSourcePath],
        }, fileSystem)).toThrow(`Uncommitted AgentPhaseGuide sources: ${readmeSourcePath}`);
        expect(fileSystem.mkdirSync).not.toHaveBeenCalled();
    });

    it('derives a domain-specific JSON glossary and Markdown from the main source', () => {
        const fileSystem = exportFileSystem();

        exportAgentPhaseGuide(sourceRoot, destination, { commit, uncommittedPaths: [] }, fileSystem);

        const glossary = fileSystem.readFileSync(join(destination, '.glossary.json'), 'utf8');
        expect(JSON.parse(glossary)).toEqual([guideEntry]);
        expect(fileSystem.readFileSync(join(destination, '.glossary'), 'utf8'))
            .toBe(glossaryEntriesToMarkdown([guideEntry]));
        expect(glossary).not.toContain(projectEntry.term);
    });

    it.each([
        ['malformed JSON', '{', 'JSON'],
        ['invalid entries', '[{"term":"Incomplete"}]', 'Invalid Glossary'],
        ['no matching concepts', JSON.stringify([projectEntry]), 'No AgentPhaseGuide glossary entries'],
    ])('rejects %s before writing any export files', (_scenario, glossary, message) => {
        const files = { ...sourceFiles(), [join(sourceRoot, '.glossary.json')]: glossary };
        const fileSystem = exportFileSystem(files);

        expect(() => exportAgentPhaseGuide(sourceRoot, destination, { commit, uncommittedPaths: [] }, fileSystem))
            .toThrow(message);
        expect([...fileSystem.files.entries()]).toEqual(Object.entries(files));
        expect(fileSystem.mkdirSync).not.toHaveBeenCalled();
    });

    it('includes the glossary source in the commit-pinning check', () => {
        const fileSystem = exportFileSystem();

        expect(() => exportAgentPhaseGuide(sourceRoot, destination, {
            commit, uncommittedPaths: ['.glossary.json'],
        }, fileSystem)).toThrow('Uncommitted AgentPhaseGuide sources: .glossary.json');
        expect(fileSystem.mkdirSync).not.toHaveBeenCalled();
    });

    // Source-consistency check: the real glossary must explain every approved concept in the portable domain.
    it('records the approved concepts in the authoritative glossary with generic definitions and examples', () => {
        const entries = validateGlossaryEntries(JSON.parse(readFileSync(resolve(__dirname, '../../../.glossary.json'), 'utf8')))
            .filter(entry => entry.domains.includes('AgentPhaseGuide'));
        expect(entries.map(entry => entry.term)).toEqual([
            'AgentPhaseGuide', 'Agent Essentials', 'Agent Phase', 'Understand', 'Explore', 'Make', 'Evaluate',
            'Skill', 'Coordinator', 'Handoff', 'Project Profile', 'TDD', 'Red', 'Green', 'Refactor',
            'Boundary Mock', 'Success Condition', 'Applicable Default', 'Safeguard', 'Exploration Intent',
            'WorkTask Tracking', 'WorkTask Measurement', 'Export Manifest',
        ]);
        for (const entry of entries) {
            expect(entry.definitions.length).toBeGreaterThan(0);
            expect(entry.examples.length).toBeGreaterThan(0);
            expect(JSON.stringify(entry)).not.toMatch(/DevEnv|SystemConcern|@shared|@jest/);
        }
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
