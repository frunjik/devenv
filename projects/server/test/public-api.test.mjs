import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { resolve, relative, join } from 'node:path';

const serverRoot = process.cwd();
const fixtureName = `.server-test-${process.pid}`;
const fixturePath = resolve(serverRoot, fixtureName);
const fixtureFile = join(fixturePath, 'sample.txt');
const fixtureFolder = join(fixturePath, 'nested');
const relativeFixturePath = relative(serverRoot, fixturePath).replaceAll('\\', '/');
const origin = 'http://127.0.0.1:3000';
let serverProcess;

async function request(path, options) {
    return fetch(new URL(path, origin), options);
}

async function waitForServer() {
    const deadline = Date.now() + 5000;
    let lastError;

    while (Date.now() < deadline) {
        try {
            const response = await request(`/folders?path=${encodeURIComponent(relativeFixturePath)}`);
            if (response.ok) {
                return;
            }
            lastError = new Error(`Server returned ${response.status} while starting`);
        } catch (error) {
            lastError = error;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    throw lastError ?? new Error('Server did not start');
}

before(async () => {
    await mkdir(fixtureFolder, { recursive: true });
    await writeFile(fixtureFile, 'initial');

    const bundle = resolve(serverRoot, 'dist/server/fesm2022/server.mjs');
    serverProcess = spawn(process.execPath, [bundle], { stdio: 'inherit', windowsHide: true });
    await waitForServer();
});

after(async () => {
    if (serverProcess && serverProcess.exitCode === null) {
        serverProcess.kill();
        await once(serverProcess, 'exit');
    }
    await rm(fixturePath, { recursive: true, force: true });
});

describe('server public HTTP API', () => {
    it('reads existing files and reports missing paths', async () => {
        const success = await request(`/files?path=${encodeURIComponent(`${relativeFixturePath}/sample.txt`)}`);
        assert.equal(success.status, 200);
        assert.deepEqual(await success.json(), { data: 'initial' });

        const missingPath = await request('/files');
        assert.equal(missingPath.status, 400);
        assert.deepEqual(await missingPath.json(), {
            error: { message: "ERROR: invalid path ''" },
        });

        const missingFile = await request(`/files?path=${encodeURIComponent(`${relativeFixturePath}/missing.txt`)}`);
        assert.equal(missingFile.status, 400);
        assert.deepEqual(await missingFile.json(), {
            error: { message: `ERROR: invalid path '${relativeFixturePath}/missing.txt'` },
        });

        const directory = await request(`/files?path=${encodeURIComponent(relativeFixturePath)}`);
        assert.equal(directory.status, 500);
    });

    it('writes files and defaults missing content to an empty string', async () => {
        const missingPath = await request('/files', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ data: 'ignored' }),
        });
        assert.equal(missingPath.status, 400);
        assert.deepEqual(await missingPath.json(), {
            error: { message: "ERROR: invalid path ''" },
        });

        const missingDirectory = await request(`/files?path=${encodeURIComponent(`${relativeFixturePath}/missing/file.txt`)}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ data: 'unwritten' }),
        });
        assert.equal(missingDirectory.status, 400);
        assert.deepEqual(await missingDirectory.json(), {
            error: { message: `ERROR: invalid path '${relativeFixturePath}/missing/file.txt'` },
        });

        const write = await request(`/files?path=${encodeURIComponent(`${relativeFixturePath}/sample.txt`)}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ data: 'updated' }),
        });
        assert.equal(write.status, 200);
        assert.deepEqual(await write.json(), { data: 'OK' });
        assert.equal(await readFile(fixtureFile, 'utf8'), 'updated');

        const emptyWrite = await request(`/files?path=${encodeURIComponent(`${relativeFixturePath}/empty.txt`)}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({}),
        });
        assert.equal(emptyWrite.status, 200);
        assert.deepEqual(await emptyWrite.json(), { data: 'OK' });

        const emptyFile = join(fixturePath, 'empty.txt');
        const deadline = Date.now() + 1000;
        while (Date.now() < deadline) {
            try {
                assert.equal(await readFile(emptyFile, 'utf8'), '');
                return;
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, 10));
            }
        }
        assert.fail('Empty file was not written');
    });

    it('lists folders and rejects invalid or unreadable paths', async () => {
        const rootListing = await request('/folders');
        assert.equal(rootListing.status, 200);
        assert.ok(Array.isArray((await rootListing.json()).data));

        const listing = await request(`/folders?path=${encodeURIComponent(relativeFixturePath)}`);
        assert.equal(listing.status, 200);
        const entries = (await listing.json()).data
            .sort((left, right) => left.filename.localeCompare(right.filename));
        assert.deepEqual(entries, [
            { filename: 'empty.txt', isFolder: false },
            { filename: 'nested', isFolder: true },
            { filename: 'sample.txt', isFolder: false },
        ]);

        const invalidPath = await request('/folders?path=..');
        assert.equal(invalidPath.status, 400);
        assert.deepEqual(await invalidPath.json(), {
            error: { message: "ERROR: invalid path '..'" },
        });

        const missingFolder = await request(`/folders?path=${encodeURIComponent(`${relativeFixturePath}/missing`)}`);
        assert.equal(missingFolder.status, 400);
        assert.deepEqual(await missingFolder.json(), {
            error: { message: `ERROR: invalid path '${relativeFixturePath}/missing'` },
        });

        const notAFolder = await request(`/folders?path=${encodeURIComponent(`${relativeFixturePath}/sample.txt`)}`);
        assert.equal(notAFolder.status, 500);
    });
});
