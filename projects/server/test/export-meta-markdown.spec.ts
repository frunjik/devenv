import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { resolve } from 'node:path';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';
import { writeMarkdown } from '../../../scripts/meta-export-markdown';

const input = resolve('knowledge/knowledge-transfer/meta-export-example.json');
const output = resolve('knowledge/knowledge-transfer/meta-export-example.generated.md');
const statements = [{
    id: 'example',
    revisions: [{ revision: 1, assertion: 'An assertion.', context: 'Context', source: 'Source', applicability: 'Provisional' }],
}];

describe('MetaExport Markdown entry', () => {
    afterEach(() => { jest.dontMock('node:fs'); });

    it('wires the existing source and output paths to the real renderer', () => {
        const io = createMemoryTextFileSystem({ [input]: JSON.stringify(statements) });
        const expected = createMemoryTextFileSystem({ [input]: JSON.stringify(statements) });
        writeMarkdown(input, output, expected);
        // The entry executes on import; intercept only filesystem I/O, retaining validation and rendering.
        jest.doMock('node:fs', () => io);
        jest.isolateModules(() => require('../../../scripts/export-meta-markdown'));
        expect(io.readFileSync(output, 'utf8')).toBe(expected.readFileSync(output, 'utf8'));
        expect(io.files.size).toBe(2);
    });

    it('propagates missing-source errors', () => {
        jest.doMock('node:fs', () => createMemoryTextFileSystem());
        expect(() => jest.isolateModules(() => require('../../../scripts/export-meta-markdown'))).toThrow('ENOENT');
    });
});
