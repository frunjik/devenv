import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { createApp } from '../src/public-api';

describe('history, glossary and backlog API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-lines-test-'));
        app = createApp(root);
        app.set('env', 'production');
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it('returns the nonempty lines of .history', async () => {
        await writeFile(join(root, '.history'), '// first\r\n\r\n  // second  \n');

        const response = await request(app).get('/history');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: ['// first', '// second'] });
    });

    it('returns an empty list when .history does not exist', async () => {
        const response = await request(app).get('/history');

        expect(response.body).toEqual({ data: [] });
    });

    it('forwards .history read errors', async () => {
        await mkdir(join(root, '.history'));

        const response = await request(app).get('/history');

        expect(response.status).toBe(500);
    });

    it('returns .glossary lines, falling back to .terms', async () => {
        await writeFile(join(root, '.terms'), 'Term\n');
        expect((await request(app).get('/glossary')).body).toEqual({ data: ['Term'] });

        await writeFile(join(root, '.glossary'), 'Glossary term\n');
        expect((await request(app).get('/glossary')).body).toEqual({ data: ['Glossary term'] });
    });

    it('returns an empty glossary when neither file exists', async () => {
        const response = await request(app).get('/glossary');

        expect(response.body).toEqual({ data: [] });
    });

    it('forwards glossary read errors that are not a missing file', async () => {
        await mkdir(join(root, '.glossary'));

        const response = await request(app).get('/glossary');

        expect(response.status).toBe(500);
    });

    it('returns only the features stored in .backlog', async () => {
        await writeFile(join(root, '.wishlist'),
            '{"id":"123e4567-e89b-42d3-a456-426614174000","priority":"Low","status":"Wished","description":"Wish"}\n');
        await writeFile(join(root, '.backlog'),
            '{"id":"123e4567-e89b-42d3-a456-426614174001","priority":"High","status":"Queued","description":"Backlog item"}\n');

        const response = await request(app).get('/backlog');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([
            { id: '123e4567-e89b-42d3-a456-426614174001', priority: 'High', status: 'Queued', description: 'Backlog item' },
        ]);
    });

    it('returns an empty backlog when .backlog does not exist and forwards other read errors', async () => {
        expect((await request(app).get('/backlog')).body).toEqual({ data: [] });

        await mkdir(join(root, '.backlog'));
        expect((await request(app).get('/backlog')).status).toBe(500);
    });
});
