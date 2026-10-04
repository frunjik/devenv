import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';

describe('files folders public API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-server-test-'));
        await mkdir(join(root, 'nested'));
        await writeFile(join(root, 'sample.txt'), 'initial');
        app = createApp(root);
        app.set('env', 'production');
        app.use(handleError);
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it('reads an existing file', async () => {
        const response = await request(app).get('/files').query({ path: 'sample.txt' });
        expect(response.body).toEqual({ data: 'initial' });
    });

    it('rejects a file request without a path', async () => {
        const response = await request(app).get('/files');
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path ''" } });
    });

    it('reports an unknown file path', async () => {
        const response = await request(app).get('/files').query({ path: 'missing.txt' });
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path 'missing.txt'" } });
    });

    it('forwards file read errors for directory paths', async () => {
        const response = await request(app).get('/files').query({ path: '.' });
        expect(response.status).toBe(500);
    });

    it('rejects a write request without a path', async () => {
        const response = await request(app).post('/files').send({ data: 'ignored' });
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path ''" } });
    });

    it('writes the provided file contents', async () => {
        const response = await request(app)
            .post('/files')
            .query({ path: 'sample.txt' })
            .send({ data: 'updated' });
        expect(response.body).toEqual({ data: 'OK' });
    });

    it('persists written file contents', async () => {
        await request(app).post('/files').query({ path: 'sample.txt' }).send({ data: 'updated' });
        const response = await request(app).get('/files').query({ path: 'sample.txt' });
        expect(response.body).toEqual({ data: 'updated' });
    });

    it('defaults omitted write contents to an empty string', async () => {
        const response = await request(app).post('/files').query({ path: 'empty.txt' }).send({});
        expect(response.body).toEqual({ data: 'OK' });
    });

    it('persists omitted write contents as an empty file', async () => {
        await request(app).post('/files').query({ path: 'empty.txt' }).send({});
        const response = await request(app).get('/files').query({ path: 'empty.txt' });
        expect(response.body).toEqual({ data: '' });
    });

    it('reports asynchronous write errors for missing directories', async () => {
        const response = await request(app)
            .post('/files')
            .query({ path: 'missing/file.txt' })
            .send({ data: 'unwritten' });
        expect(response.body).toEqual({
            error: { message: "ERROR: invalid path 'missing/file.txt'" },
        });
    });

    it('forwards write errors for directory paths', async () => {
        const response = await request(app).post('/files').query({ path: '.' }).send({ data: 'unwritten' });
        expect(response.status).toBe(500);
    });

    it('lists the server root when no folder path is supplied', async () => {
        const response = await request(app).get('/folders');
        expect(response.status).toBe(200);
    });

    it('lists files and directories with their kinds', async () => {
        const response = await request(app).get('/folders').query({ path: '.' });
        expect(response.body.data).toEqual(expect.arrayContaining([
            { filename: 'nested', isFolder: true },
            { filename: 'sample.txt', isFolder: false },
        ]));
    });

    it('rejects folder traversal paths', async () => {
        const response = await request(app).get('/folders').query({ path: '..' });
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path '..'" } });
    });

    it('reports unknown folder paths', async () => {
        const response = await request(app).get('/folders').query({ path: 'missing' });
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path 'missing'" } });
    });

    it('forwards folder read errors for file paths', async () => {
        const response = await request(app).get('/folders').query({ path: 'sample.txt' });
        expect(response.status).toBe(500);
    });

    it('returns the last nonempty line from the current file', async () => {
        await writeFile(join(root, '.current'), 'Current\n// older entry\n// latest entry\n');

        const response = await request(app).get('/current');

        expect(response.body).toEqual({ data: '// latest entry' });
    });

    it('returns null when the current file is empty', async () => {
        await writeFile(join(root, '.current'), ' \n\n');

        const response = await request(app).get('/current');

        expect(response.body).toEqual({ data: null });
    });

    it('returns null when the current file does not exist', async () => {
        const response = await request(app).get('/current');

        expect(response.body).toEqual({ data: null });
    });

    it('forwards current file read errors to Express', async () => {
        await mkdir(join(root, '.current'));

        const response = await request(app).get('/current');

        expect(response.status).toBe(500);
    });

    it('returns the first task entry from DEVENVOPDEV.md', async () => {
        await writeFile(join(root, 'DEVENVOPDEV.md'), [
            'Instructions',
            '',
            'The features you are writing are, take them one by one:',
            '',
            '- [In progress] Current task',
            '- Next task',
            '',
        ].join('\n'));

        const response = await request(app).get('/task');

        expect(response.body).toEqual({ data: '- [In progress] Current task' });
    });

    it('returns null when DEVENVOPDEV.md has no task entry', async () => {
        await writeFile(join(root, 'DEVENVOPDEV.md'), 'Instructions without a task section');

        const response = await request(app).get('/task');

        expect(response.body).toEqual({ data: null });
    });

    it('returns null when the task section is empty', async () => {
        await writeFile(join(root, 'DEVENVOPDEV.md'),
            'The features you are writing are, take them one by one:\n\n');

        const response = await request(app).get('/task');

        expect(response.body).toEqual({ data: null });
    });

    it('returns null when DEVENVOPDEV.md does not exist', async () => {
        const response = await request(app).get('/task');

        expect(response.body).toEqual({ data: null });
    });

    it('forwards DEVENVOPDEV.md read errors to Express', async () => {
        await mkdir(join(root, 'DEVENVOPDEV.md'));

        const response = await request(app).get('/task');

        expect(response.status).toBe(500);
    });
});
