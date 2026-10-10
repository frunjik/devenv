import { describe, expect, it, jest } from '@jest/globals';
import { writeGlossaryMarkdown } from '../../../scripts/glossary-export';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';

describe('Glossary Markdown generation', () => {
    it('generates the human-readable view from structured JSON', () => {
        const entries = [
            { term: 'Term', definitions: ['A definition.'], examples: ['An example.'], domains: ['DevEnv', 'Meta'] },
            { term: 'Unknown usage', definitions: [], examples: [], domains: [] },
        ];
        const filesystem = createMemoryTextFileSystem({ '.glossary.json': JSON.stringify(entries) });

        writeGlossaryMarkdown('.glossary.json', '.glossary', filesystem);

        expect(filesystem.readFileSync('.glossary', 'utf8')).toBe(
            [
                '# Glossary', '',
                '## Term', '',
                '### Definitions', '',
                '- A definition\\.', '',
                '<details>', '<summary>Examples</summary>', '',
                '- An example\\.', '',
                '</details>', '',
                '### Domain usage', '',
                '- DevEnv', '- Meta', '',
                '## Unknown usage', '',
                '### Definitions', '',
                '_No definitions recorded._', '',
                '<details>', '<summary>Examples</summary>', '',
                '_No examples recorded._', '',
                '</details>', '',
                '### Domain usage', '',
                '_Unknown or unrecorded._', '',
            ].join('\n'),
        );
    });

    it.each([
        null,
        {},
        [{ term: 'Term', definitions: [], examples: [] }],
        [{ term: 'Term', definitions: [''], examples: [], domains: [] }],
        [{ term: 'Term', definitions: [], examples: [], domains: ['DevEnv\nMeta'] }],
    ])('rejects invalid JSON records before writing', value => {
        const filesystem = createMemoryTextFileSystem({ '.glossary.json': JSON.stringify(value) });

        expect(() => writeGlossaryMarkdown('.glossary.json', '.glossary', filesystem)).toThrow();
        expect(filesystem.files.has('.glossary')).toBe(false);
    });

    it('propagates JSON parse and filesystem failures', () => {
        const failure = new Error('Filesystem failed');
        expect(() => writeGlossaryMarkdown('.glossary.json', '.glossary', {
            readFileSync: () => '{',
            writeFileSync: jest.fn(),
        })).toThrow(SyntaxError);
        expect(() => writeGlossaryMarkdown('.glossary.json', '.glossary', {
            readFileSync: () => '[]',
            writeFileSync: () => { throw failure; },
        })).toThrow(failure);
        expect(() => writeGlossaryMarkdown('.glossary.json', '.glossary', {
            readFileSync: () => { throw failure; },
            writeFileSync: jest.fn(),
        })).toThrow(failure);
    });
});
