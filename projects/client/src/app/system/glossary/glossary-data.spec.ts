import { describe, expect, it } from '@jest/globals';
import { parseGlossaryLines } from '@shared';

describe('parseGlossaryLines', () => {
    it('parses all defined entry fields and ignores blank lines', () => {
        expect(parseGlossaryLines([
            ' Term ', '',
            '- A definition. ',
            '- Example: A concrete example.',
            '- Domains: DevEnv, Meta',
            '',
            'Next term',
            '- Another definition.',
        ])).toEqual([
            { term: 'Term', definitions: ['A definition.'], examples: ['A concrete example.'], domains: ['DevEnv', 'Meta'] },
            { term: 'Next term', definitions: ['Another definition.'], examples: [], domains: [] },
        ]);
    });

    it('keeps an orphan definition line visible as a term', () => {
        expect(parseGlossaryLines(['- Orphan text', 'Term', '- Definition'])).toEqual([
            { term: '- Orphan text', definitions: [], examples: [], domains: [] },
            { term: 'Term', definitions: ['Definition'], examples: [], domains: [] },
        ]);
    });

    it.each(['- Domains:', '- Domains: Meta, ', '- Domains: , Meta'])('rejects empty usage labels in %s', line => {
        expect(() => parseGlossaryLines(['Term', line])).toThrow('Usage Domains must contain non-empty labels');
    });

    it('returns no entries for an empty source', () => {
        expect(parseGlossaryLines([])).toEqual([]);
    });
});
