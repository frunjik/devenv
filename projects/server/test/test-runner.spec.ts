import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import type { ErrorRequestHandler } from 'express';
import { requestApp } from './support/request-app';
import { createApp, type TestCommandEvent, type TestCommandExecutor } from '../src/public-api';
import { forwardTestProcessOutput } from '../src/lib/handlers/test-runner';

describe('test runner public API', () => {
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

    it('streams output from the fixed test script', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = 'npm-cli.js';
        let observedCommand = '';
        let observedArgs: string[] = [];
        const execute: TestCommandExecutor = (command, args, _options, emit) => {
            observedCommand = command;
            observedArgs = args;
            emit({ type: 'stdout', data: 'client and server tests passed' });
            emit({ type: 'complete', exitCode: 0 });
            emit({ type: 'complete', exitCode: 0 });
        };
        const testApp = createApp(root, { testCommandExecutor: execute });
        testApp.use(handleError);

        try {
            const response = await requestApp(testApp).post('/tests/run');
            expect(response.headers['content-type']).toContain('application/x-ndjson');
            expect(response.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'stdout', data: 'client and server tests passed' },
                { type: 'complete', exitCode: 0 },
            ]);
            expect(observedCommand).toBe(process.execPath);
            expect(observedArgs).toEqual(['npm-cli.js', 'run', 'test:all:coverage']);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('caches and returns the latest test run from the configured temp data directory', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const originalNpmExecPath = process.env['npm_execpath'];
        const cacheDirectory = join(root, 'custom-test-data');
        process.env['NODE_ENV'] = 'test';
        process.env['npm_execpath'] = 'npm-cli.js';
        const execute: TestCommandExecutor = (_command, _args, _options, emit) => {
            emit({ type: 'stdout', data: 'tests passed' });
            emit({ type: 'stderr', data: 'coverage summary' });
            emit({ type: 'complete', exitCode: 0 });
        };

        try {
            const testApp = createApp(root, {
                testCommandExecutor: execute,
                testRunCacheDirectory: cacheDirectory,
            });
            const runResponse = await requestApp(testApp).post('/tests/run');
            expect(runResponse.status).toBe(200);
            expect(runResponse.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'stdout', data: 'tests passed' },
                { type: 'stderr', data: 'coverage summary' },
                { type: 'complete', exitCode: 0 },
            ]);

            const cachedResponse = await requestApp(testApp).get('/tests/last');
            expect(cachedResponse.status).toBe(200);
            expect(cachedResponse.body.data).toMatchObject({
                exitCode: 0,
                stdout: 'tests passed',
                stderr: 'coverage summary',
                error: null,
            });
            expect(Date.parse(cachedResponse.body.data.startedAt)).not.toBeNaN();
            expect(Date.parse(cachedResponse.body.data.finishedAt)).not.toBeNaN();

            const cachedFile = await readFile(join(cacheDirectory, 'last-test-run.json'), 'utf8');
            expect(JSON.parse(cachedFile)).toEqual(cachedResponse.body.data);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns null when no test run has been cached', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const cacheDirectory = join(root, 'empty-test-data');
        process.env['NODE_ENV'] = 'test';

        try {
            const response = await requestApp(createApp(root, { testRunCacheDirectory: cacheDirectory }))
                .get('/tests/last');
            expect(response.body).toEqual({ data: null });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports an empty test-run cache', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const cacheDirectory = join(root, 'empty-cache-status');
        process.env['NODE_ENV'] = 'test';

        try {
            const response = await requestApp(createApp(root, { testRunCacheDirectory: cacheDirectory }))
                .get('/tests/cache/status');
            expect(response.body).toEqual({
                data: {
                    available: false,
                    status: 'empty',
                    startedAt: null,
                    finishedAt: null,
                    exitCode: null,
                },
            });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports a passed cached test run', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const cacheDirectory = join(root, 'passed-cache-status');
        process.env['NODE_ENV'] = 'test';
        await mkdir(cacheDirectory);
        await writeFile(join(cacheDirectory, 'last-test-run.json'), JSON.stringify({
            startedAt: '2026-10-04T12:00:00.000Z',
            finishedAt: '2026-10-04T12:01:00.000Z',
            exitCode: 0,
            stdout: 'passed',
            stderr: '',
            error: null,
        }));

        try {
            const response = await requestApp(createApp(root, { testRunCacheDirectory: cacheDirectory }))
                .get('/tests/cache/status');
            expect(response.body).toEqual({
                data: {
                    available: true,
                    status: 'passed',
                    startedAt: '2026-10-04T12:00:00.000Z',
                    finishedAt: '2026-10-04T12:01:00.000Z',
                    exitCode: 0,
                },
            });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports a failed cached test run', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const cacheDirectory = join(root, 'failed-cache-status');
        process.env['NODE_ENV'] = 'test';
        await mkdir(cacheDirectory);
        await writeFile(join(cacheDirectory, 'last-test-run.json'), JSON.stringify({
            startedAt: '2026-10-04T12:00:00.000Z',
            finishedAt: '2026-10-04T12:01:00.000Z',
            exitCode: 1,
            stdout: '',
            stderr: 'test failure',
            error: null,
        }));

        try {
            const testApp = createApp(root, { testRunCacheDirectory: cacheDirectory });
            const response = await requestApp(testApp).get('/tests/cache/status');
            expect(response.body.data).toMatchObject({ available: true, status: 'failed', exitCode: 1 });
            const lastRun = await requestApp(testApp).get('/tests/last');
            expect(lastRun.body.data).toMatchObject({
                exitCode: 1,
                stdout: '',
                stderr: 'test failure',
                error: null,
            });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports a cached test-run process error', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const cacheDirectory = join(root, 'error-cache-status');
        process.env['NODE_ENV'] = 'test';
        await mkdir(cacheDirectory);
        await writeFile(join(cacheDirectory, 'last-test-run.json'), JSON.stringify({
            startedAt: '2026-10-04T12:00:00.000Z',
            finishedAt: '2026-10-04T12:00:01.000Z',
            exitCode: null,
            stdout: '',
            stderr: '',
            error: 'Could not launch tests',
        }));

        try {
            const response = await requestApp(createApp(root, { testRunCacheDirectory: cacheDirectory }))
                .get('/tests/cache/status');
            expect(response.body.data).toMatchObject({ available: true, status: 'error', exitCode: null });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports invalid cached test-run data as a server error', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const cacheDirectory = join(root, 'invalid-cache-status');
        process.env['NODE_ENV'] = 'test';
        await mkdir(cacheDirectory);
        await writeFile(join(cacheDirectory, 'last-test-run.json'), '{invalid json');

        try {
            const testApp = createApp(root, { testRunCacheDirectory: cacheDirectory });
            testApp.use(handleError);
            const response = await requestApp(testApp).get('/tests/cache/status');
            expect(response.status).toBe(500);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('stores only the first terminal event from a test run', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['NODE_ENV'] = 'test';
        process.env['npm_execpath'] = 'npm-cli.js';
        const cacheDirectory = join(root, 'single-terminal-event');
        const execute: TestCommandExecutor = (_command, _args, _options, emit) => {
            emit({ type: 'complete', exitCode: 0 });
            throw new Error('executor emitted completion before throwing');
        };

        try {
            const response = await requestApp(createApp(root, {
                testCommandExecutor: execute,
                testRunCacheDirectory: cacheDirectory,
            }))
                .post('/tests/run');
            expect(response.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'complete', exitCode: 0 },
            ]);
            const cachedRun = JSON.parse(await readFile(join(cacheDirectory, 'last-test-run.json'), 'utf8'));
            expect(cachedRun.exitCode).toBe(0);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports cache write and retrieval failures', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['NODE_ENV'] = 'test';
        process.env['npm_execpath'] = 'npm-cli.js';
        const cacheDirectory = join(root, 'not-a-directory');
        await writeFile(cacheDirectory, 'block directory creation');
        const execute: TestCommandExecutor = (_command, _args, _options, emit) => {
            emit({ type: 'complete', exitCode: 0 });
        };

        try {
            const testApp = createApp(root, {
                testCommandExecutor: execute,
                testRunCacheDirectory: cacheDirectory,
            });
            testApp.use(handleError);
            const runResponse = await requestApp(testApp).post('/tests/run');
            expect(runResponse.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'complete', exitCode: 0 },
                expect.objectContaining({
                    type: 'error',
                    message: expect.stringContaining('could not be cached'),
                }),
            ]);

            const corruptCacheDirectory = join(root, 'corrupt-test-data');
            await mkdir(corruptCacheDirectory);
            await writeFile(join(corruptCacheDirectory, 'last-test-run.json'), '{invalid json');
            const corruptCacheApp = createApp(root, { testRunCacheDirectory: corruptCacheDirectory });
            corruptCacheApp.use(handleError);
            const cachedResponse = await requestApp(corruptCacheApp).get('/tests/last');
            expect(cachedResponse.status).toBe(500);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('streams output from the child process', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        const npmCliPath = join(root, 'fake-npm.js');
        await writeFile(npmCliPath, "process.stdout.write('captured stdout'); process.stderr.write('captured stderr');");
        process.env['npm_execpath'] = npmCliPath;

        try {
            const testApp = createApp(root);
            const response = await requestApp(testApp).post('/tests/run');
            expect(response.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'stdout', data: 'captured stdout' },
                { type: 'stderr', data: 'captured stderr' },
                { type: 'complete', exitCode: 0 },
            ]);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('streams child process launch errors', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = join(root, 'missing-npm.js');

        try {
            const testApp = createApp(root);
            const response = await requestApp(testApp).post('/tests/run');
            const events = response.text.split('\n').filter(Boolean).map(line => JSON.parse(line));
            const stderr = events
                .filter((event): event is { type: 'stderr'; data: string } => event.type === 'stderr')
                .map(event => event.data)
                .join('');
            expect(stderr).toContain('MODULE_NOT_FOUND');
            expect(stderr).toContain('missing-npm.js');
            expect(events.at(-1)).toEqual({ type: 'complete', exitCode: 1 });
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('reports the exit code of a child process that fails', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        const npmCliPath = join(root, 'failing-npm.js');
        await writeFile(npmCliPath, "process.stdout.write('test failure'); process.exitCode = 2;");
        process.env['npm_execpath'] = npmCliPath;

        try {
            const testApp = createApp(root);
            const response = await requestApp(testApp).post('/tests/run');
            expect(response.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'stdout', data: 'test failure' },
                { type: 'complete', exitCode: 2 },
            ]);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('streams child process spawn errors', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        const originalExecPath = process.execPath;
        process.env['npm_execpath'] = 'npm-cli.js';
        process.execPath = join(root, 'missing-node.exe');

        try {
            const testApp = createApp(root);
            const response = await requestApp(testApp).post('/tests/run');
            const events = response.text.split('\n').filter(Boolean).map(line => JSON.parse(line));
            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({ type: 'error' });
            expect(events[0].message).toContain('missing-node.exe');
        } finally {
            process.execPath = originalExecPath;
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('reports a nonzero exit code when the child exits from a signal', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        const npmCliPath = join(root, 'signaled-npm.js');
        await writeFile(npmCliPath, "process.kill(process.pid, 'SIGTERM');");
        process.env['npm_execpath'] = npmCliPath;

        try {
            const testApp = createApp(root);
            const response = await requestApp(testApp).post('/tests/run');
            expect(response.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'complete', exitCode: 1 },
            ]);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('uses a failure exit code when the child closes without an exit code', () => {
        const child = Object.assign(new EventEmitter(), {
            stdout: new PassThrough(),
            stderr: new PassThrough(),
        });
        const events: TestCommandEvent[] = [];
        forwardTestProcessOutput(child, event => events.push(event));

        child.emit('close', null);

        expect(events).toEqual([{ type: 'complete', exitCode: 1 }]);
    });

    it('streams output and the exit code when tests fail', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = 'npm-cli.js';
        const execute: TestCommandExecutor = (_command, _args, _options, emit) => {
            emit({ type: 'stdout', data: 'test output' });
            emit({ type: 'stderr', data: 'failure details' });
            emit({ type: 'complete', exitCode: 2 });
        };
        const testApp = createApp(root, { testCommandExecutor: execute });
        testApp.use(handleError);

        try {
            const response = await requestApp(testApp).post('/tests/run');
            expect(response.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'stdout', data: 'test output' },
                { type: 'stderr', data: 'failure details' },
                { type: 'complete', exitCode: 2 },
            ]);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('streams test process launch failures', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = 'npm-cli.js';
        const execute: TestCommandExecutor = (_command, _args, _options, emit) => {
            emit({ type: 'error', message: 'npm could not start' });
        };
        const testApp = createApp(root, { testCommandExecutor: execute });
        testApp.use(handleError);

        try {
            const response = await requestApp(testApp).post('/tests/run');
            expect(response.status).toBe(200);
            expect(response.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'error', message: 'npm could not start' },
            ]);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('rejects test execution when the server is running in production mode', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const productionApp = createApp(root);
            const response = await requestApp(productionApp).post('/tests/run');
            expect(response.status).toBe(404);
            const cachedResponse = await requestApp(productionApp).get('/tests/last');
            expect(cachedResponse.status).toBe(404);
            const cacheStatusResponse = await requestApp(productionApp).get('/tests/cache/status');
            expect(cacheStatusResponse.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('rejects test execution if the development server was not started by npm', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        delete process.env['npm_execpath'];

        try {
            const testApp = createApp(root);
            testApp.use(handleError);
            const response = await requestApp(testApp).post('/tests/run');
            expect(response.status).toBe(500);
        } finally {
            if (originalNpmExecPath !== undefined) {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('rejects concurrent test runs while one is in progress', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = 'npm-cli.js';
        let finishRun: ((event: TestCommandEvent) => void) | undefined;
        let markRunStarted: (() => void) | undefined;
        const runStarted = new Promise<void>((resolve) => {
            markRunStarted = resolve;
        });
        const execute: TestCommandExecutor = (_command, _args, _options, emit) => {
            finishRun = emit;
            markRunStarted?.();
        };
        const testApp = createApp(root, { testCommandExecutor: execute });
        testApp.use(handleError);
        let firstStatus: number | undefined;
        let firstRequest = Promise.resolve();

        try {
            firstRequest = requestApp(testApp).post('/tests/run').then((response) => {
                firstStatus = response.status;
            });
            await runStarted;
            const secondRequest = requestApp(testApp).post('/tests/run');
            const secondResponse = await secondRequest;
            expect(secondResponse.status).toBe(409);
        } finally {
            finishRun?.({ type: 'complete', exitCode: 0 });
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }

        await firstRequest;
        expect(firstStatus).toBe(200);
    });

    it('streams a process error thrown by the executor', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = 'npm-cli.js';
        const execute: TestCommandExecutor = () => {
            throw new Error('process could not start');
        };
        const testApp = createApp(root, { testCommandExecutor: execute });

        try {
            const response = await requestApp(testApp).post('/tests/run');
            expect(response.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'error', message: 'process could not start' },
            ]);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('reports a fallback message when the executor throws a non-error value', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = 'npm-cli.js';
        const execute: TestCommandExecutor = () => {
            throw 'process could not start';
        };
        const testApp = createApp(root, { testCommandExecutor: execute });

        try {
            const response = await requestApp(testApp).post('/tests/run');
            expect(response.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'error', message: 'Unable to start test process' },
            ]);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });
});
