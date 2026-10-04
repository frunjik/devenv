import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const serverOrigin = 'http://127.0.0.1:5555';
const serverRoot = process.cwd();
const fixturePath = resolve(serverRoot, `.server-test-${process.pid}`);
const fixtureFile = join(fixturePath, 'sample.txt');
const fixtureFolder = join(fixturePath, 'nested');
const relativeFixturePath = relative(serverRoot, fixturePath).replaceAll('\\', '/');
let serverProcess;

async function sendRequest(path, options) {
    const response = await fetch(new URL(path, serverOrigin), options);
    return {
        status: response.status,
        body: response.status === 500 ? undefined : await response.json(),
    };
}

async function waitForServer() {
    const deadline = Date.now() + 5000;
    let lastError;

    while (Date.now() < deadline) {
        if (serverProcess.exitCode !== null) {
            throw new Error(`Server process exited with code ${serverProcess.exitCode}`);
        }

        try {
            const response = await fetch(`${serverOrigin}/folders?path=${encodeURIComponent(relativeFixturePath)}`);
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

function postOptions(data) {
    return {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
    };
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
    it('reads an existing file', async () => {
        assert.deepEqual(
            await sendRequest(`/files?path=${encodeURIComponent(`${relativeFixturePath}/sample.txt`)}`),
            { status: 200, body: { data: 'initial' } }
        );
    });

    it('rejects a file request without a path', async () => {
        assert.deepEqual(await sendRequest('/files'), {
            status: 400,
            body: { error: { message: "ERROR: invalid path ''" } },
        });
    });

    it('reports an unknown file path', async () => {
        const path = `${relativeFixturePath}/missing.txt`;
        assert.deepEqual(await sendRequest(`/files?path=${encodeURIComponent(path)}`), {
            status: 400,
            body: { error: { message: `ERROR: invalid path '${path}'` } },
        });
    });

    it('forwards file read errors for directory paths', async () => {
        assert.deepEqual(
            await sendRequest(`/files?path=${encodeURIComponent(relativeFixturePath)}`),
            { status: 500, body: undefined }
        );
    });

    it('rejects a write request without a path', async () => {
        assert.deepEqual(await sendRequest('/files', postOptions({ data: 'ignored' })), {
            status: 400,
            body: { error: { message: "ERROR: invalid path ''" } },
        });
    });

    it('writes the provided file contents', async () => {
        assert.deepEqual(
            await sendRequest(`/files?path=${encodeURIComponent(`${relativeFixturePath}/sample.txt`)}`, postOptions({ data: 'updated' })),
            { status: 200, body: { data: 'OK' } }
        );
    });

    it('persists written file contents', async () => {
        assert.deepEqual(
            await sendRequest(`/files?path=${encodeURIComponent(`${relativeFixturePath}/sample.txt`)}`),
            { status: 200, body: { data: 'updated' } }
        );
    });

    it('defaults omitted write contents to an empty string', async () => {
        assert.deepEqual(
            await sendRequest(`/files?path=${encodeURIComponent(`${relativeFixturePath}/empty.txt`)}`, postOptions({})),
            { status: 200, body: { data: 'OK' } }
        );
    });

    it('persists omitted write contents as an empty file', async () => {
        assert.deepEqual(
            await sendRequest(`/files?path=${encodeURIComponent(`${relativeFixturePath}/empty.txt`)}`),
            { status: 200, body: { data: '' } }
        );
    });

    it('reports asynchronous write errors for missing directories', async () => {
        const path = `${relativeFixturePath}/missing/file.txt`;
        assert.deepEqual(
            await sendRequest(`/files?path=${encodeURIComponent(path)}`, postOptions({ data: 'unwritten' })),
            { status: 400, body: { error: { message: `ERROR: invalid path '${path}'` } } }
        );
    });

    it('forwards write errors for directory paths', async () => {
        assert.deepEqual(
            await sendRequest(`/files?path=${encodeURIComponent(relativeFixturePath)}`, postOptions({ data: 'unwritten' })),
            { status: 500, body: undefined }
        );
    });

    it('lists the server root when no folder path is supplied', async () => {
        const response = await fetch(`${serverOrigin}/folders`);
        assert.equal(response.status, 200);
    });

    it('lists files and directories with their kinds', async () => {
        const entries = (await sendRequest(`/folders?path=${encodeURIComponent(relativeFixturePath)}`))
            .body.data
            .sort((left, right) => left.filename.localeCompare(right.filename));
        assert.deepEqual(entries, [
            { filename: 'empty.txt', isFolder: false },
            { filename: 'nested', isFolder: true },
            { filename: 'sample.txt', isFolder: false },
        ]);
    });

    it('rejects folder traversal paths', async () => {
        assert.deepEqual(await sendRequest('/folders?path=..'), {
            status: 400,
            body: { error: { message: "ERROR: invalid path '..'" } },
        });
    });

    it('reports unknown folder paths', async () => {
        const path = `${relativeFixturePath}/missing`;
        assert.deepEqual(await sendRequest(`/folders?path=${encodeURIComponent(path)}`), {
            status: 400,
            body: { error: { message: `ERROR: invalid path '${path}'` } },
        });
    });

    it('forwards folder read errors for file paths', async () => {
        assert.deepEqual(
            await sendRequest(`/folders?path=${encodeURIComponent(`${relativeFixturePath}/sample.txt`)}`),
            { status: 500, body: undefined }
        );
    });
});
