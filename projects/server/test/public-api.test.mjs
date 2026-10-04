import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import request from 'supertest';
import { createApp, startServer } from '../../../dist/server/fesm2022/server.mjs';

const serverRoot = process.cwd();
const fixturePath = resolve(serverRoot, `.server-test-${process.pid}`);
const fixtureFile = join(fixturePath, 'sample.txt');
const fixtureFolder = join(fixturePath, 'nested');
const relativeFixturePath = relative(serverRoot, fixturePath).replaceAll('\\', '/');
let app;

function filePath(name) {
    return `${relativeFixturePath}/${name}`;
}

before(async () => {
    await mkdir(fixtureFolder, { recursive: true });
    await writeFile(fixtureFile, 'initial');
    app = createApp(serverRoot);
    app.set('env', 'production');
});

after(async () => {
    await rm(fixturePath, { recursive: true, force: true });
});

describe('server public HTTP API', () => {
    it('reads an existing file', async () => {
        const response = await request(app).get('/files').query({ path: filePath('sample.txt') });
        assert.deepEqual(response.body, { data: 'initial' });
    });

    it('rejects a file request without a path', async () => {
        const response = await request(app).get('/files');
        assert.deepEqual(response.body, { error: { message: "ERROR: invalid path ''" } });
    });

    it('reports an unknown file path', async () => {
        const path = filePath('missing.txt');
        const response = await request(app).get('/files').query({ path });
        assert.deepEqual(response.body, { error: { message: `ERROR: invalid path '${path}'` } });
    });

    it('forwards file read errors for directory paths', async () => {
        const response = await request(app).get('/files').query({ path: relativeFixturePath });
        assert.equal(response.status, 500);
    });

    it('rejects a write request without a path', async () => {
        const response = await request(app).post('/files').send({ data: 'ignored' });
        assert.deepEqual(response.body, { error: { message: "ERROR: invalid path ''" } });
    });

    it('writes the provided file contents', async () => {
        const response = await request(app)
            .post('/files')
            .query({ path: filePath('sample.txt') })
            .send({ data: 'updated' });
        assert.deepEqual(response.body, { data: 'OK' });
    });

    it('persists written file contents', async () => {
        const response = await request(app).get('/files').query({ path: filePath('sample.txt') });
        assert.deepEqual(response.body, { data: 'updated' });
    });

    it('defaults omitted write contents to an empty string', async () => {
        const response = await request(app)
            .post('/files')
            .query({ path: filePath('empty.txt') })
            .send({});
        assert.deepEqual(response.body, { data: 'OK' });
    });

    it('persists omitted write contents as an empty file', async () => {
        const response = await request(app).get('/files').query({ path: filePath('empty.txt') });
        assert.deepEqual(response.body, { data: '' });
    });

    it('reports asynchronous write errors for missing directories', async () => {
        const path = filePath('missing/file.txt');
        const response = await request(app)
            .post('/files')
            .query({ path })
            .send({ data: 'unwritten' });
        assert.deepEqual(response.body, { error: { message: `ERROR: invalid path '${path}'` } });
    });

    it('forwards write errors for directory paths', async () => {
        const response = await request(app)
            .post('/files')
            .query({ path: relativeFixturePath })
            .send({ data: 'unwritten' });
        assert.equal(response.status, 500);
    });

    it('lists the server root when no folder path is supplied', async () => {
        const response = await request(app).get('/folders');
        assert.equal(response.status, 200);
    });

    it('lists files and directories with their kinds', async () => {
        const response = await request(app).get('/folders').query({ path: relativeFixturePath });
        const entries = response.body.data.sort((left, right) => left.filename.localeCompare(right.filename));
        assert.deepEqual(entries, [
            { filename: 'empty.txt', isFolder: false },
            { filename: 'nested', isFolder: true },
            { filename: 'sample.txt', isFolder: false },
        ]);
    });

    it('rejects folder traversal paths', async () => {
        const response = await request(app).get('/folders').query({ path: '..' });
        assert.deepEqual(response.body, { error: { message: "ERROR: invalid path '..'" } });
    });

    it('reports unknown folder paths', async () => {
        const path = filePath('missing');
        const response = await request(app).get('/folders').query({ path });
        assert.deepEqual(response.body, { error: { message: `ERROR: invalid path '${path}'` } });
    });

    it('forwards folder read errors for file paths', async () => {
        const response = await request(app).get('/folders').query({ path: filePath('sample.txt') });
        assert.equal(response.status, 500);
    });

    it('starts the server and binds an ephemeral port', async () => {
        const server = await startServer(serverRoot, 0);
        const address = server.address();
        assert.ok(address && typeof address === 'object' && address.port > 0);
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    });

    it('rejects startup when the requested port is invalid', async () => {
        await assert.rejects(startServer(serverRoot, -1), { code: 'ERR_SOCKET_BAD_PORT' });
    });
});
