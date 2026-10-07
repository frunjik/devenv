import { describe, expect, it } from '@jest/globals';
import { glossaryEntriesToMarkdown, validateGlossaryEntries } from '@shared';

describe('validateGlossaryEntries', () => {
    it('accepts structured records and preserves unknown usage as an empty array', () => {
        const records = [
            { term: 'Term', definitions: ['Definition'], examples: ['Example'], domains: ['DevEnv', 'Meta'] },
            { term: 'Unknown', definitions: [], examples: [], domains: [] },
        ];
        expect(validateGlossaryEntries(records)).toEqual(records);
    });

    it('accepts an empty Glossary', () => {
        expect(validateGlossaryEntries([])).toEqual([]);
    });

    it.each([
        null,
        {},
        [null],
        [{ term: 'Term', definitions: [], examples: [] }],
        [{ term: 'Term', definitions: [], examples: [], domains: [], extra: true }],
        [{ term: '', definitions: [], examples: [], domains: [] }],
        [{ term: ' ', definitions: [], examples: [], domains: [] }],
        [{ term: 'Term\nOther', definitions: [], examples: [], domains: [] }],
        [{ term: 'Term', definitions: 'Definition', examples: [], domains: [] }],
        [{ term: 'Term', definitions: [''], examples: [], domains: [] }],
        [{ term: 'Term', definitions: ['two\nlines'], examples: [], domains: [] }],
        [{ term: 'Term', definitions: [], examples: 'Example', domains: [] }],
        [{ term: 'Term', definitions: [], examples: [''], domains: [] }],
        [{ term: 'Term', definitions: [], examples: [], domains: 'DevEnv' }],
        [{ term: 'Term', definitions: [], examples: [], domains: [''] }],
        [{ term: 'Term', definitions: [], examples: [], domains: [3] }],
    ])('rejects invalid data %j', value => {
        expect(() => validateGlossaryEntries(value)).toThrow('Invalid Glossary');
    });
});

describe('glossaryEntriesToMarkdown', () => {
    it('renders structured fields, escapes Markdown, and explains unrecorded content', () => {
        expect(glossaryEntriesToMarkdown([
            {
                term: 'A *term*',
                definitions: ['A (definition).'],
                examples: ['An [example]'],
                domains: ['DevEnv'],
            },
            { term: 'Unknown', definitions: [], examples: [], domains: [] },
        ])).toBe([
            '# Glossary', '',
            '## A \\*term\\*', '', '### Definitions', '',
            '- A \\(definition\\)\\.', '',
            '### Examples', '', '- An \\[example\\]', '',
            '### Domain usage', '', '- DevEnv', '',
            '## Unknown', '', '### Definitions', '', '_No definitions recorded._', '',
            '### Examples', '', '_No examples recorded._', '',
            '### Domain usage', '', '_Unknown or unrecorded._', '',
        ].join('\n'));
    });
});
