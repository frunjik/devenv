import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
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

    it('returns only the Queued features stored in .features', async () => {
        await writeFile(join(root, '.features'), [
            '{"id":"123e4567-e89b-42d3-a456-426614174000","priority":"Low","status":"Wished","description":"Wish"}',
            '{"id":"123e4567-e89b-42d3-a456-426614174001","priority":"High","status":"Queued","description":"Backlog item"}',
            '',
        ].join('\n'));

        const response = await request(app).get('/backlog');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([
            { id: '123e4567-e89b-42d3-a456-426614174001', priority: 'High', status: 'Queued', description: 'Backlog item' },
        ]);
    });

    it('returns an empty backlog when .features does not exist and forwards other read errors', async () => {
        expect((await request(app).get('/backlog')).body).toEqual({ data: [] });

        await mkdir(join(root, '.features'));
        expect((await request(app).get('/backlog')).status).toBe(500);
    });

    it('migrates .wishlist, .backlog and .delivered into .features once and removes them', async () => {
        const line = (id: string, status: string): string =>
            `{"id":"123e4567-e89b-42d3-a456-42661417400${id}","priority":"Low","status":"${status}","description":"f${id}"}\n`;
        await writeFile(join(root, '.features'), line('0', 'Wished'));
        await writeFile(join(root, '.wishlist'), line('0', 'Done') + line('1', 'Wished'));
        await writeFile(join(root, '.backlog'), line('2', 'Queued'));
        await writeFile(join(root, '.delivered'), '');

        const response = await request(app).get('/features');

        expect(response.body.data.map((feature: { id: string }) => feature.id.slice(-1))).toEqual(['0', '1', '2']);
        expect(response.body.data[0].status).toBe('Wished');
        expect((await readFile(join(root, '.features'), 'utf8')).split('\n').filter(Boolean)).toHaveLength(3);
        for (const legacy of ['.wishlist', '.backlog', '.delivered']) {
            await expect(readFile(join(root, legacy), 'utf8')).rejects.toThrow();
        }
    });

    it('returns .archived entries (legacy ones as Done) with stable ids without rewriting the file', async () => {
        const contents = [
            'Archived',
            '// [2026-10-04 21:00 +02:00] Extracted the service.',
            '{"id":"123e4567-e89b-42d3-a456-426614174002","priority":"High","status":"Archived","description":"JSON entry"}',
            '',
        ].join('\n');
        await writeFile(join(root, '.archived'), contents);

        const first = (await request(app).get('/archived')).body.data;
        const second = (await request(app).get('/archived')).body.data;

        expect(first).toHaveLength(2);
        expect(first[0]).toMatchObject({
            createdAt: '2026-10-04 21:00 +02:00',
            status: 'Done',
            description: 'Extracted the service.',
        });
        expect(first[0].id).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
        expect(second).toEqual(first);
        expect(first[1]).toMatchObject({ id: '123e4567-e89b-42d3-a456-426614174002', status: 'Archived', description: 'JSON entry' });
        expect(await readFile(join(root, '.archived'), 'utf8')).toBe(contents);
    });

    it('returns JSON .archived entries that are not marked Archived as Done', async () => {
        await writeFile(join(root, '.archived'),
            '{"id":"123e4567-e89b-42d3-a456-426614174003","priority":"Low","status":"Wished","description":"Old JSON"}\n');

        expect((await request(app).get('/archived')).body.data).toMatchObject([{ status: 'Done', description: 'Old JSON' }]);
    });
    it('returns no archived features when .archived is missing and forwards other read errors', async () => {
        expect((await request(app).get('/archived')).body).toEqual({ data: [] });

        await mkdir(join(root, '.archived'));
        expect((await request(app).get('/archived')).status).toBe(500);
    });

    describe('archiving a feature', () => {
        const id = '123e4567-e89b-42d3-a456-426614174001';
        const otherId = '123e4567-e89b-42d3-a456-426614174002';
        const record = (featureId: string, status: string): string =>
            `{"id":"${featureId}","priority":"Low","status":"${status}","description":"Item"}`;

        it('moves the feature from .features to .archived with status Archived', async () => {
            await writeFile(join(root, '.features'), [record(id, 'Done'), record(otherId, 'Wished'), ''].join('\n'));
            await writeFile(join(root, '.archived'), 'Archived\n');

            const response = await request(app).post(`/features/${id}/archive`).send({});

            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({ id, status: 'Archived' });
            expect(await readFile(join(root, '.features'), 'utf8')).toBe(record(otherId, 'Wished') + '\n');
            expect(await readFile(join(root, '.archived'), 'utf8')).toBe(`Archived\n${record(id, 'Archived')}\n`);
            expect((await request(app).get('/archived')).body.data).toMatchObject([{ id, status: 'Archived' }]);
        });

        it('creates .archived when it does not exist', async () => {
            await writeFile(join(root, '.features'), record(id, 'Done') + '\n');

            await request(app).post(`/features/${id}/archive`).send({});

            expect(await readFile(join(root, '.archived'), 'utf8')).toBe(record(id, 'Archived') + '\n');
        });

        it('rejects malformed ids and reports unknown features', async () => {
            expect((await request(app).post('/features/nope/archive').send({})).status).toBe(400);
            const missing = await request(app).post(`/features/${id}/archive`).send({});
            expect(missing.status).toBe(404);
        });

        it('forwards filesystem errors', async () => {
            await writeFile(join(root, '.features'), record(id, 'Done') + '\n');
            await mkdir(join(root, '.archived'));

            expect((await request(app).post(`/features/${id}/archive`).send({})).status).toBe(500);
        });
    });
    describe('archiving all Done features', () => {
        const record = (id: string, status: string): string =>
            `{"id":"${id}","priority":"Low","status":"${status}","description":"Item"}`;
        const a = '123e4567-e89b-42d3-a456-426614174001';
        const b = '123e4567-e89b-42d3-a456-426614174002';
        const c = '123e4567-e89b-42d3-a456-426614174003';

        it('moves every Done feature to .archived and keeps the others', async () => {
            await writeFile(join(root, '.features'), [record(a, 'Done'), record(b, 'Wished'), record(c, 'Done'), ''].join('\n'));

            const response = await request(app).post('/features/archive-done').send({});

            expect(response.body.data.map((feature: { id: string }) => feature.id)).toEqual([a, c]);
            expect(await readFile(join(root, '.features'), 'utf8')).toBe(record(b, 'Wished') + '\n');
            expect(await readFile(join(root, '.archived'), 'utf8')).toBe(record(a, 'Archived') + '\n' + record(c, 'Archived') + '\n');
        });

        it('returns an empty list and writes nothing when no feature is Done', async () => {
            await writeFile(join(root, '.features'), record(b, 'Wished') + '\n');

            expect((await request(app).post('/features/archive-done').send({})).body).toEqual({ data: [] });
            await expect(readFile(join(root, '.archived'), 'utf8')).rejects.toThrow();
        });

        it('forwards filesystem errors', async () => {
            await writeFile(join(root, '.features'), record(a, 'Done') + '\n');
            await mkdir(join(root, '.archived'));

            expect((await request(app).post('/features/archive-done').send({})).status).toBe(500);
        });
    });
    describe('delivering Done features on commit', () => {
        const doneId = '123e4567-e89b-42d3-a456-426614174001';
        const openId = '123e4567-e89b-42d3-a456-426614174002';
        const record = (id: string, status: string, description: string): string =>
            `{"id":"${id}","priority":"Low","status":"${status}","description":"${description}"}`;
        let gitApp: ReturnType<typeof createApp>;
        let originalNodeEnv: string | undefined;

        beforeEach(async () => {
            originalNodeEnv = process.env['NODE_ENV'];
            process.env['NODE_ENV'] = 'test';
            execFileSync('git', ['init', root]);
            execFileSync('git', ['-C', root, 'config', 'user.name', 'Test User']);
            execFileSync('git', ['-C', root, 'config', 'user.email', 'test@example.com']);
            gitApp = createApp(root, { gitCommitCwd: root });
        });

        afterEach(() => {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        });

        it('moves Done records from .current into .features and removes the task line before committing', async () => {
            await writeFile(join(root, '.current'),
                `${record(doneId, 'Done', 'Finished')}\n${record(openId, 'InProgress', 'Working')}\nlegacy line\n`);
            await writeFile(join(root, '.features'),
                `${record(doneId, 'Queued', 'Finished')}\n${record(openId, 'Wished', 'Other')}\n`);
            await writeFile(join(root, 'DEVENVOPDEV.md'),
                `The features you are writing are, take them one by one:\n${record(doneId, 'Queued', 'Finished')}\n`);

            const response = await request(gitApp).post('/git/commit').send({ message: 'Deliver' });

            expect(response.status).toBe(200);
            const stored = (await readFile(join(root, '.features'), 'utf8')).split('\n').filter(Boolean)
                .map(entry => JSON.parse(entry));
            expect(stored.map(feature => [feature.id, feature.status])).toEqual([[openId, 'Wished'], [doneId, 'Done']]);
            expect(await readFile(join(root, '.current'), 'utf8')).not.toContain(doneId);
            expect(await readFile(join(root, '.current'), 'utf8')).toContain(openId);
            expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).not.toContain(doneId);
            expect(execFileSync('git', ['-C', root, 'show', 'HEAD:.features'], { encoding: 'utf8' })).toContain(doneId);
        });

        it('leaves everything untouched when .current is missing or has no Done records', async () => {
            await writeFile(join(root, 'sample.txt'), 'x');
            expect((await request(gitApp).post('/git/commit').send({ message: 'One' })).status).toBe(200);

            await writeFile(join(root, '.current'), `${record(openId, 'InProgress', 'Working')}\n`);
            expect((await request(gitApp).post('/git/commit').send({ message: 'Two' })).status).toBe(200);
            await expect(readFile(join(root, '.features'), 'utf8')).rejects.toThrow();
        });

        it('delivers when .features and DEVENVOPDEV.md do not contain the record yet', async () => {
            await writeFile(join(root, '.current'), `${record(doneId, 'Done', 'Finished')}\n`);
            await writeFile(join(root, '.features'), `${record(openId, 'Wished', 'Other')}\n`);

            expect((await request(gitApp).post('/git/commit').send({ message: 'Deliver' })).status).toBe(200);
            expect(await readFile(join(root, '.features'), 'utf8')).toContain(doneId);
            expect(await readFile(join(root, '.features'), 'utf8')).toContain(openId);
        });

        it('keeps CRLF line endings in .current', async () => {
            await writeFile(join(root, '.current'),
                `${record(doneId, 'Done', 'Finished')}\r\n${record(openId, 'InProgress', 'Working')}\r\n`);

            expect((await request(gitApp).post('/git/commit').send({ message: 'Deliver' })).status).toBe(200);
            expect(await readFile(join(root, '.current'), 'utf8')).toBe(`${record(openId, 'InProgress', 'Working')}\r\n`);
        });

        it('fails the commit when a tracking file cannot be read', async () => {
            await mkdir(join(root, '.current'));
            expect((await request(gitApp).post('/git/commit').send({ message: 'Fail' })).status).toBe(500);

            await rm(join(root, '.current'), { recursive: true });
            await writeFile(join(root, '.current'), `${record(doneId, 'Done', 'Finished')}\n`);
            await mkdir(join(root, '.features'));
            expect((await request(gitApp).post('/git/commit').send({ message: 'Fail' })).status).toBe(500);
        });
    });
});
