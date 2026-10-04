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
        expect(response.body.data[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] first feature$/);
        expect(response.body.data[1]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] second feature$/);
        const persistedEntries = (await readFile(join(root, '.features'), 'utf8')).trim().split(/\r?\n/);
        expect(persistedEntries).toEqual(response.body.data);
        expect(new Set(persistedEntries.map(entry => entry.match(/\[([0-9a-f-]{36})\]/)?.[1])).size).toBe(2);
    });

    it('adds IDs to legacy dated entries and preserves existing UUIDs', async () => {
        const existingId = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), [
            '// [2026-10-04 22:45 +02:00] legacy feature',
            `// [2026-10-04 22:46 +02:00] [${existingId}] [high] [in progress] identified feature`,
            '',
        ].join('\n'));

        const response = await request(app).get('/features');

        expect(response.body.data[0]).toMatch(
            /^\/\/ \[2026-10-04 22:45 \+02:00\] \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] legacy feature$/,
        );
        expect(response.body.data[1]).toBe(
            `// [2026-10-04 22:46 +02:00] [${existingId}] [High] [In progress] identified feature`,
        );
    });

    it('adds a Medium priority to legacy entries without timestamps', async () => {
        await writeFile(join(root, '.features'), '// legacy feature\n');

        const response = await request(app).get('/features');

        expect(response.body.data[0]).toMatch(
            /^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] legacy feature$/,
        );
    });

    it('adds a Backlog status to legacy entries and preserves existing statuses', async () => {
        const existingId = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), [
            '// legacy feature',
            `// [2026-10-04 22:46 +02:00] [${existingId}] [High] [dOnE] completed feature`,
            '',
        ].join('\n'));

        const response = await request(app).get('/features');

        expect(response.body.data[0]).toMatch(/\[Medium\] \[Backlog\] legacy feature$/);
        expect(response.body.data[1]).toBe(
            `// [2026-10-04 22:46 +02:00] [${existingId}] [High] [Done] completed feature`,
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
            /^\/\/ \[\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2}\] \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] Add a feature with multiline details$/,
        );
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${response.body.data}\n`);
    });

    it('accepts an explicit feature priority', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Urgent feature', priority: 'High' });

        expect(response.status).toBe(201);
        expect(response.body.data).toMatch(/\[High\] \[Backlog\] Urgent feature$/);
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${response.body.data}\n`);
    });

    it('accepts an explicit feature status', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Feature already underway', status: 'In progress' });

        expect(response.status).toBe(201);
        expect(response.body.data).toMatch(/\[Medium\] \[In progress\] Feature already underway$/);
    });

    it.each([
        ['unsupported status', { status: 'Blocked' }],
        ['non-string status', { status: 42 }],
    ])('rejects a %s on feature creation', async (_caseName, status) => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Feature with invalid status', ...status });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: { message: 'Feature status must be Backlog, In progress, or Done.' },
        });
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
        expect(entries[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] existing entry$/);
        expect(entries[1]).toBe(response.body.data);
    });

    it('separates an existing file without a trailing newline', async () => {
        await writeFile(join(root, '.features'), '// existing entry');

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        const entries = (await readFile(join(root, '.features'), 'utf8')).trim().split(/\r?\n/);
        expect(entries).toHaveLength(2);
        expect(entries[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] existing entry$/);
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

    it('updates a description while preserving the feature ID, priority, and status', async () => {
        const created = await request(app).post('/features')
            .send({ description: 'Old description', priority: 'High', status: 'In progress' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'The features you are writing are, take them one by one:',
            `- [In progress] Old description <!-- feature-id:${id} -->`,
            '',
        ].join('\r\n'));

        const response = await request(app).patch(`/features/${id}/description`)
            .send({ description: '  Revised\n\t description  ' });

        expect(response.status).toBe(200);
        expect(response.body.data).toBe(created.body.data.replace(
            'Old description',
            'Revised description',
        ));
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${response.body.data}\n`);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toContain(
            `- [In progress] Revised description <!-- feature-id:${id} -->`,
        );
    });

    it('updates backlog descriptions when DEVENVOPDEV.md does not exist', async () => {
        const created = await request(app).post('/features')
            .send({ description: 'Backlog feature', status: 'Backlog' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).patch(`/features/${id}/description`)
            .send({ description: 'Updated backlog feature' });

        expect(response.status).toBe(200);
        expect(response.body.data).toContain('[Backlog] Updated backlog feature');
        await expect(readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it('updates in-progress descriptions when the task marker is absent', async () => {
        const created = await request(app).post('/features')
            .send({ description: 'Unlisted task', status: 'In progress' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), 'Instructions without a matching marker\n');

        const response = await request(app).patch(`/features/${id}/description`)
            .send({ description: 'Updated unlisted task' });

        expect(response.status).toBe(200);
        expect(response.body.data).toContain('[In progress] Updated unlisted task');
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8'))
            .toBe('Instructions without a matching marker\n');
    });

    it('preserves LF endings when updating a matching task marker', async () => {
        const created = await request(app).post('/features')
            .send({ description: 'LF task', status: 'In progress' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'The features you are writing are, take them one by one:',
            `- [In progress] LF task <!-- feature-id:${id} -->`,
            '',
        ].join('\n'));

        const response = await request(app).patch(`/features/${id}/description`)
            .send({ description: 'Updated LF task' });

        expect(response.status).toBe(200);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toBe([
            'The features you are writing are, take them one by one:',
            `- [In progress] Updated LF task <!-- feature-id:${id} -->`,
            '',
        ].join('\n'));
    });

    it.each([
        ['missing description', {}],
        ['empty description', { description: '' }],
        ['blank description', { description: ' \n\t ' }],
        ['non-string description', { description: 42 }],
    ])('rejects a %s on description updates', async (_caseName, body) => {
        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000/description')
            .send(body);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: { message: 'Feature description is required.' } });
    });

    it('rejects malformed feature IDs for description updates', async () => {
        const response = await request(app).patch('/features/not-a-uuid/description')
            .send({ description: 'New description' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: { message: 'A valid feature ID is required.' } });
    });

    it('returns not found when updating a missing feature description', async () => {
        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000/description')
            .send({ description: 'New description' });

        expect(response.status).toBe(404);
        expect(response.body.error.message).toContain('was not found');
    });

    it('does not change features when updating an in-progress task file fails', async () => {
        const created = await request(app).post('/features').send({
            description: 'Old task description',
            status: 'In progress',
        });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        await mkdir(join(root, 'DEVENVOPDEV.md'));

        const response = await request(app)
            .patch(`/features/${id}/description`)
            .send({ description: 'New task description' });

        expect(response.status).toBe(500);
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${created.body.data}\n`);
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

    it('updates a feature status and preserves its priority and description', async () => {
        const created = await request(app)
            .post('/features')
            .send({ description: 'Move this feature forward', priority: 'High' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status: 'In progress' });

        expect(response.status).toBe(200);
        expect(response.body.data).toBe(
            created.body.data.replace('[Backlog]', '[In progress]'),
        );
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${response.body.data}\n`);
    });

    it('starts a feature in the backlog and records it as in progress in DEVENVOPDEV.md', async () => {
        const created = await request(app).post('/features').send({ description: 'Implement feature tracking' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'Instructions',
            '',
            'The features you are writing are, take them one by one:',
            'Existing feature',
            '',
        ].join('\r\n'));

        const response = await request(app).post(`/features/${id}/start`).send({});

        expect(response.status).toBe(200);
        expect(response.body.data).toContain('[In progress] Implement feature tracking');
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${response.body.data}\n`);
        const taskFile = await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8');
        expect(taskFile).toContain(
            `The features you are writing are, take them one by one:\r\n- [In progress] Implement feature tracking <!-- feature-id:${id} -->\r\nExisting feature`,
        );
    });

    it('updates the existing task marker instead of duplicating a started feature', async () => {
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'),
            `// [${id}] [High] [In progress] Keep task listed\n`);
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'Instructions',
            '',
            'The features you are writing are, take them one by one:',
            `- [In progress] Keep task listed <!-- feature-id:${id} -->`,
            '',
        ].join('\n'));

        const response = await request(app).post(`/features/${id}/start`).send({});

        expect(response.status).toBe(200);
        const taskFile = await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8');
        expect(taskFile.match(new RegExp(`feature-id:${id}`, 'g'))).toHaveLength(1);
    });

    it('adds the feature section when DEVENVOPDEV.md has no task heading', async () => {
        const created = await request(app).post('/features').send({ description: 'Append task section' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), 'Instructions without a feature section');

        const response = await request(app).post(`/features/${id}/start`).send({});

        expect(response.status).toBe(200);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toBe([
            'Instructions without a feature section',
            '',
            'The features you are writing are, take them one by one:',
            `- [In progress] Append task section <!-- feature-id:${id} -->`,
        ].join('\n'));
    });

    it('adds the feature section to an empty DEVENVOPDEV.md', async () => {
        const created = await request(app).post('/features').send({ description: 'Start on empty task list' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), '');

        const response = await request(app).post(`/features/${id}/start`).send({});

        expect(response.status).toBe(200);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toBe([
            'The features you are writing are, take them one by one:',
            `- [In progress] Start on empty task list <!-- feature-id:${id} -->`,
        ].join('\n'));
    });

    it('rejects malformed and unknown IDs when starting a feature', async () => {
        const malformed = await request(app).post('/features/not-a-uuid/start').send({});
        const unknown = await request(app)
            .post('/features/123e4567-e89b-42d3-a456-426614174000/start')
            .send({});

        expect(malformed.status).toBe(400);
        expect(malformed.body).toEqual({ error: { message: 'A valid feature ID is required.' } });
        expect(unknown.status).toBe(404);
        expect(unknown.body.error.message).toContain('was not found');
    });

    it('forwards DEVENVOPDEV.md write prerequisites failures when starting a feature', async () => {
        const created = await request(app).post('/features').send({ description: 'Start with missing task file' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).post(`/features/${id}/start`).send({});

        expect(response.status).toBe(500);
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${created.body.data}\n`);
    });

    it('accepts each supported feature status', async () => {
        const created = await request(app).post('/features').send({ description: 'Complete this feature' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status: 'Done' });

        expect(response.body.data).toContain('[Done] Complete this feature');
    });

    it.each([
        ['missing status', {}],
        ['unsupported status', { status: 'Blocked' }],
        ['non-string status', { status: 42 }],
    ])('rejects a %s update', async (_caseName, body) => {
        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000/status')
            .send(body);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: { message: 'Feature status must be Backlog, In progress, or Done.' },
        });
    });

    it('rejects malformed feature IDs for status updates', async () => {
        const response = await request(app)
            .patch('/features/not-a-uuid/status')
            .send({ status: 'Done' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: { message: 'A valid feature ID is required.' } });
    });

    it('returns not found when updating a missing feature status', async () => {
        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000/status')
            .send({ status: 'Done' });

        expect(response.status).toBe(404);
        expect(response.body.error.message).toContain('was not found');
    });

    it('forwards feature status update filesystem errors to Express', async () => {
        await mkdir(join(root, '.features'));

        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000/status')
            .send({ status: 'Done' });

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

    it('removes the matching task from DEVENVOPDEV.md and preserves other tasks', async () => {
        const created = await request(app).post('/features').send({ description: 'Completed feature' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        const taskMarker = `<!-- feature-id:${id} -->`;
        const otherTask = '- [In progress] Keep this task <!-- feature-id:123e4567-e89b-42d3-a456-426614174000 -->';
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'The features you are writing are, take them one by one:',
            `- [In progress] Completed feature ${taskMarker}`,
            otherTask,
            '',
        ].join('\n'));

        const response = await request(app).delete(`/features/${id}`);

        expect(response.status).toBe(200);
        const taskFile = await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8');
        expect(taskFile).not.toContain(taskMarker);
        expect(taskFile).toContain(otherTask);
        expect(await readFile(join(root, '.features'), 'utf8')).toBe('');
    });

    it('removes a feature when its task marker is not present', async () => {
        const created = await request(app).post('/features').send({ description: 'No task marker' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), 'Keep this task.\n');

        const response = await request(app).delete(`/features/${id}`);

        expect(response.status).toBe(200);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toBe('Keep this task.\n');
        expect(await readFile(join(root, '.features'), 'utf8')).toBe('');
    });

    it('preserves DEVENVOPDEV.md CRLF line endings when removing a task', async () => {
        const created = await request(app).post('/features').send({ description: 'Windows line endings' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        const otherTask = '- [In progress] Keep this task <!-- feature-id:123e4567-e89b-42d3-a456-426614174000 -->';
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'The features you are writing are, take them one by one:',
            `- [In progress] Windows line endings <!-- feature-id:${id} -->`,
            otherTask,
            '',
        ].join('\r\n'));

        const response = await request(app).delete(`/features/${id}`);

        expect(response.status).toBe(200);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toBe([
            'The features you are writing are, take them one by one:',
            otherTask,
            '',
        ].join('\r\n'));
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

    it('preserves the feature when its DEVENVOPDEV.md task cannot be removed', async () => {
        const created = await request(app).post('/features').send({ description: 'Keep on failure' });
        const id = created.body.data.match(/\[([0-9a-f-]{36})\]/)[1];
        const taskEntry = `- [In progress] Keep on failure <!-- feature-id:${id} -->`;
        await writeFile(join(root, 'DEVENVOPDEV.md'), taskEntry);
        const previousFeatures = `${created.body.data}\n`;
        await rm(join(root, 'DEVENVOPDEV.md'));
        await mkdir(join(root, 'DEVENVOPDEV.md'));

        const response = await request(app).delete(`/features/${id}`);

        expect(response.status).toBe(500);
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(previousFeatures);
    });
});
