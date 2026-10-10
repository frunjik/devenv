import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { requestApp } from './support/request-app';
import { createApp } from '../src/public-api';

jest.mock('node:fs/promises', () => {
    const actual = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises');
    return { ...actual, readFile: jest.fn() };
});

const fileReader = jest.mocked(readFile);
const missingFile = Object.assign(new Error('File not found'), { code: 'ENOENT' });

describe('glossary API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;

    const glossary = [
        { term: 'Term', definitions: ['Definition'], examples: ['Example'], domains: ['DevEnv'] },
        { term: 'Unknown', definitions: [], examples: [], domains: [] },
    ];

    beforeEach(() => {
        root = process.cwd();
        fileReader.mockReset();
        fileReader.mockRejectedValue(missingFile);
        app = createApp(root);
        app.set('env', 'production');
    });

    it('returns validated structured entries from the authoritative JSON file', async () => {
        fileReader.mockResolvedValueOnce(JSON.stringify(glossary));
        expect((await requestApp(app).get('/glossary')).body).toEqual({ data: glossary });
        expect(fileReader).toHaveBeenCalledTimes(1);
        expect(fileReader).toHaveBeenCalledWith(join(root, '.glossary.json'), 'utf8');
    });

    it('does not fall back to legacy .terms when the JSON file is missing', async () => {
        expect((await requestApp(app).get('/glossary')).status).toBe(500);
        expect(fileReader).toHaveBeenCalledTimes(1);
        expect(fileReader).toHaveBeenCalledWith(join(root, '.glossary.json'), 'utf8');
    });

    it('rejects invalid structured entries', async () => {
        fileReader.mockResolvedValueOnce(JSON.stringify([{ term: 'Term', definitions: [] }]));
        expect((await requestApp(app).get('/glossary')).status).toBe(500);
    });

    it('forwards glossary read errors that are not missing files', async () => {
        fileReader.mockRejectedValue(Object.assign(new Error('Not a file'), { code: 'EISDIR' }));

        expect((await requestApp(app).get('/glossary')).status).toBe(500);
    });
});
