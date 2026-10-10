import { describe, expect, it } from '@jest/globals';
import type { TextFileSystem } from '@shared';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';

describe('in-memory TextFileSystem', () => {
    it('reads seeded files and records writes without touching the real filesystem', () => {
        const seed = { 'knowledge/work-plans.json': '{"schemaVersion":2}' };
        const filesystem = createMemoryTextFileSystem(seed);
        const contract: TextFileSystem = filesystem;

        expect(contract.readFileSync('knowledge/work-plans.json', 'utf8')).toBe('{"schemaVersion":2}');
        contract.writeFileSync('knowledge/work-plans.md', '# Work Plans\n', 'utf8');
        contract.writeFileSync('knowledge/work-plans.json', '{}', 'utf8');

        expect(contract.readFileSync('knowledge/work-plans.md', 'utf8')).toBe('# Work Plans\n');
        expect(Object.fromEntries(filesystem.files)).toEqual({
            'knowledge/work-plans.json': '{}',
            'knowledge/work-plans.md': '# Work Plans\n',
        });
        expect(seed).toEqual({ 'knowledge/work-plans.json': '{"schemaVersion":2}' });
    });

    it('starts empty and fails reads of missing files like Node with ENOENT', () => {
        const filesystem = createMemoryTextFileSystem();
        expect(filesystem.files.size).toBe(0);
        let failure: unknown;
        try {
            filesystem.readFileSync('missing.json', 'utf8');
        } catch (error) {
            failure = error;
        }
        expect(failure).toBeInstanceOf(Error);
        expect((failure as NodeJS.ErrnoException).code).toBe('ENOENT');
        expect((failure as Error).message).toBe("ENOENT: no such file or directory, open 'missing.json'");
    });
});
