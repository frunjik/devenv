import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';

describe('features public API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
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

    it('lists nonempty feature entries in file order', async () => {
        await writeFile(join(root, '.features'), '\n// first feature\n \n// second feature\n');

        const response = await request(app).get('/features');

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] first feature$/);
        expect(response.body.data[1]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] second feature$/);
        const persistedEntries = (await readFile(join(root, '.features'), 'utf8')).trim().split(/\r?\n/);
        expect(persistedEntries).toEqual(response.body.data);
        expect(new Set(persistedEntries.map(entry => entry.match(/\[([0-9a-f-]{36})\]/)?.[1])).size).toBe(2);
    });

    it('adds IDs to legacy dated entries and preserves existing UUIDs', async () => {
        const existingId = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), [
            '// [2026-10-04 22:45 +02:00] legacy feature',
            `// [2026-10-04 22:46 +02:00] [${existingId}] [high] identified feature`,
            '',
        ].join('\n'));

        const response = await request(app).get('/features');

        expect(response.body.data[0]).toMatch(
            /^\/\/ \[2026-10-04 22:45 \+02:00\] \[[0-9a-f-]{36}\] \[Medium\] legacy feature$/,
        );
        expect(response.body.data[1]).toBe(
            `// [2026-10-04 22:46 +02:00] [${existingId}] [High] identified feature`,
        );
    });

    it('adds a Medium priority to legacy entries without timestamps', async () => {
        await writeFile(join(root, '.features'), '// legacy feature\n');

        const response = await request(app).get('/features');

        expect(response.body.data[0]).toMatch(
            /^\/\/ \[[0-9a-f-]{36}\] \[Medium\] legacy feature$/,
        );
    });

    it('returns an empty list when the features file is empty', async () => {
        await writeFile(join(root, '.features'), ' \n\n');

        const response = await request(app).get('/features');

        expect(response.body).toEqual({ data: [] });
    });

    it('returns an empty list when the features file does not exist', async () => {
        const response = await request(app).get('/features');

        expect(response.body).toEqual({ data: [] });
    });

    it('forwards feature list read errors to Express', async () => {
        await mkdir(join(root, '.features'));

        const response = await request(app).get('/features');

        expect(response.status).toBe(500);
    });

    it('appends a timestamped one-line feature entry in history format', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: '  Add a feature\nwith multiline details  ' });

        expect(response.status).toBe(201);
        expect(response.body.data).toMatch(
            /^\/\/ \[\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2}\] \[[0-9a-f-]{36}\] \[Medium\] Add a feature with multiline details$/,
        );
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${response.body.data}\n`);
    });

    it('accepts an explicit feature priority', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Urgent feature', priority: 'High' });

        expect(response.status).toBe(201);
        expect(response.body.data).toMatch(/\[High\] Urgent feature$/);
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${response.body.data}\n`);
    });

    it('assigns a distinct UUID to each created feature', async () => {
        const first = await request(app).post('/features').send({ description: 'First feature' });
        const second = await request(app).post('/features').send({ description: 'Second feature' });
        const idFrom = (entry: string) =>
            entry.match(/\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]/)?.[1];

        expect(idFrom(first.body.data)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(idFrom(second.body.data)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(idFrom(first.body.data)).not.toBe(idFrom(second.body.data));
    });

    it('appends new entries after existing feature entries', async () => {
        await writeFile(join(root, '.features'), '// existing entry\n');

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        const entries = (await readFile(join(root, '.features'), 'utf8')).trim().split(/\r?\n/);
        expect(entries).toHaveLength(2);
        expect(entries[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] existing entry$/);
        expect(entries[1]).toBe(response.body.data);
    });

    it('separates an existing file without a trailing newline', async () => {
        await writeFile(join(root, '.features'), '// existing entry');

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        const entries = (await readFile(join(root, '.features'), 'utf8')).trim().split(/\r?\n/);
        expect(entries).toHaveLength(2);
        expect(entries[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] existing entry$/);
        expect(entries[1]).toBe(response.body.data);
    });

    it.each([
        ['missing description', {}],
        ['empty description', { description: '' }],
        ['whitespace-only description', { description: ' \n\t ' }],
        ['non-string description', { description: 42 }],
    ])('rejects a %s', async (_caseName, body) => {
        const response = await request(app).post('/features').send(body);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: { message: 'Feature description is required.' } });
    });

    it('rejects unsupported feature priorities', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Feature with invalid priority', priority: 'Urgent' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: { message: 'Feature priority must be High, Medium, or Low.' },
        });
    });

    it('forwards filesystem read errors to Express', async () => {
        await mkdir(join(root, '.features'));

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        expect(response.status).toBe(500);
    });

    it('updates a feature priority and preserves its description', async () => {
        const created = await request(app).post('/features').send({ description: 'Prioritize this feature' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).patch(`/features/${id}`).send({ priority: 'Low' });

        expect(response.status).toBe(200);
        expect(response.body.data).toBe(created.body.data.replace('[Medium]', '[Low]'));
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${response.body.data}\n`);
    });

    it('rejects invalid feature priority update requests', async () => {
        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000')
            .send({ priority: 'Urgent' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: { message: 'Feature priority must be High, Medium, or Low.' },
        });
    });

    it('rejects malformed feature IDs for priority updates', async () => {
        const response = await request(app).patch('/features/not-a-uuid').send({ priority: 'High' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: { message: 'A valid feature ID is required.' } });
    });

    it('returns not found when updating a missing feature priority', async () => {
        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000')
            .send({ priority: 'High' });

        expect(response.status).toBe(404);
        expect(response.body.error.message).toContain('was not found');
    });

    it('forwards feature priority update filesystem errors to Express', async () => {
        await mkdir(join(root, '.features'));

        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000')
            .send({ priority: 'High' });

        expect(response.status).toBe(500);
    });

    it('removes a feature by UUID and preserves the other entries', async () => {
        const first = await request(app).post('/features').send({ description: 'First feature' });
        const second = await request(app).post('/features').send({ description: 'Second feature' });
        const id = first.body.data.match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).delete(`/features/${id}`);

        expect(response.body.data).toBe(first.body.data);
        expect((await readFile(join(root, '.features'), 'utf8')).trim()).toBe(second.body.data);
    });

    it('leaves an empty features file when removing its final entry', async () => {
        const feature = await request(app).post('/features').send({ description: 'Only feature' });
        const id = feature.body.data.match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).delete(`/features/${id}`);

        expect(response.status).toBe(200);
        expect(await readFile(join(root, '.features'), 'utf8')).toBe('');
    });

    it('returns not found when removing a feature that does not exist', async () => {
        const response = await request(app)
            .delete('/features/123e4567-e89b-42d3-a456-426614174000');

        expect(response.status).toBe(404);
        expect(response.body.error.message).toContain('was not found');
    });

    it('rejects malformed feature IDs', async () => {
        const response = await request(app).delete('/features/not-a-uuid');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: { message: 'A valid feature ID is required.' } });
    });

    it('forwards feature removal filesystem errors to Express', async () => {
        await mkdir(join(root, '.features'));

        const response = await request(app)
            .delete('/features/123e4567-e89b-42d3-a456-426614174000');

        expect(response.status).toBe(500);
    });
});
