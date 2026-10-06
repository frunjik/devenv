import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import request from 'supertest';
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

    beforeEach(() => {
        root = process.cwd();
        fileReader.mockReset();
        fileReader.mockRejectedValue(missingFile);
        app = createApp(root);
        app.set('env', 'production');
    });

    it('prefers .glossary and falls back to .terms', async () => {
        fileReader.mockRejectedValueOnce(missingFile).mockResolvedValueOnce('Term\n');
        expect((await request(app).get('/glossary')).body).toEqual({ data: ['Term'] });
        expect(fileReader).toHaveBeenNthCalledWith(1, join(root, '.glossary'), 'utf8');
        expect(fileReader).toHaveBeenNthCalledWith(2, join(root, '.terms'), 'utf8');

        fileReader.mockResolvedValueOnce('Glossary term\n');
        expect((await request(app).get('/glossary')).body).toEqual({ data: ['Glossary term'] });
        expect(fileReader).toHaveBeenCalledTimes(3);
        expect(fileReader).toHaveBeenNthCalledWith(3, join(root, '.glossary'), 'utf8');
    });

    it('returns an empty glossary when neither file exists', async () => {
        expect((await request(app).get('/glossary')).body).toEqual({ data: [] });
    });

    it('forwards glossary read errors that are not missing files', async () => {
        fileReader.mockRejectedValue(Object.assign(new Error('Not a file'), { code: 'EISDIR' }));

        expect((await request(app).get('/glossary')).status).toBe(500);
    });
});
