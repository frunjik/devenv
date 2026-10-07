import { describe, expect, it, jest } from '@jest/globals';
import { writeGlossaryMarkdown } from '../../../scripts/glossary-export';

describe('Glossary Markdown generation', () => {
    it('generates the human-readable view from structured JSON', () => {
        const entries = [
            { term: 'Term', definitions: ['A definition.'], examples: ['An example.'], domains: ['DevEnv', 'Meta'] },
            { term: 'Unknown usage', definitions: [], examples: [], domains: [] },
        ];
        const filesystem = {
            readFileSync: jest.fn(() => JSON.stringify(entries)),
            writeFileSync: jest.fn(),
        };

        writeGlossaryMarkdown('.glossary.json', '.glossary', filesystem);

        expect(filesystem.readFileSync).toHaveBeenCalledWith('.glossary.json', 'utf8');
        expect(filesystem.writeFileSync).toHaveBeenCalledWith(
            '.glossary',
            [
                '# Glossary', '',
                '## Term', '',
                '### Definitions', '',
                '- A definition\\.', '',
                '### Examples', '',
                '- An example\\.', '',
                '### Domain usage', '',
                '- DevEnv', '- Meta', '',
                '## Unknown usage', '',
                '### Definitions', '',
                '_No definitions recorded._', '',
                '### Examples', '',
                '_No examples recorded._', '',
                '### Domain usage', '',
                '_Unknown or unrecorded._', '',
            ].join('\n'),
            'utf8',
        );
    });

    it.each([
        null,
        {},
        [{ term: 'Term', definitions: [], examples: [] }],
        [{ term: 'Term', definitions: [''], examples: [], domains: [] }],
        [{ term: 'Term', definitions: [], examples: [], domains: ['DevEnv\nMeta'] }],
    ])('rejects invalid JSON records before writing', value => {
        const filesystem = {
            readFileSync: jest.fn(() => JSON.stringify(value)),
            writeFileSync: jest.fn(),
        };

        expect(() => writeGlossaryMarkdown('.glossary.json', '.glossary', filesystem)).toThrow();
        expect(filesystem.writeFileSync).not.toHaveBeenCalled();
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
