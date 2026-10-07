import { describe, expect, it, jest } from '@jest/globals';

const { writeMarkdown } = require('../../../scripts/meta-export-markdown.cjs');

describe('MetaExport Markdown generation', () => {
    const revision = { revision: 1, assertion: 'Assert', context: 'Context', source: 'Source', applicability: 'Current' };
    const statement = { id: 'one', revisions: [revision] };

    it.each([
        null, {}, [], [null], [{ ...statement, extra: 'lost' }],
        [{ ...statement, id: '' }], [{ ...statement, id: 1 }],
        [{ ...statement, revisions: [] }], [{ ...statement, revisions: null }],
        [statement, statement],
        [{ ...statement, revisions: [null] }],
        [{ ...statement, revisions: [{ ...revision, extra: 'lost' }] }],
        [{ ...statement, revisions: [{ ...revision, revision: 0 }] }],
        [{ ...statement, revisions: [{ ...revision, revision: 1.5 }] }],
        [{ ...statement, revisions: [revision, revision] }],
        ...['assertion', 'context', 'source', 'applicability'].flatMap(field => [
            [{ ...statement, revisions: [{ ...revision, [field]: '' }] }],
            [{ ...statement, revisions: [{ ...revision, [field]: null }] }],
        ]),
    ])('rejects invalid or lossy input %j before writing', value => {
        const io = { readFileSync: jest.fn(() => JSON.stringify(value)), writeFileSync: jest.fn() };
        expect(() => writeMarkdown('input.json', 'output.md', io)).toThrow('Invalid MetaExport');
        expect(io.writeFileSync).not.toHaveBeenCalled();
    });

    it('rejects malformed JSON without writing', () => {
        const io = { readFileSync: jest.fn(() => '{'), writeFileSync: jest.fn() };
        expect(() => writeMarkdown('input.json', 'output.md', io)).toThrow(SyntaxError);
        expect(io.writeFileSync).not.toHaveBeenCalled();
    });

    it('propagates filesystem failures', () => {
        const failure = new Error('Filesystem failed');
        expect(() => writeMarkdown('input.json', 'output.md', {
            readFileSync: () => { throw failure; }, writeFileSync: jest.fn(),
        })).toThrow(failure);
        expect(() => writeMarkdown('input.json', 'output.md', {
            readFileSync: () => JSON.stringify([statement]),
            writeFileSync: () => { throw failure; },
        })).toThrow(failure);
    });

    it('writes a derived view preserving every statement and historical revision', () => {
        const statements = [
            { id: 'commit-attribution', revisions: [
                { revision: 1, assertion: 'Include trailer.', context: 'DevEnv', source: 'Earlier requirement', applicability: 'Historical' },
                { revision: 2, assertion: 'Omit trailer.', context: 'DevEnv', source: 'User decision', applicability: 'Current' },
            ] },
            { id: 'name', revisions: [
                { revision: 1, assertion: '*Not emphasis* <tag>\nNext line', context: 'WMS', source: 'Source', applicability: 'Provisional' },
            ] },
        ];
        const io = { readFileSync: jest.fn(() => JSON.stringify(statements)), writeFileSync: jest.fn() };

        writeMarkdown('input.json', 'output.md', io);

        expect(io.readFileSync).toHaveBeenCalledWith('input.json', 'utf8');
        expect(io.writeFileSync).toHaveBeenCalledWith('output.md', [
            '# MetaExport: Generated KnowledgeStatements', '',
            'Derived from JSON. All revisions are preserved; inclusion does not imply current applicability or recipient adoption.', '',
            '## commit\\-attribution', '',
            '### Revision 1', '',
            '**Assertion:** Include trailer\\.', '',
            '**Context:** DevEnv', '',
            '**Source:** Earlier requirement', '',
            '**Applicability:** Historical', '',
            '### Revision 2', '',
            '**Assertion:** Omit trailer\\.', '',
            '**Context:** DevEnv', '',
            '**Source:** User decision', '',
            '**Applicability:** Current', '',
            '## name', '',
            '### Revision 1', '',
            '**Assertion:** \\*Not emphasis\\* \\<tag\\>\n\nNext line', '',
            '**Context:** WMS', '',
            '**Source:** Source', '',
            '**Applicability:** Provisional', '',
        ].join('\n'), 'utf8');
    });
});
