import { describe, expect, it } from '@jest/globals';
import type { TextFileSystem } from '@shared';
import { createMemoryTextFileSystem } from '../../../shared/src/testing/memory-text-file-system';

describe('in-memory TextFileSystem in the browser test environment', () => {
    it('reads and writes text files without Node filesystem APIs', () => {
        const filesystem: TextFileSystem = createMemoryTextFileSystem({ 'notes.md': 'draft' });
        filesystem.writeFileSync('notes.md', 'final', 'utf8');
        expect(filesystem.readFileSync('notes.md', 'utf8')).toBe('final');
        expect(() => filesystem.readFileSync('missing.md', 'utf8')).toThrow('ENOENT');
    });
});
