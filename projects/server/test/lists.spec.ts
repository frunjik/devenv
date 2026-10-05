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

    it('returns .archived entries as Done features with stable ids without rewriting the file', async () => {
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
        expect(first[1]).toMatchObject({ id: '123e4567-e89b-42d3-a456-426614174002', status: 'Done', description: 'JSON entry' });
        expect(await readFile(join(root, '.archived'), 'utf8')).toBe(contents);
    });

    it('returns no archived features when .archived is missing and forwards other read errors', async () => {
        expect((await request(app).get('/archived')).body).toEqual({ data: [] });

        await mkdir(join(root, '.archived'));
        expect((await request(app).get('/archived')).status).toBe(500);
    });

    it('returns .delivered features as Done and forwards read errors', async () => {
        expect((await request(app).get('/delivered')).body).toEqual({ data: [] });

        await writeFile(join(root, '.delivered'),
            '{"id":"123e4567-e89b-42d3-a456-426614174000","priority":"Low","status":"Delivered","description":"Shipped"}\n');
        const response = await request(app).get('/delivered');
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toMatchObject({ description: 'Shipped', status: 'Done' });

        await rm(join(root, '.delivered'));
        await mkdir(join(root, '.delivered'));
        expect((await request(app).get('/delivered')).status).toBe(500);
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

        it('moves Done records from .current to .delivered and removes them elsewhere before committing', async () => {
            await writeFile(join(root, '.current'),
                `${record(doneId, 'Done', 'Finished')}\n${record(openId, 'InProgress', 'Working')}\nlegacy line\n`);
            await writeFile(join(root, '.backlog'), `${record(doneId, 'Queued', 'Finished')}\n`);
            await writeFile(join(root, '.wishlist'), `${record(openId, 'Wished', 'Other')}\n`);
            await writeFile(join(root, 'DEVENVOPDEV.md'),
                `The features you are writing are, take them one by one:\n${record(doneId, 'Queued', 'Finished')}\n`);

            const response = await request(gitApp).post('/git/commit').send({ message: 'Deliver' });

            expect(response.status).toBe(200);
            expect(await readFile(join(root, '.delivered'), 'utf8')).toContain(doneId);
            expect(await readFile(join(root, '.current'), 'utf8')).not.toContain(doneId);
            expect(await readFile(join(root, '.current'), 'utf8')).toContain(openId);
            expect(await readFile(join(root, '.backlog'), 'utf8')).not.toContain(doneId);
            expect(await readFile(join(root, '.wishlist'), 'utf8')).toContain(openId);
            expect(await readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')).not.toContain(doneId);
            expect(execFileSync('git', ['-C', root, 'show', 'HEAD:.delivered'], { encoding: 'utf8' })).toContain(doneId);
            const delivered = (await request(gitApp).get('/delivered')).body.data;
            expect(delivered.map((feature: { id: string }) => feature.id)).toEqual([doneId]);
        });

        it('leaves everything untouched when .current is missing or has no Done records', async () => {
            await writeFile(join(root, 'sample.txt'), 'x');
            expect((await request(gitApp).post('/git/commit').send({ message: 'One' })).status).toBe(200);

            await writeFile(join(root, '.current'), `${record(openId, 'InProgress', 'Working')}\n`);
            expect((await request(gitApp).post('/git/commit').send({ message: 'Two' })).status).toBe(200);
            await expect(readFile(join(root, '.delivered'), 'utf8')).rejects.toThrow();
        });

        it('delivers when the other files are missing or already clean', async () => {
            await writeFile(join(root, '.current'), `${record(doneId, 'Done', 'Finished')}\n`);
            await writeFile(join(root, '.wishlist'), `${record(openId, 'Wished', 'Other')}\n`);

            expect((await request(gitApp).post('/git/commit').send({ message: 'Deliver' })).status).toBe(200);
            expect(await readFile(join(root, '.wishlist'), 'utf8')).toContain(openId);
        });

        it('keeps CRLF line endings in the files it rewrites', async () => {
            await writeFile(join(root, '.current'),
                `${record(doneId, 'Done', 'Finished')}\r\n${record(openId, 'InProgress', 'Working')}\r\n`);
            await writeFile(join(root, '.backlog'),
                `${record(doneId, 'Queued', 'Finished')}\r\n${record(openId, 'Queued', 'Working')}\r\n`);

            expect((await request(gitApp).post('/git/commit').send({ message: 'Deliver' })).status).toBe(200);
            expect(await readFile(join(root, '.current'), 'utf8')).toBe(`${record(openId, 'InProgress', 'Working')}\r\n`);
            expect(await readFile(join(root, '.backlog'), 'utf8')).toBe(`${record(openId, 'Queued', 'Working')}\r\n`);
        });

        it('fails the commit when a tracking file cannot be read', async () => {
            await mkdir(join(root, '.current'));
            expect((await request(gitApp).post('/git/commit').send({ message: 'Fail' })).status).toBe(500);

            await rm(join(root, '.current'), { recursive: true });
            await writeFile(join(root, '.current'), `${record(doneId, 'Done', 'Finished')}\n`);
            await mkdir(join(root, '.backlog'));
            expect((await request(gitApp).post('/git/commit').send({ message: 'Fail' })).status).toBe(500);
        });
    });
});
