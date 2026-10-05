const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { mkdir, rename, writeFile } = require('node:fs/promises');
const { join } = require('node:path');

const cacheDirectory = join(process.cwd(), 'test-run-cache');
const cacheFile = join(cacheDirectory, 'last-test-run.json');

function runScript(scriptName, result) {
    return new Promise(resolve => {
        const child = spawn(
            process.execPath,
            [process.env.npm_execpath, 'run', scriptName],
            { cwd: process.cwd(), windowsHide: true },
        );

        child.stdout.on('data', chunk => {
            const text = chunk.toString();
            result.stdout += text;
            process.stdout.write(chunk);
        });
        child.stderr.on('data', chunk => {
            const text = chunk.toString();
            result.stderr += text;
            process.stderr.write(chunk);
        });
        child.once('error', error => resolve({ exitCode: null, error: error.message }));
        child.once('close', code => resolve({ exitCode: code ?? 1, error: null }));
    });
}

async function cacheResult(result) {
    const temporaryFile = join(cacheDirectory, `last-test-run-${process.pid}-${randomUUID()}.tmp`);
    await mkdir(cacheDirectory, { recursive: true });
    await writeFile(temporaryFile, JSON.stringify(result), 'utf8');
    await rename(temporaryFile, cacheFile);
}

async function main() {
    if (!process.env.npm_execpath) {
        throw new Error('Run test coverage with npm run test:all:coverage');
    }

    const result = {
        startedAt: new Date().toISOString(),
        finishedAt: '',
        exitCode: null,
        stdout: '',
        stderr: '',
        error: null,
    };

    try {
        let outcome = await runScript('test:client:coverage', result);
        if (outcome.exitCode === 0) {
            outcome = await runScript('test:server:coverage', result);
        }
        result.exitCode = outcome.exitCode;
        result.error = outcome.error;
    } finally {
        result.finishedAt = new Date().toISOString();
        await cacheResult(result);
    }

    process.exitCode = result.exitCode ?? 1;
}

main().catch(error => {
    process.stderr.write(`Unable to run or cache test coverage: ${error.message}\n`);
    process.exitCode = 1;
});
