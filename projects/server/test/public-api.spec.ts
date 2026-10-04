import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp, startServer } from '../src/public-api';

describe('server public HTTP API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-server-test-'));
        await mkdir(join(root, 'nested'));
        await writeFile(join(root, 'sample.txt'), 'initial');
        app = createApp(root);
        app.set('env', 'production');
        const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
            response.status(500).end();
        };
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

    it('starts the server and binds an ephemeral port', async () => {
        const server = await startServer(root, 0);
        const address = server.address();
        expect(address && typeof address === 'object' && address.port).toBeTruthy();
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    });

    it('uses the default root and port when no startup arguments are supplied', async () => {
        const originalPort = process.env['PORT'];
        delete process.env['PORT'];

        try {
            const server = await startServer();
            await new Promise<void>((resolve, reject) => {
                server.close((error) => error ? reject(error) : resolve());
            });
        } catch (error) {
            expect(error).toMatchObject({ code: 'EADDRINUSE' });
        } finally {
            if (originalPort === undefined) {
                delete process.env['PORT'];
            } else {
                process.env['PORT'] = originalPort;
            }
        }
    });

    it('rejects startup when the requested port is invalid', async () => {
        await expect(startServer(root, -1)).rejects.toMatchObject({ code: 'ERR_SOCKET_BAD_PORT' });
    });
});
