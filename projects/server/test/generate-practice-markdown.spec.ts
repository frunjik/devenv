import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';
import { renderMarkdown as renderEssentials } from '../../../scripts/agent-essentials-markdown';
import { renderMarkdown as renderVersions } from '../../../scripts/practice-set-versions-markdown';

// Read-only source fixtures ensure entry wiring uses the actual validated document formats.
const essentials = readFileSync(resolve('knowledge/practices/agent-essentials.json'), 'utf8');
const testing = readFileSync(resolve('knowledge/practices/agent-essentials-testing.json'), 'utf8');
const versions = readFileSync(resolve('knowledge/practices/practice-set-versions.json'), 'utf8');

describe('practice Markdown generator entries', () => {
    afterEach(() => { jest.dontMock('node:fs'); });

    it('renders both Essentials documents at the existing candidate paths', () => {
        const io = createMemoryTextFileSystem({
            [resolve('knowledge/practices/agent-essentials.json')]: essentials,
            [resolve('knowledge/practices/agent-essentials-testing.json')]: testing,
        });
        // Entries execute on import; intercept only filesystem I/O and retain the real validators and renderers.
        jest.doMock('node:fs', () => io);
        jest.isolateModules(() => require('../../../scripts/generate-agent-essentials-markdown'));
        expect(io.readFileSync(resolve('knowledge/practices/agent-essentials.candidate.md'), 'utf8'))
            .toBe(renderEssentials(JSON.parse(essentials), 'agent-essentials.json'));
        expect(io.readFileSync(resolve('knowledge/practices/agent-essentials-testing.candidate.md'), 'utf8'))
            .toBe(renderEssentials(JSON.parse(testing), 'agent-essentials-testing.json'));
        expect(io.files.size).toBe(4);
    });

    it('renders the practice-set registry at its existing generated path', () => {
        const io = createMemoryTextFileSystem({
            [resolve('knowledge/practices/practice-set-versions.json')]: versions,
        });
        jest.doMock('node:fs', () => io);
        jest.isolateModules(() => require('../../../scripts/generate-practice-set-versions-markdown'));
        expect(io.readFileSync(resolve('knowledge/practices/practice-set-versions.generated.md'), 'utf8'))
            .toBe(renderVersions(JSON.parse(versions)));
        expect(io.files.size).toBe(2);
    });

    it('propagates boundary errors instead of reporting successful generation', () => {
        jest.doMock('node:fs', () => createMemoryTextFileSystem());
        expect(() => jest.isolateModules(() => require('../../../scripts/generate-agent-essentials-markdown')))
            .toThrow('ENOENT');
    });
});
