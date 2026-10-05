import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';
import serverPackage from '../package.json';

describe('features public API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };


    interface PersistedFeature {
        id: string;
        createdAt?: string;
        priority: string;
        status: string;
        description: string;
        deliveredDate?: string;
    }

    async function readPersistedFeatures(): Promise<PersistedFeature[]> {
        const contents = await readFile(join(root, '.wishlist'), 'utf8');
        return contents.split('\n').filter(Boolean).map(line => JSON.parse(line) as PersistedFeature);
    }

    function entryOf(feature: PersistedFeature): string {
        return `// ${feature.createdAt ? `[${feature.createdAt}] ` : ''}[${feature.id}] [${feature.priority}]`
            + ` [${feature.status}] ${feature.description}`
            + `${feature.deliveredDate ? ` [Delivered: ${feature.deliveredDate}]` : ''}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function entryData(body: { data: PersistedFeature | PersistedFeature[] }): any {
        return Array.isArray(body.data) ? body.data.map(entryOf) : entryOf(body.data);
    }

    async function readFeatureFile(): Promise<string> {
        const features = await readPersistedFeatures();
        return features.map(feature => `${entryOf(feature)}\n`).join('');
    }

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-feature-test-'));
        app = createApp(root);
        app.set('env', 'production');
        app.use(handleError);
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it('persists a created feature as a stringified JSON line with a unique ID in .wishlist', async () => {
        const first = await request(app).post('/features').send({ description: 'First persisted feature', priority: 'High' });
        const second = await request(app).post('/features').send({ description: 'Another unrelated record', status: 'Done' });

        const lines = (await readFile(join(root, '.wishlist'), 'utf8')).split('\n').filter(Boolean);
        const features = await readPersistedFeatures();

        expect(first.status).toBe(201);
        expect(second.status).toBe(201);
        expect(lines).toHaveLength(2);
        expect(lines.map(line => JSON.stringify(JSON.parse(line)))).toEqual(lines);
        expect(features[0]).toEqual({
            id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2}$/),
            priority: 'High',
            status: 'Wished',
            description: 'First persisted feature',
        });
        expect(features[1]).toMatchObject({
            priority: 'Low',
            status: 'Done',
            description: 'Another unrelated record',
            deliveredDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        });
        expect(features[0].id).not.toBe(features[1].id);
    });

    it('lists stored JSON features without rewriting an already normalized file', async () => {
        const stored = [
            JSON.stringify({
                id: '123e4567-e89b-42d3-a456-426614174000',
                createdAt: '2026-10-05 07:30 +02:00',
                priority: 'High',
                status: 'Queued',
                description: 'A stored feature',
            }),
            JSON.stringify({
                id: '123e4567-e89b-42d3-a456-426614174001',
                priority: 'Low',
                status: 'Done',
                description: 'Delivered feature',
                deliveredDate: '2026-10-05',
            }),
        ].join('\n') + '\n';
        await writeFile(join(root, '.wishlist'), stored);

        const response = await request(app).get('/features');

        expect(entryData(response.body)).toEqual([
            '// [2026-10-05 07:30 +02:00] [123e4567-e89b-42d3-a456-426614174000] [High] [Queued] A stored feature',
            '// [123e4567-e89b-42d3-a456-426614174001] [Low] [Done] Delivered feature [Delivered: 2026-10-05]',
        ]);
        expect(await readFile(join(root, '.wishlist'), 'utf8')).toBe(stored);
    });

    it('migrates legacy lines and treats invalid JSON records as legacy feature text', async () => {
        await writeFile(join(root, '.wishlist'), [
            '{not json',
            'null',
            '{"id":5}',
            '{"id":"a","description":5}',
            '{"id":"a","description":"d","priority":"Urgent","status":"Backlog"}',
            '{"id":"a","description":"d","priority":"Low","status":"Nope"}',
            '// [2026-10-04 22:46 +02:00] [123e4567-e89b-42d3-a456-426614174000] [High] [Done] legacy [Delivered: 2026-10-04]',
            '',
        ].join('\n'));

        const response = await request(app).get('/features');
        const features = await readPersistedFeatures();

        expect(entryData(response.body)).toHaveLength(7);
        expect(entryData(response.body)[0]).toMatch(/\[Medium\] \[Backlog\] \{not json$/);
        expect(entryData(response.body)[1]).toMatch(/\[Medium\] \[Backlog\] null$/);
        expect(features).toHaveLength(7);
        expect(features.every(feature => feature.priority && feature.status && feature.id)).toBe(true);
        expect(features[6]).toEqual({
            id: '123e4567-e89b-42d3-a456-426614174000',
            createdAt: '2026-10-04 22:46 +02:00',
            priority: 'High',
            status: 'Done',
            description: 'legacy',
            deliveredDate: '2026-10-04',
        });
    });

    it('returns PPTFeature objects from create, list, and update endpoints', async () => {
        const created = await request(app).post('/features').send({ description: 'Object api feature', priority: 'High' });
        const listed = await request(app).get('/features');
        const updated = await request(app)
            .patch(`/features/${created.body.data.id}`)
            .send({ priority: 'Low' });

        expect(created.body.data).toEqual({
            id: expect.stringMatching(/^[0-9a-f-]{36}$/),
            createdAt: expect.any(String),
            priority: 'High',
            status: 'Wished',
            description: 'Object api feature',
        });
        expect(listed.body.data).toEqual([created.body.data]);
        expect(updated.body.data).toEqual({ ...created.body.data, priority: 'Low' });
    });

    it('lists nonempty feature entries in file order', async () => {
        await writeFile(join(root, '.wishlist'), '\n// first feature\n \n// second feature\n');

        const response = await request(app).get('/features');

        expect(entryData(response.body)).toHaveLength(2);
        expect(entryData(response.body)[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] first feature$/);
        expect(entryData(response.body)[1]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] second feature$/);
        const persistedEntries = (await readFeatureFile()).trim().split(/\r?\n/);
        expect(persistedEntries).toEqual(entryData(response.body));
        expect(new Set(persistedEntries.map(entry => entry.match(/\[([0-9a-f-]{36})\]/)?.[1])).size).toBe(2);
    });

    it('returns the server package version from the public version API', async () => {
        const response = await request(app).get('/version');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: serverPackage.version });
    });

    it('adds IDs to legacy dated entries and preserves existing UUIDs', async () => {
        const existingId = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.wishlist'), [
            '// [2026-10-04 22:45 +02:00] legacy feature',
            `// [2026-10-04 22:46 +02:00] [${existingId}] [high] [in progress] identified feature`,
            '',
        ].join('\n'));

        const response = await request(app).get('/features');

        expect(entryData(response.body)[0]).toMatch(
            /^\/\/ \[2026-10-04 22:45 \+02:00\] \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] legacy feature$/,
        );
        expect(entryData(response.body)[1]).toBe(
            `// [2026-10-04 22:46 +02:00] [${existingId}] [High] [InProgress] identified feature`,
        );
    });

    it('adds a Medium priority to legacy entries without timestamps', async () => {
        await writeFile(join(root, '.wishlist'), '// legacy feature\n');

        const response = await request(app).get('/features');

        expect(entryData(response.body)[0]).toMatch(
            /^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] legacy feature$/,
        );
    });

    it('adds a Backlog status to legacy entries and preserves existing statuses', async () => {
        const existingId = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.wishlist'), [
            '// legacy feature',
            `// [2026-10-04 22:46 +02:00] [${existingId}] [High] [dOnE] completed feature`,
            '// [123e4567-e89b-42d3-a456-426614174001] [Low] [qUeStIoNs] waiting for clarification',
            '// [123e4567-e89b-42d3-a456-426614174002] [Low] [aBoRtEd] aborted feature',
            '// [123e4567-e89b-42d3-a456-426614174003] [Low] [dEnIeD] rejected feature',
            '',
        ].join('\n'));

        const response = await request(app).get('/features');

        expect(entryData(response.body)[0]).toMatch(/\[Medium\] \[Backlog\] legacy feature$/);
        expect(entryData(response.body)[1]).toBe(
            `// [2026-10-04 22:46 +02:00] [${existingId}] [High] [Done] completed feature`,
        );
        expect(entryData(response.body)[2]).toBe(
            '// [123e4567-e89b-42d3-a456-426614174001] [Low] [Questions] waiting for clarification',
        );
        expect(entryData(response.body)[3]).toBe(
            '// [123e4567-e89b-42d3-a456-426614174002] [Low] [Aborted] aborted feature',
        );
        expect(entryData(response.body)[4]).toBe(
            '// [123e4567-e89b-42d3-a456-426614174003] [Low] [Denied] rejected feature',
        );
    });

    it('returns an empty list when the features file is empty', async () => {
        await writeFile(join(root, '.wishlist'), ' \n\n');

        const response = await request(app).get('/features');

        expect(response.body).toEqual({ data: [] });
    });

    it('returns an empty list when the features file does not exist', async () => {
        const response = await request(app).get('/features');

        expect(response.body).toEqual({ data: [] });
    });

    it('forwards feature list read errors to Express', async () => {
        await mkdir(join(root, '.wishlist'));

        const response = await request(app).get('/features');

        expect(response.status).toBe(500);
    });

    it('appends a timestamped one-line feature entry in history format', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: '  Add a feature\nwith multiline details  ' });

        expect(response.status).toBe(201);
        expect(entryData(response.body)).toMatch(
            /^\/\/ \[\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2}\] \[[0-9a-f-]{36}\] \[Low\] \[Wished\] Add a feature with multiline details$/,
        );
        expect(await readFeatureFile()).toBe(`${entryData(response.body)}\n`);
    });

    it('adds a delivered date when a feature is created as Done', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Create an already completed feature', status: 'Done' });

        expect(response.status).toBe(201);
        expect(entryData(response.body)).toMatch(
            /\[Done\] Create an already completed feature \[Delivered: \d{4}-\d{2}-\d{2}\]$/,
        );
    });

    it('merges descriptions with more than three matching words and preserves the existing feature', async () => {
        const created = await request(app).post('/features').send({
            description: 'Create reusable navigation toolbar component',
            priority: 'High',
            status: 'Queued',
        });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'),
            `- [In progress] Create reusable navigation toolbar component <!-- feature-id:${id} -->\n`);

        const response = await request(app).post('/features').send({
            description: 'Create a navigation toolbar component with reusable styles',
            priority: 'Low',
            status: 'Backlog',
        });
        const mergedDescription =
            'Create reusable navigation toolbar component; Create a navigation toolbar component with reusable styles';

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toBe(
            entryData(created.body).replace(
                'Create reusable navigation toolbar component',
                mergedDescription,
            ),
        );
        expect(entryData(response.body)).toContain(`[${id}] [High] [Queued]`);
        expect(await readFeatureFile()).toBe(`${entryData(response.body)}\n`);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toBe(
            `- [In progress] ${mergedDescription} <!-- feature-id:${id} -->\n`,
        );
    });

    it('adds a feature when only three unique words match an existing description', async () => {
        await request(app).post('/features').send({
            description: 'Create reusable navigation toolbar',
        });

        const response = await request(app).post('/features').send({
            description: 'Create reusable navigation menu',
        });

        expect(response.status).toBe(201);
        expect((await request(app).get('/features')).body.data).toHaveLength(2);
    });

    it('does not append a duplicate when the description already matches exactly', async () => {
        const created = await request(app).post('/features').send({
            description: 'Build a reusable feature toolbar',
        });

        const response = await request(app).post('/features').send({
            description: 'Build a reusable feature toolbar',
        });

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toBe(entryData(created.body));
        expect(await readFeatureFile()).toBe(`${entryData(created.body)}\n`);
    });

    it('does not treat punctuation-only descriptions as duplicates', async () => {
        await request(app).post('/features').send({ description: '!!!' });
        const response = await request(app).post('/features').send({ description: '!!!' });

        expect(response.status).toBe(201);
        expect((await request(app).get('/features')).body.data).toHaveLength(2);
    });

    it('rolls back a merged description when updating the active task marker fails', async () => {
        const created = await request(app).post('/features').send({
            description: 'Create reusable navigation toolbar component',
            status: 'Queued',
        });
        await mkdir(join(root, 'DEVENVOPDEV.md'));

        const response = await request(app).post('/features').send({
            description: 'Create a navigation toolbar component with reusable styles',
        });

        expect(response.status).toBe(500);
        expect(await readFeatureFile()).toBe(`${entryData(created.body)}\n`);
    });

    it('accepts an explicit feature priority', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Urgent feature', priority: 'High' });

        expect(response.status).toBe(201);
        expect(entryData(response.body)).toMatch(/\[High\] \[Wished\] Urgent feature$/);
        expect(await readFeatureFile()).toBe(`${entryData(response.body)}\n`);
    });

    it('accepts an explicit feature status', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Feature already underway', status: 'Queued' });

        expect(response.status).toBe(201);
        expect(entryData(response.body)).toMatch(/\[Low\] \[Queued\] Feature already underway$/);
    });

    it('accepts Aborted as a feature status', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Feature stopped before completion', status: 'Aborted' });

        expect(response.status).toBe(201);
        expect(entryData(response.body)).toMatch(/\[Low\] \[Aborted\] Feature stopped before completion$/);
    });

    it('accepts Denied as a feature status', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Feature not accepted', status: 'Denied' });

        expect(response.status).toBe(201);
        expect(entryData(response.body)).toMatch(/\[Low\] \[Denied\] Feature not accepted$/);
    });

    it('accepts Committed as a feature status', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Feature already committed', status: 'Committed' });

        expect(response.status).toBe(201);
        expect(entryData(response.body)).toMatch(/\[Low\] \[Committed\] Feature already committed$/);
    });

    it('accepts Questions as a feature status', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: 'Feature waiting for clarification', status: 'Questions' });

        expect(response.status).toBe(201);
        expect(entryData(response.body)).toMatch(/\[Low\] \[Questions\] Feature waiting for clarification$/);
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
            error: { message: 'Feature status must be Questions, Wished, Backlog, Queued, Committed, InProgress, Delivered, Done, Aborted, Denied, or Archived.' },
        });
    });

    it('assigns a distinct UUID to each created feature', async () => {
        const first = await request(app).post('/features').send({ description: 'First feature' });
        const second = await request(app).post('/features').send({ description: 'Second feature' });
        const idFrom = (entry: string) =>
            entry.match(/\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]/)?.[1];

        expect(idFrom(entryData(first.body))).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(idFrom(entryData(second.body))).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(idFrom(entryData(first.body))).not.toBe(idFrom(entryData(second.body)));
    });

    it('appends new entries after existing feature entries', async () => {
        await writeFile(join(root, '.wishlist'), '// existing entry\n');

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        const entries = (await readFeatureFile()).trim().split(/\r?\n/);
        expect(entries).toHaveLength(2);
        expect(entries[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] existing entry$/);
        expect(entries[1]).toBe(entryData(response.body));
    });

    it('separates an existing file without a trailing newline', async () => {
        await writeFile(join(root, '.wishlist'), '// existing entry');

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        const entries = (await readFeatureFile()).trim().split(/\r?\n/);
        expect(entries).toHaveLength(2);
        expect(entries[0]).toMatch(/^\/\/ \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] existing entry$/);
        expect(entries[1]).toBe(entryData(response.body));
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
        await mkdir(join(root, '.wishlist'));

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        expect(response.status).toBe(500);
    });

    it('updates a feature priority and preserves its description', async () => {
        const created = await request(app).post('/features')
            .send({ description: 'Prioritize this feature', priority: 'High' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).patch(`/features/${id}`).send({ priority: 'Low' });

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toBe(entryData(created.body).replace('[High]', '[Low]'));
        expect(await readFeatureFile()).toBe(`${entryData(response.body)}\n`);
    });

    it('updates a description while preserving the feature ID, priority, and status', async () => {
        const created = await request(app).post('/features')
            .send({ description: 'Old description', priority: 'High', status: 'Queued' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'The features you are writing are, take them one by one:',
            `- [In progress] Old description <!-- feature-id:${id} -->`,
            '',
        ].join('\r\n'));

        const response = await request(app).patch(`/features/${id}/description`)
            .send({ description: '  Revised\n\t description  ' });

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toBe(entryData(created.body).replace(
            'Old description',
            'Revised description',
        ));
        expect(await readFeatureFile()).toBe(`${entryData(response.body)}\n`);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toContain(
            `- [In progress] Revised description <!-- feature-id:${id} -->`,
        );
    });

    it('updates backlog descriptions when DEVENVOPDEV.md does not exist', async () => {
        const created = await request(app).post('/features')
            .send({ description: 'Backlog feature', status: 'Backlog' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).patch(`/features/${id}/description`)
            .send({ description: 'Updated backlog feature' });

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toContain('[Backlog] Updated backlog feature');
        await expect(readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it('updates in-progress descriptions when the task marker is absent', async () => {
        const created = await request(app).post('/features')
            .send({ description: 'Unlisted task', status: 'Queued' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), 'Instructions without a matching marker\n');

        const response = await request(app).patch(`/features/${id}/description`)
            .send({ description: 'Updated unlisted task' });

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toContain('[Queued] Updated unlisted task');
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8'))
            .toBe('Instructions without a matching marker\n');
    });

    it('preserves LF endings when updating a matching task marker', async () => {
        const created = await request(app).post('/features')
            .send({ description: 'LF task', status: 'Queued' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
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
            status: 'Queued',
        });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        await mkdir(join(root, 'DEVENVOPDEV.md'));

        const response = await request(app)
            .patch(`/features/${id}/description`)
            .send({ description: 'New task description' });

        expect(response.status).toBe(500);
        expect(await readFeatureFile()).toBe(`${entryData(created.body)}\n`);
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
        await mkdir(join(root, '.wishlist'));

        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000')
            .send({ priority: 'High' });

        expect(response.status).toBe(500);
    });

    it('moves an in-progress feature up or down without changing other feature positions', async () => {
        const firstId = '123e4567-e89b-42d3-a456-426614174000';
        const backlogId = '123e4567-e89b-42d3-a456-426614174001';
        const secondId = '123e4567-e89b-42d3-a456-426614174002';
        const completedId = '123e4567-e89b-42d3-a456-426614174003';
        const originalEntries = [
            `// [${firstId}] [High] [Queued] First active feature`,
            `// [${backlogId}] [Low] [Backlog] Unchanged backlog feature`,
            `// [${secondId}] [Medium] [Queued] Second active feature`,
            `// [${completedId}] [Low] [Done] Unchanged completed feature`,
        ];
        await writeFile(join(root, '.wishlist'), `${originalEntries.join('\n')}\n`);

        const movedUp = await request(app)
            .patch(`/features/${secondId}/order`)
            .send({ direction: 'up' });

        expect(movedUp.status).toBe(200);
        expect(entryData(movedUp.body)).toEqual([
            originalEntries[2],
            originalEntries[1],
            originalEntries[0],
            originalEntries[3],
        ]);
        expect(await readFeatureFile())
            .toBe(`${entryData(movedUp.body).join('\n')}\n`);

        const movedDown = await request(app)
            .patch(`/features/${secondId}/order`)
            .send({ direction: 'down' });

        expect(movedDown.status).toBe(200);
        expect(entryData(movedDown.body)).toEqual(originalEntries);
        expect(await readFeatureFile())
            .toBe(`${originalEntries.join('\n')}\n`);
    });

    it('keeps feature order unchanged when a move reaches either boundary', async () => {
        const firstId = '123e4567-e89b-42d3-a456-426614174000';
        const lastId = '123e4567-e89b-42d3-a456-426614174001';
        const entries = [
            `// [${firstId}] [High] [Queued] First active feature`,
            `// [${lastId}] [Low] [Queued] Last active feature`,
        ];
        await writeFile(join(root, '.wishlist'), `${entries.join('\n')}\n`);

        const firstMove = await request(app).patch(`/features/${firstId}/order`).send({ direction: 'up' });
        const lastMove = await request(app).patch(`/features/${lastId}/order`).send({ direction: 'down' });

        expect(entryData(firstMove.body)).toEqual(entries);
        expect(entryData(lastMove.body)).toEqual(entries);
        expect(await readFeatureFile()).toBe(`${entries.join('\n')}\n`);
    });

    it.each([
        ['malformed ID', '/features/not-a-uuid/order', { direction: 'up' }],
        ['invalid direction', '/features/123e4567-e89b-42d3-a456-426614174000/order', { direction: 'sideways' }],
        ['missing direction', '/features/123e4567-e89b-42d3-a456-426614174000/order', {}],
    ])('rejects a feature move with %s', async (_caseName, path, body) => {
        const response = await request(app).patch(path).send(body);

        expect(response.status).toBe(400);
    });

    it('returns not found when moving a missing feature', async () => {
        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000/order')
            .send({ direction: 'up' });

        expect(response.status).toBe(404);
        expect(response.body.error.message).toContain('was not found');
    });

    it('rejects moving a feature that is not in progress', async () => {
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.wishlist'), `// [${id}] [Low] [Backlog] Backlog feature\n`);

        const response = await request(app)
            .patch(`/features/${id}/order`)
            .send({ direction: 'up' });

        expect(response.status).toBe(409);
        expect(response.body.error.message).toContain('is not queued');
    });

    it('forwards feature order filesystem errors to Express', async () => {
        await mkdir(join(root, '.wishlist'));

        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000/order')
            .send({ direction: 'up' });

        expect(response.status).toBe(500);
    });

    it('updates a feature status and preserves its priority and description', async () => {
        const created = await request(app)
            .post('/features')
            .send({ description: 'Move this feature forward', priority: 'High' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status: 'Queued' });

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toBe(
            entryData(created.body).replace('[Wished]', '[Queued]'),
        );
        expect(await readFeatureFile()).toBe(`${entryData(response.body)}\n`);
    });

    it('starts a feature in the backlog and records it as in progress in DEVENVOPDEV.md', async () => {
        const created = await request(app).post('/features').send({ description: 'Implement feature tracking' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'Instructions',
            '',
            'The features you are writing are, take them one by one:',
            'Existing feature',
            '',
        ].join('\r\n'));

        const response = await request(app).post(`/features/${id}/start`).send({});

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toContain('[Queued] Implement feature tracking');
        expect(await readFile(join(root, '.wishlist'), 'utf8')).toBe('');
        const backlog = (await readFile(join(root, '.backlog'), 'utf8')).split('\n').filter(Boolean);
        expect(backlog.map(line => JSON.parse(line))).toEqual([response.body.data]);
        const listed = await request(app).get('/features');
        expect(listed.body.data).toEqual([response.body.data]);
        const taskFile = await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8');
        expect(taskFile).toContain(
            `The features you are writing are, take them one by one:\r\n- [In progress] Implement feature tracking <!-- feature-id:${id} -->\r\nExisting feature`,
        );
    });

    it('keeps started features in .backlog and others in .wishlist across later changes', async () => {
        const first = await request(app).post('/features').send({ description: 'Stay on the wishlist' });
        const second = await request(app).post('/features').send({ description: 'Move to the backlog' });
        await writeFile(join(root, 'DEVENVOPDEV.md'), 'The features you are writing are, take them one by one:\n');
        await request(app).post(`/features/${second.body.data.id}/start`).send({});

        const priority = await request(app)
            .patch(`/features/${second.body.data.id}`)
            .send({ priority: 'High' });

        expect(priority.status).toBe(200);
        const wishlist = (await readFile(join(root, '.wishlist'), 'utf8')).split('\n').filter(Boolean);
        const backlog = (await readFile(join(root, '.backlog'), 'utf8')).split('\n').filter(Boolean);
        expect(wishlist.map(line => JSON.parse(line).id)).toEqual([first.body.data.id]);
        expect(backlog.map(line => JSON.parse(line).id)).toEqual([second.body.data.id]);

        await request(app).delete(`/features/${second.body.data.id}`);
        expect(await readFile(join(root, '.backlog'), 'utf8')).toBe('');
    });

    it('adds a newly started feature after the existing in-progress tasks', async () => {
        const created = await request(app).post('/features').send({ description: 'Last active feature' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'Instructions',
            '',
            'The features you are writing are, take them one by one:',
            '- [In progress] Existing active one',
            '- [In progress] Existing active two',
            '- [Backlog] Deferred feature',
            '',
        ].join('\n'));

        const response = await request(app).post(`/features/${id}/start`).send({});

        expect(response.status).toBe(200);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toBe([
            'Instructions',
            '',
            'The features you are writing are, take them one by one:',
            '- [In progress] Existing active one',
            '- [In progress] Existing active two',
            `- [In progress] Last active feature <!-- feature-id:${id} -->`,
            '- [Backlog] Deferred feature',
            '',
        ].join('\n'));
    });

    it('moves an existing task marker to the bottom without creating a duplicate', async () => {
        const id = '123e4567-e89b-42d3-a456-426614174000';
        const otherId = '123e4567-e89b-42d3-a456-426614174001';
        await writeFile(join(root, '.wishlist'),
            `// [${id}] [High] [Queued] Keep task listed\n`);
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'Instructions',
            '',
            'The features you are writing are, take them one by one:',
            `- [In progress] Keep task listed <!-- feature-id:${id} -->`,
            `- [In progress] Another task <!-- feature-id:${otherId} -->`,
            '- [Backlog] Deferred feature',
            '',
        ].join('\n'));

        const response = await request(app).post(`/features/${id}/start`).send({});

        expect(response.status).toBe(200);
        const taskFile = await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8');
        expect(taskFile.match(new RegExp(`feature-id:${id}`, 'g'))).toHaveLength(1);
        expect(taskFile).toBe([
            'Instructions',
            '',
            'The features you are writing are, take them one by one:',
            `- [In progress] Another task <!-- feature-id:${otherId} -->`,
            `- [In progress] Keep task listed <!-- feature-id:${id} -->`,
            '- [Backlog] Deferred feature',
            '',
        ].join('\n'));
    });

    it('adds the feature section when DEVENVOPDEV.md has no task heading', async () => {
        const created = await request(app).post('/features').send({ description: 'Append task section' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
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
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
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
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).post(`/features/${id}/start`).send({});

        expect(response.status).toBe(500);
        expect(await readFeatureFile()).toBe(`${entryData(created.body)}\n`);
    });

    it.each(['Questions', 'Backlog', 'Queued', 'Committed', 'Done', 'Aborted', 'Denied'] as const)(
        'accepts a %s status update',
        async status => {
        const created = await request(app).post('/features').send({ description: 'Complete this feature' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status });

        expect(entryData(response.body)).toContain(`[${status}] Complete this feature`);
        },
    );

    it('marks a feature committed and removes its in-progress task marker', async () => {
        const id = '123e4567-e89b-42d3-a456-426614174000';
        const feature = `// [${id}] [High] [Queued] Commit this feature`;
        const marker = `<!-- feature-id:${id} -->`;
        await writeFile(join(root, '.wishlist'), `${feature}\n`);
        await writeFile(join(root, 'DEVENVOPDEV.md'), `- [In progress] Commit this feature ${marker}\n`);

        const response = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status: 'Committed' });

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toBe(feature.replace('[Queued]', '[Committed]'));
        expect(await readFeatureFile()).toBe(`${entryData(response.body)}\n`);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).not.toContain(marker);
    });

    it('removes the task marker when marking a feature done but keeps the feature record', async () => {
        const created = await request(app).post('/features').send({ description: 'Keep completed feature' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        const marker = `<!-- feature-id:${id} -->`;
        const otherTask = '- [In progress] Keep this task <!-- feature-id:123e4567-e89b-42d3-a456-426614174000 -->';
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'The features you are writing are, take them one by one:',
            `- [In progress] Keep completed feature ${marker}`,
            otherTask,
            '',
        ].join('\n'));

        const response = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status: 'Done' });

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toContain('[Done] Keep completed feature');
        expect(await readFeatureFile()).toContain('[Done] Keep completed feature');
        const taskFile = await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8');
        expect(taskFile).not.toContain(marker);
        expect(taskFile).toContain(otherTask);
    });

    it('keeps the delivered date when editing a Done feature and removes it when reopened', async () => {
        const created = await request(app).post('/features').send({ description: 'Finish this feature' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        const completed = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status: 'Done' });
        const deliveredDate = entryData(completed.body).match(/\[Delivered: (\d{4}-\d{2}-\d{2})\]$/)?.[1];
        expect(deliveredDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        const edited = await request(app)
            .patch(`/features/${id}/description`)
            .send({ description: 'Finish this revised feature' });
        expect(entryData(edited.body)).toContain(
            `[Done] Finish this revised feature [Delivered: ${deliveredDate}]`,
        );

        const reopened = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status: 'Backlog' });
        expect(entryData(reopened.body)).toBe(entryData(edited.body).replace(
            `[Done] Finish this revised feature [Delivered: ${deliveredDate}]`,
            '[Backlog] Finish this revised feature',
        ));
    });

    it('aborts an in-progress feature and removes its task marker while keeping the feature record', async () => {
        const id = '123e4567-e89b-42d3-a456-426614174000';
        const feature = `// [${id}] [High] [Queued] Stop this feature`;
        const marker = `<!-- feature-id:${id} -->`;
        const otherTask = '- [In progress] Keep this task <!-- feature-id:123e4567-e89b-42d3-a456-426614174001 -->';
        await writeFile(join(root, '.wishlist'), `${feature}\n`);
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'The features you are writing are, take them one by one:',
            `- [In progress] Stop this feature ${marker}`,
            otherTask,
            '',
        ].join('\n'));

        const response = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status: 'Aborted' });

        expect(response.status).toBe(200);
        expect(entryData(response.body)).toBe(feature.replace('[Queued]', '[Aborted]'));
        expect(await readFeatureFile()).toBe(`${entryData(response.body)}\n`);
        const taskFile = await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8');
        expect(taskFile).not.toContain(marker);
        expect(taskFile).toContain(otherTask);
    });

    it('rolls back feature status when its task marker cannot be removed', async () => {
        const created = await request(app).post('/features').send({ description: 'Keep original status' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), `- [In progress] Keep original status <!-- feature-id:${id} -->`);
        await rm(join(root, 'DEVENVOPDEV.md'));
        await mkdir(join(root, 'DEVENVOPDEV.md'));

        const response = await request(app)
            .patch(`/features/${id}/status`)
            .send({ status: 'Done' });

        expect(response.status).toBe(500);
        expect(await readFeatureFile()).toBe(`${entryData(created.body)}\n`);
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
            error: { message: 'Feature status must be Questions, Wished, Backlog, Queued, Committed, InProgress, Delivered, Done, Aborted, Denied, or Archived.' },
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
        await mkdir(join(root, '.wishlist'));

        const response = await request(app)
            .patch('/features/123e4567-e89b-42d3-a456-426614174000/status')
            .send({ status: 'Done' });

        expect(response.status).toBe(500);
    });

    it('removes a feature by UUID and preserves the other entries', async () => {
        const first = await request(app).post('/features').send({ description: 'First feature' });
        const second = await request(app).post('/features').send({ description: 'Second feature' });
        const id = entryData(first.body).match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).delete(`/features/${id}`);

        expect(entryData(response.body)).toBe(entryData(first.body));
        expect((await readFeatureFile()).trim()).toBe(entryData(second.body));
    });

    it('removes the matching task from DEVENVOPDEV.md and preserves other tasks', async () => {
        const created = await request(app).post('/features').send({ description: 'Completed feature' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
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
        expect(await readFeatureFile()).toBe('');
    });

    it('removes a feature when its task marker is not present', async () => {
        const created = await request(app).post('/features').send({ description: 'No task marker' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        await writeFile(join(root, 'DEVENVOPDEV.md'), 'Keep this task.\n');

        const response = await request(app).delete(`/features/${id}`);

        expect(response.status).toBe(200);
        expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).toBe('Keep this task.\n');
        expect(await readFeatureFile()).toBe('');
    });

    it('preserves DEVENVOPDEV.md CRLF line endings when removing a task', async () => {
        const created = await request(app).post('/features').send({ description: 'Windows line endings' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
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
        const id = entryData(feature.body).match(/\[([0-9a-f-]{36})\]/)[1];

        const response = await request(app).delete(`/features/${id}`);

        expect(response.status).toBe(200);
        expect(await readFeatureFile()).toBe('');
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
        await mkdir(join(root, '.wishlist'));

        const response = await request(app)
            .delete('/features/123e4567-e89b-42d3-a456-426614174000');

        expect(response.status).toBe(500);
    });

    it('preserves the feature when its DEVENVOPDEV.md task cannot be removed', async () => {
        const created = await request(app).post('/features').send({ description: 'Keep on failure' });
        const id = entryData(created.body).match(/\[([0-9a-f-]{36})\]/)[1];
        const taskEntry = `- [In progress] Keep on failure <!-- feature-id:${id} -->`;
        await writeFile(join(root, 'DEVENVOPDEV.md'), taskEntry);
        const previousFeatures = `${entryData(created.body)}\n`;
        await rm(join(root, 'DEVENVOPDEV.md'));
        await mkdir(join(root, 'DEVENVOPDEV.md'));

        const response = await request(app).delete(`/features/${id}`);

        expect(response.status).toBe(500);
        expect(await readFeatureFile()).toBe(previousFeatures);
    });
});
