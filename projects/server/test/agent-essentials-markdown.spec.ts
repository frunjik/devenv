import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const { renderMarkdown, writeMarkdown } = require('../../../scripts/agent-essentials-markdown.cjs');

const example = {
    title: 'Example candidate',
    introduction: ['Candidate only.', 'Source: pinned history.'],
    sections: [
        { level: 2, heading: '1. Verify', body: ['Check **actual outcomes**.', '', 'Report unknowns.'] },
        { level: 3, heading: 'Intent', body: ['Explore; not a rule.'] },
    ],
};

describe('Agent Essentials Markdown', () => {
    it('preserves ordered Markdown content and marks JSON as authoritative', () => {
        expect(renderMarkdown(example, 'example.json')).toBe(
            '# Example candidate\n\n'
            + 'Generated from [example.json](./example.json). Edit JSON, not this view.\n\n'
            + 'Candidate only.\nSource: pinned history.\n\n'
            + '## 1. Verify\n\nCheck **actual outcomes**.\n\nReport unknowns.\n\n'
            + '### Intent\n\nExplore; not a rule.\n',
        );
    });

    it('reads and writes only through the supplied boundary', () => {
        const files = new Map([['example.json', JSON.stringify(example)]]);
        const io = {
            readFileSync: (path: string) => files.get(path),
            writeFileSync: (path: string, content: string) => files.set(path, content),
        };
        writeMarkdown('example.json', 'example.md', io);
        expect(files.get('example.md')).toBe(renderMarkdown(example, 'example.json'));
    });

    it.each([
        null,
        [],
        { ...example, extra: true },
        { ...example, title: '' },
        { ...example, title: 'Two\nlines' },
        { ...example, introduction: [3] },
        { ...example, introduction: [] },
        { ...example, sections: [] },
        { ...example, sections: null },
        { ...example, sections: [null] },
        { ...example, sections: [{ ...example.sections[0], level: 1 }] },
        { ...example, sections: [{ ...example.sections[0], heading: '' }] },
        { ...example, sections: [{ ...example.sections[0], body: [false] }] },
        { ...example, sections: [{ ...example.sections[0], body: [] }] },
    ])('rejects malformed documents without writing a success-shaped view', (value) => {
        expect(() => renderMarkdown(value, 'example.json')).toThrow('Invalid Agent Essentials');
    });

    it('rejects unsafe source filenames', () => {
        expect(() => renderMarkdown(example, '../example.json')).toThrow('Invalid Agent Essentials');
    });

    // Source-consistency checks: these read the committed practice sources to catch drift between JSON and generated views.
    it.each(['agent-essentials', 'agent-essentials-testing'])('keeps the %s view in sync with its JSON', (name) => {
        const base = resolve(__dirname, '../../../knowledge/practices', name);
        const source = JSON.parse(readFileSync(`${base}.json`, 'utf8'));
        const view = readFileSync(`${base}.candidate.md`, 'utf8').replace(/\r\n/g, '\n');
        expect(view).toBe(renderMarkdown(source, `${name}.json`));
        expect(view).toMatch(/not active repository guidance/i);
    });

    it('preserves the distinction between selected rules, activated WorkTask measurement and exploration intents', () => {
        const source = JSON.parse(readFileSync(resolve(__dirname, '../../../knowledge/practices/agent-essentials.json'), 'utf8'));
        const sectionBody = (heading: string) => source.sections.find((section: { heading: string }) => section.heading === heading).body.join(' ');
        expect(source.sections.filter((section: { heading: string }) => /^[1-4]\./.test(section.heading))).toHaveLength(4);
        expect(source.sections.filter((section: { level: number; heading: string }) => section.level === 3 && /^[5-7]\./.test(section.heading))
            .map((section: { heading: string }) => section.heading)).toEqual(['7. Trial changes in isolation before broad adoption']);
        expect(sectionBody('WorkTask measurement')).toContain('Activated from intents 5');
        expect(sectionBody('Intents to explore')).toContain('not an active rule');
    });
});
