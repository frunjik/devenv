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
        expect(response.body.data[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] first feature$/);
        expect(response.body.data[1]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] second feature$/);
        const persistedEntries = (await readFile(join(root, '.features'), 'utf8')).trim().split(/\r?\n/);
        expect(persistedEntries).toEqual(response.body.data);
        expect(new Set(persistedEntries.map(entry => entry.match(/\[([0-9a-f-]{36})\]/)?.[1])).size).toBe(2);
    });

    it('adds IDs to legacy dated entries and preserves existing UUIDs', async () => {
        const existingId = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), [
            '// [2026-10-04 22:45 +02:00] legacy feature',
            `// [2026-10-04 22:46 +02:00] [${existingId}] identified feature`,
            '',
        ].join('\n'));

        const response = await request(app).get('/features');

        expect(response.body.data[0]).toMatch(
            /^\/\/ \[2026-10-04 22:45 \+02:00\] \[[0-9a-f-]{36}\] legacy feature$/,
        );
        expect(response.body.data[1]).toBe(`// [2026-10-04 22:46 +02:00] [${existingId}] identified feature`);
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
            /^\/\/ \[\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2}\] \[[0-9a-f-]{36}\] Add a feature with multiline details$/,
        );
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
        expect(entries[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] existing entry$/);
        expect(entries[1]).toBe(response.body.data);
    });

    it('separates an existing file without a trailing newline', async () => {
        await writeFile(join(root, '.features'), '// existing entry');

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        const entries = (await readFile(join(root, '.features'), 'utf8')).trim().split(/\r?\n/);
        expect(entries).toHaveLength(2);
        expect(entries[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] existing entry$/);
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

    it('forwards filesystem read errors to Express', async () => {
        await mkdir(join(root, '.features'));

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        expect(response.status).toBe(500);
    });
});
