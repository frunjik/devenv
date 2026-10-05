import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';

describe('feature creation and Open list API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (error, _request, response, _next) => {
        response.status(500).json({ error: { message: (error as Error).message } });
    };

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-feature-test-'));
        app = createApp(root);
        app.set('env', 'production');
        app.use(handleError);
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it('creates a Wished feature as a JSON line in .features', async () => {
        const response = await request(app).post('/features').send({ description: '  Add   feature  ' });

        expect(response.status).toBe(201);
        expect(response.body.data).toMatchObject({
            id: expect.stringMatching(/^[0-9a-f-]{36}$/),
            priority: 'Low',
            status: 'Wished',
            description: 'Add feature',
        });
        expect((await readFile(join(root, '.features'), 'utf8')).trim())
            .toBe(JSON.stringify(response.body.data));
        expect((await request(app).get('/features')).body).toEqual({ data: [response.body.data] });
    });

    it('appends a new feature without corrupting a final line missing its newline', async () => {
        const existing = {
            id: '123e4567-e89b-42d3-a456-426614174000',
            priority: 'High',
            status: 'Wished',
            description: 'Existing',
        };
        await writeFile(join(root, '.features'), JSON.stringify(existing));

        const created = await request(app).post('/features').send({ description: 'New record' });

        const stored = (await readFile(join(root, '.features'), 'utf8')).trim().split('\n').map(JSON.parse);
        expect(created.status).toBe(201);
        expect(stored).toEqual([existing, created.body.data]);
    });

    it.each([{}, { description: '' }, { description: '  \n ' }])(
        'rejects a missing or blank description',
        async body => {
            const response = await request(app).post('/features').send(body);

            expect(response.status).toBe(400);
            await expect(readFile(join(root, '.features'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
        },
    );

    it('returns an empty list when .features does not exist', async () => {
        expect((await request(app).get('/features')).body).toEqual({ data: [] });
    });

    it('reads all existing JSON feature records without changing their storage', async () => {
        const records = [
            { id: '123e4567-e89b-42d3-a456-426614174000', priority: 'High', status: 'Queued', description: 'Active' },
            { id: '123e4567-e89b-42d3-a456-426614174001', priority: 'Low', status: 'Wished', description: 'Open' },
        ];
        const contents = `${records.map(record => JSON.stringify(record)).join('\n')}\n\n`;
        await writeFile(join(root, '.features'), contents);

        const response = await request(app).get('/features');

        expect(response.body).toEqual({ data: records });
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(contents);
    });

    it('reports malformed JSON feature records', async () => {
        await writeFile(join(root, '.features'), '{"id":\n');

        const response = await request(app).get('/features');

        expect(response.status).toBe(500);
        expect(response.body.error.message).toContain('Invalid feature JSON');
    });

    it.each([
        null,
        {},
        { id: 'one' },
        { id: 'one', description: 'text' },
        { id: 'one', description: 'text', priority: 'Nope' },
        { id: 'one', description: 'text', priority: 'Low', status: 3 },
    ])('reports malformed feature records with invalid shape', async record => {
        await writeFile(join(root, '.features'), `${JSON.stringify(record)}\n`);

        const response = await request(app).get('/features');

        expect(response.status).toBe(500);
        expect(response.body.error.message).toContain('Invalid feature record');
    });

    it('forwards non-missing feature read and append errors', async () => {
        await mkdir(join(root, '.features'));

        expect((await request(app).get('/features')).status).toBe(500);
        expect((await request(app).post('/features').send({ description: 'Cannot write' })).status).toBe(500);
    });

    it('does not expose retired feature-management routes', async () => {
        const id = '123e4567-e89b-42d3-a456-426614174000';
        expect((await request(app).get('/backlog')).status).toBe(404);
        expect((await request(app).get('/archived')).status).toBe(404);
        expect((await request(app).post(`/features/${id}/start`).send({})).status).toBe(404);
        expect((await request(app).patch(`/features/${id}/status`).send({ status: 'Done' })).status).toBe(404);
        expect((await request(app).delete(`/features/${id}`)).status).toBe(404);
    });

    it('keeps the version and PPT field metadata APIs available', async () => {
        expect((await request(app).get('/version')).body.data).toMatch(/^\d+\.\d+\.\d+/);
        expect((await request(app).get('/ppt/fields')).body).toEqual({ data: [] });
    });
});
