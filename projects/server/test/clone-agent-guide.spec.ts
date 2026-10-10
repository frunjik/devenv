import { describe, expect, it, jest } from '@jest/globals';
import { join, resolve } from 'node:path';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';
import { cloneAgentGuide, guidePackageFiles } from '../../../.agents/guide-package/clone-guide';

const root = resolve('guide');
const destination = resolve('guide-clone');
const manifest = { name: 'agent-phase-guide', commit: 'a'.repeat(40), files: guidePackageFiles };

function filesystem() {
    const io = createMemoryTextFileSystem(Object.fromEntries([
        ...guidePackageFiles.map(file => [join(root, file), `edited ${file}`]),
        [join(root, 'agent-phase-guide.manifest.json'), JSON.stringify(manifest)],
        [join(root, 'unrelated.txt'), 'Do not copy'],
    ]));
    return {
        ...io,
        realpathSync: jest.fn((path: string) => path),
        mkdirSync: jest.fn(),
    };
}

describe('portable Guide clone', () => {
    it('clones only the current Guide files and can clone that result again without Git or DevEnv', () => {
        const io = filesystem();
        cloneAgentGuide(root, destination, io);
        for (const file of guidePackageFiles) {
            expect(io.readFileSync(join(destination, file), 'utf8')).toBe(`edited ${file}`);
        }
        expect(io.files.has(join(destination, 'unrelated.txt'))).toBe(false);
        expect(JSON.parse(io.readFileSync(join(destination, 'agent-phase-guide.manifest.json'), 'utf8'))).toEqual(manifest);
        expect(io.mkdirSync).toHaveBeenCalledWith(destination);
        const next = resolve('guide-next');
        cloneAgentGuide(destination, next, io);
        expect(io.readFileSync(join(next, '.github/instructions/project-profile.instructions.md'), 'utf8'))
            .toBe('edited .github/instructions/project-profile.instructions.md');
        expect(io.readFileSync(join(next, '.glossary.json'), 'utf8')).toBe('edited .glossary.json');
        expect(io.readFileSync(join(next, 'scripts/clone-guide.ts'), 'utf8')).toBe('edited scripts/clone-guide.ts');
    });

    it.each([root, join(root, 'child'), resolve(root, '..')])('rejects overlapping destination %s', target => {
        const io = filesystem();
        expect(() => cloneAgentGuide(root, target, io)).toThrow('must not overlap');
        expect(io.mkdirSync).not.toHaveBeenCalled();
    });

    it('resolves symlinked parents before checking overlap', () => {
        const io = filesystem();
        const alias = resolve('alias');
        io.realpathSync.mockImplementation(path => path === alias ? root : path);
        expect(() => cloneAgentGuide(root, join(alias, 'child'), io)).toThrow('must not overlap');
        expect(io.mkdirSync).not.toHaveBeenCalled();
    });

    it('does not overwrite an existing destination', () => {
        const io = filesystem();
        io.mkdirSync.mockImplementation(() => { throw new Error('EEXIST'); });
        expect(() => cloneAgentGuide(root, destination, io)).toThrow('EEXIST');
        expect(io.files.has(join(destination, 'AGENTS.md'))).toBe(false);
    });

    it.each([
        null, {}, { ...manifest, name: 'wrong' }, { ...manifest, commit: 'HEAD' },
        { ...manifest, files: [...guidePackageFiles, '../secret'] },
        { ...manifest, files: guidePackageFiles.slice(1) },
        { ...manifest, files: [guidePackageFiles[0], ...guidePackageFiles.slice(0, -1)] },
    ])('rejects invalid manifest %j before writing', value => {
        const io = filesystem();
        io.writeFileSync(join(root, 'agent-phase-guide.manifest.json'), JSON.stringify(value), 'utf8');
        expect(() => cloneAgentGuide(root, destination, io)).toThrow('Invalid Guide manifest');
        expect(io.mkdirSync).not.toHaveBeenCalled();
    });

    it('propagates missing input and malformed JSON before writing', () => {
        const io = filesystem();
        io.writeFileSync(join(root, 'agent-phase-guide.manifest.json'), '{', 'utf8');
        expect(() => cloneAgentGuide(root, destination, io)).toThrow(SyntaxError);
        expect(io.mkdirSync).not.toHaveBeenCalled();
        expect(() => cloneAgentGuide(root, destination, {
            ...io, readFileSync: () => { throw new Error('Missing source'); },
        })).toThrow('Missing source');
    });

    it('surfaces write failures without reporting successful cloning', () => {
        const io = filesystem();
        expect(() => cloneAgentGuide(root, destination, {
            ...io, writeFileSync: () => { throw new Error('Write failed'); },
        })).toThrow('Write failed');
    });
});
