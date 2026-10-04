import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { execFileSync } from 'node:child_process';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import {
    createApp,
    startServer,
    type AuthenticationService,
    type ServerListener,
    type TestCommandEvent,
    type TestCommandExecutor,
} from '../src/public-api';
import { forwardTestProcessOutput } from '../src/lib/handlers/test-runner';
import { createGitCommitHandler } from '../src/lib/handlers/git-commit';
import { createGitLogHandler } from '../src/lib/handlers/git-log';
import { createGitStatusHandler } from '../src/lib/handlers/git-status';

describe('server public HTTP API', () => {
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

    it('allows unauthenticated requests with the development authentication service', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        try {
            const developmentApp = createApp(root);
            const response = await request(developmentApp).get('/files').query({ path: 'sample.txt' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ data: 'initial' });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('allows requests authenticated by a configured service', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';
        const authenticationService: AuthenticationService = {
            async authenticate(request) {
                return request.get('Authorization') === 'Bearer valid-token'
                    ? { id: 'test-user' }
                    : null;
            },
        };

        try {
            const authenticatedApp = createApp(root, undefined, process.cwd(), undefined, authenticationService);
            const response = await request(authenticatedApp)
                .get('/files')
                .set('Authorization', 'Bearer valid-token')
                .query({ path: 'sample.txt' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ data: 'initial' });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('rejects requests when a configured authentication service returns no principal', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';
        const authenticationService: AuthenticationService = {
            async authenticate() {
                return null;
            },
        };

        try {
            const authenticatedApp = createApp(root, undefined, process.cwd(), undefined, authenticationService);
            const response = await request(authenticatedApp).get('/files').query({ path: 'sample.txt' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: { message: 'Authentication required' } });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('forwards authentication service errors to Express error handlers', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';
        const authenticationService: AuthenticationService = {
            async authenticate() {
                throw new Error('Identity provider unavailable');
            },
        };

        try {
            const authenticatedApp = createApp(root, undefined, process.cwd(), undefined, authenticationService);
            authenticatedApp.use((_error, _request, response, _next) => response.status(503).end());
            const response = await request(authenticatedApp).get('/files').query({ path: 'sample.txt' });

            expect(response.status).toBe(503);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('leaves production requests open until an authentication service is configured', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const productionApp = createApp(root);
            const response = await request(productionApp).get('/files').query({ path: 'sample.txt' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ data: 'initial' });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
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
        const testApp = createApp(root, execute);
        testApp.use(handleError);

        try {
            const response = await request(testApp).post('/tests/run');
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
            const testApp = createApp(root, execute, process.cwd(), cacheDirectory);
            const runResponse = await request(testApp).post('/tests/run');
            expect(runResponse.status).toBe(200);
            expect(runResponse.text.split('\n').filter(Boolean).map(line => JSON.parse(line))).toEqual([
                { type: 'stdout', data: 'tests passed' },
                { type: 'stderr', data: 'coverage summary' },
                { type: 'complete', exitCode: 0 },
            ]);

            const cachedResponse = await request(testApp).get('/tests/last');
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
            const response = await request(createApp(root, undefined, process.cwd(), cacheDirectory))
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
            const response = await request(createApp(root, undefined, process.cwd(), cacheDirectory))
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
            const response = await request(createApp(root, undefined, process.cwd(), cacheDirectory))
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
            const response = await request(createApp(root, undefined, process.cwd(), cacheDirectory))
                .get('/tests/cache/status');
            expect(response.body.data).toMatchObject({ available: true, status: 'failed', exitCode: 1 });
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
            const response = await request(createApp(root, undefined, process.cwd(), cacheDirectory))
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
            const testApp = createApp(root, undefined, process.cwd(), cacheDirectory);
            testApp.use(handleError);
            const response = await request(testApp).get('/tests/cache/status');
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
            const response = await request(createApp(root, execute, process.cwd(), cacheDirectory))
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
            const testApp = createApp(root, execute, process.cwd(), cacheDirectory);
            testApp.use(handleError);
            const runResponse = await request(testApp).post('/tests/run');
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
            const corruptCacheApp = createApp(root, undefined, process.cwd(), corruptCacheDirectory);
            corruptCacheApp.use(handleError);
            const cachedResponse = await request(corruptCacheApp).get('/tests/last');
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
            const response = await request(testApp).post('/tests/run');
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
            const response = await request(testApp).post('/tests/run');
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
            const response = await request(testApp).post('/tests/run');
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
            const response = await request(testApp).post('/tests/run');
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
            const response = await request(testApp).post('/tests/run');
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
        const testApp = createApp(root, execute);
        testApp.use(handleError);

        try {
            const response = await request(testApp).post('/tests/run');
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
        const testApp = createApp(root, execute);
        testApp.use(handleError);

        try {
            const response = await request(testApp).post('/tests/run');
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
            const response = await request(productionApp).post('/tests/run');
            expect(response.status).toBe(404);
            const cachedResponse = await request(productionApp).get('/tests/last');
            expect(cachedResponse.status).toBe(404);
            const cacheStatusResponse = await request(productionApp).get('/tests/cache/status');
            expect(cacheStatusResponse.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('commits all worktree changes with the supplied message', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'git-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', gitRoot]);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'initial');
        execFileSync('git', ['-C', gitRoot, 'add', '--all']);
        execFileSync('git', ['-C', gitRoot, 'commit', '-m', 'initial']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'updated');
        await writeFile(join(gitRoot, 'untracked.txt'), 'new file');
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, gitRoot);
            const response = await request(gitApp)
                .post('/git/commit')
                .send({ message: 'Commit all worktree changes' });
            expect(response.status).toBe(200);
            expect(response.body.data.stdout).toContain('Commit all worktree changes');
            expect(execFileSync('git', ['-C', gitRoot, 'show', '--format=%s', '--no-patch'], { encoding: 'utf8' }).trim())
                .toBe('Commit all worktree changes');
            expect(execFileSync('git', ['-C', gitRoot, 'status', '--porcelain'], { encoding: 'utf8' }).trim()).toBe('');
            expect(execFileSync('git', ['-C', gitRoot, 'show', 'HEAD:untracked.txt'], { encoding: 'utf8' }))
                .toBe('new file');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('defaults the commit route working directory to the current directory', () => {
        expect(createGitCommitHandler()).toBeDefined();
    });

    it('requires a valid commit message', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root);
            const response = await request(gitApp).post('/git/commit').send({ message: '  ' });
            expect(response.status).toBe(400);
            expect(response.body.error.message).toContain('commit message');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('rejects a non-string commit message', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root);
            const response = await request(gitApp).post('/git/commit').send({ message: 123 });
            expect(response.status).toBe(400);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('rejects commit messages longer than 5000 characters', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root);
            const response = await request(gitApp).post('/git/commit').send({ message: 'x'.repeat(5001) });
            expect(response.status).toBe(400);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports git commit failures with captured output', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        execFileSync('git', ['init', root]);
        execFileSync('git', ['-C', root, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', root, 'config', 'user.email', 'test@example.com']);
        execFileSync('git', ['-C', root, 'add', '--all']);
        execFileSync('git', ['-C', root, 'commit', '-m', 'initial']);
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, root);
            const response = await request(gitApp)
                .post('/git/commit')
                .send({ message: 'Nothing to commit' });
            expect(response.status).toBe(500);
            expect(`${response.body.error.stdout}${response.body.error.stderr}`).toContain('nothing to commit');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('rejects concurrent git commit requests', async () => {
        let markCommitStarted: (() => void) | undefined;
        let finishCommit: (() => void) | undefined;
        const commitStarted = new Promise<void>(resolve => markCommitStarted = resolve);
        const app = express();
        app.use(express.json());
        app.post('/git/commit', createGitCommitHandler(root, async args => {
            if (args[0] === 'add') {
                return { stdout: '', stderr: '' };
            }
            markCommitStarted?.();
            return new Promise(resolve => {
                finishCommit = () => resolve({ stdout: 'committed', stderr: '' });
            });
        }));
        let firstStatus: number | undefined;
        const firstRequest = request(app).post('/git/commit').send({ message: 'first' })
            .then(response => firstStatus = response.status);

        try {
            await commitStarted;
            const secondResponse = await request(app).post('/git/commit').send({ message: 'second' });
            expect(secondResponse.status).toBe(409);
        } finally {
            finishCommit?.();
        }

        await firstRequest;
        expect(firstStatus).toBe(200);
    });

    it('does not register the commit route in production', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const productionApp = createApp(root);
            const response = await request(productionApp).post('/git/commit').send({ message: 'not committed' });
            expect(response.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns recent commit details from the git log', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'git-log-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', gitRoot]);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(gitRoot, 'log.txt'), 'initial');
        execFileSync('git', ['-C', gitRoot, 'add', '--all']);
        execFileSync('git', ['-C', gitRoot, 'commit', '-m', 'Initial commit']);
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, gitRoot);
            const response = await request(gitApp).get('/git/log');
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0]).toMatchObject({
                hash: expect.stringMatching(/^[0-9a-f]{40}$/),
                author: 'Test User',
                subject: 'Initial commit',
            });
            expect(response.body.data[0].date).toEqual(expect.any(String));
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns an empty list when the git repository has no commits', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'empty-git-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', gitRoot]);
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, gitRoot);
            const response = await request(gitApp).get('/git/log');
            expect(response.body).toEqual({ data: [] });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns git errors when the working directory is not a repository', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, root);
            const response = await request(gitApp).get('/git/log');
            expect(response.status).toBe(500);
            expect(response.body.error.stderr).toContain('not a git repository');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports malformed git log output', async () => {
        const gitApp = express();
        gitApp.get('/git/log', createGitLogHandler(root, async () => ({
            stdout: 'incomplete\x1fcommit',
            stderr: '',
        })));
        gitApp.use(handleError);

        const response = await request(gitApp).get('/git/log');

        expect(response.status).toBe(500);
        expect(response.body.error.message).toBe('Git returned an invalid log result');
    });

    it('does not register the git log route in production', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const productionApp = createApp(root);
            const response = await request(productionApp).get('/git/log');
            expect(response.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns the current branch and open worktree changes', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'git-status-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', '-b', 'main', gitRoot]);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'initial');
        execFileSync('git', ['-C', gitRoot, 'add', '--all']);
        execFileSync('git', ['-C', gitRoot, 'commit', '-m', 'Initial commit']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'updated');
        await writeFile(join(gitRoot, 'untracked.txt'), 'new file');
        await writeFile(join(gitRoot, 'staged.txt'), 'staged change');
        execFileSync('git', ['-C', gitRoot, 'add', 'staged.txt']);
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, gitRoot);
            const response = await request(gitApp).get('/git/status');

            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({
                branch: 'main',
                ahead: 0,
                behind: 0,
                clean: false,
            });
            expect(response.body.data.files).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    path: 'tracked.txt',
                    indexStatus: ' ',
                    workTreeStatus: 'M',
                    staged: false,
                    unstaged: true,
                    untracked: false,
                    conflicted: false,
                }),
                expect.objectContaining({
                    path: 'untracked.txt',
                    indexStatus: '?',
                    workTreeStatus: '?',
                    staged: false,
                    unstaged: true,
                    untracked: true,
                    conflicted: false,
                }),
                expect.objectContaining({
                    path: 'staged.txt',
                    indexStatus: 'A',
                    workTreeStatus: ' ',
                    staged: true,
                    unstaged: false,
                    untracked: false,
                    conflicted: false,
                }),
            ]));
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns an empty and clean status for a clean repository', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'clean-git-status-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', gitRoot]);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'initial');
        execFileSync('git', ['-C', gitRoot, 'add', '--all']);
        execFileSync('git', ['-C', gitRoot, 'commit', '-m', 'Initial commit']);
        process.env['NODE_ENV'] = 'test';

        try {
            const response = await request(createApp(root, undefined, gitRoot)).get('/git/status');
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual({
                branch: expect.any(String),
                ahead: 0,
                behind: 0,
                clean: true,
                files: [],
            });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports git status errors when the working directory is not a repository', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const response = await request(createApp(root, undefined, root)).get('/git/status');
            expect(response.status).toBe(500);
            expect(response.body.error.stderr).toContain('not a git repository');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports malformed git status output', async () => {
        const gitApp = express();
        gitApp.get('/git/status', createGitStatusHandler(root, async () => ({
            stdout: 'malformed',
            stderr: '',
        })));
        gitApp.use(handleError);

        const response = await request(gitApp).get('/git/status');

        expect(response.status).toBe(500);
        expect(response.body.error.message).toBe('Git returned an invalid status result');
    });

    it('parses branch tracking and all Git status categories', async () => {
        const gitApp = express();
        gitApp.get('/git/status', createGitStatusHandler(root, async () => ({
            stdout: [
                '## feature...origin/feature [ahead 2, behind 3]',
                'M  staged.txt',
                ' M unstaged.txt',
                '?? untracked.txt',
                'R  renamed-staged.txt',
                'staged-source.txt',
                ' R renamed-unstaged.txt',
                'unstaged-source.txt',
                'C  copied-staged.txt',
                'copied-source.txt',
                ' C copied-unstaged.txt',
                'copied-unstaged-source.txt',
                'UU conflicted.txt',
                'AA added-conflict.txt',
                'DD deleted-conflict.txt',
            ].join('\0') + '\0',
            stderr: '',
        })));

        const response = await request(gitApp).get('/git/status');

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            branch: 'feature',
            ahead: 2,
            behind: 3,
            clean: false,
        });
        expect(response.body.data.files).toEqual(expect.arrayContaining([
            expect.objectContaining({ path: 'renamed-staged.txt', originalPath: 'staged-source.txt' }),
            expect.objectContaining({ path: 'renamed-unstaged.txt', originalPath: 'unstaged-source.txt' }),
            expect.objectContaining({ path: 'copied-staged.txt', originalPath: 'copied-source.txt' }),
            expect.objectContaining({ path: 'copied-unstaged.txt', originalPath: 'copied-unstaged-source.txt' }),
            expect.objectContaining({ path: 'conflicted.txt', conflicted: true }),
            expect.objectContaining({ path: 'added-conflict.txt', conflicted: true }),
            expect.objectContaining({ path: 'deleted-conflict.txt', conflicted: true }),
        ]));
    });

    it('parses status without branch metadata and branch summary variants', async () => {
        const outputs = [
            { stdout: '', branch: null, ahead: 0, behind: 0 },
            { stdout: '## ', branch: null, ahead: 0, behind: 0 },
            { stdout: '## main', branch: 'main', ahead: 0, behind: 0 },
            { stdout: '## main...origin/main [ahead 1]', branch: 'main', ahead: 1, behind: 0 },
            { stdout: '## main...origin/main [behind 2]', branch: 'main', ahead: 0, behind: 2 },
            { stdout: '## No commits yet on new-branch', branch: 'new-branch', ahead: 0, behind: 0 },
            { stdout: '## HEAD (no branch)', branch: null, ahead: 0, behind: 0 },
        ];

        for (const { stdout, branch, ahead, behind } of outputs) {
            const gitApp = express();
            gitApp.get('/git/status', createGitStatusHandler(root, async () => ({ stdout, stderr: '' })));
            const response = await request(gitApp).get('/git/status');

            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({ branch, ahead, behind });
        }
    });

    it('rejects malformed Git status records and missing rename paths', async () => {
        for (const stdout of ['x\0', 'malformed', 'R  renamed.txt\0']) {
            const gitApp = express();
            gitApp.get('/git/status', createGitStatusHandler(root, async () => ({ stdout, stderr: '' })));
            gitApp.use(handleError);

            const response = await request(gitApp).get('/git/status');

            expect(response.status).toBe(500);
            expect(response.body.error.message).toBe('Git returned an invalid status result');
        }
    });

    it('returns Git execution errors from the status endpoint', async () => {
        const gitApp = express();
        gitApp.get('/git/status', createGitStatusHandler(root, async () => {
            throw Object.assign(new Error('git status failed'), { stdout: 'out', stderr: 'err' });
        }));

        const response = await request(gitApp).get('/git/status');

        expect(response.status).toBe(500);
        expect(response.body.error).toEqual({
            message: 'git status failed',
            stdout: 'out',
            stderr: 'err',
        });
    });

    it('does not register the git status route in production', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const response = await request(createApp(root)).get('/git/status');
            expect(response.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('defaults the git status route working directory to the current directory', () => {
        expect(createGitStatusHandler()).toBeDefined();
    });

    it('defaults the git log route working directory to the current directory', () => {
        expect(createGitLogHandler()).toBeDefined();
    });

    it('rejects test execution if the development server was not started by npm', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        delete process.env['npm_execpath'];

        try {
            const testApp = createApp(root);
            testApp.use(handleError);
            const response = await request(testApp).post('/tests/run');
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
        const testApp = createApp(root, execute);
        testApp.use(handleError);
        let firstStatus: number | undefined;
        let firstRequest = Promise.resolve();

        try {
            firstRequest = request(testApp).post('/tests/run').then((response) => {
                firstStatus = response.status;
            });
            await runStarted;
            const secondRequest = request(testApp).post('/tests/run');
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
        const testApp = createApp(root, execute);

        try {
            const response = await request(testApp).post('/tests/run');
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
        const testApp = createApp(root, execute);

        try {
            const response = await request(testApp).post('/tests/run');
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

    it('starts the server and binds an ephemeral port', async () => {
        const server = await startServer(root, 0);
        const address = server.address();
        expect(address && typeof address === 'object' && address.port).toBeTruthy();
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    });

    it('passes a configured authentication service through server startup', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';
        let startedApp: ReturnType<typeof createApp> | undefined;
        const listener: ServerListener = {
            listen: (application, _port) => {
                startedApp = application;
                return Promise.resolve(createServer());
            },
        };
        const authenticationService: AuthenticationService = {
            async authenticate(request) {
                return request.get('Authorization') === 'Bearer startup-token'
                    ? { id: 'startup-user' }
                    : null;
            },
        };

        try {
            await startServer(root, 3000, listener, authenticationService);
            const response = await request(startedApp!)
                .get('/files')
                .set('Authorization', 'Bearer startup-token')
                .query({ path: 'sample.txt' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ data: 'initial' });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('uses the default root and port when no startup arguments are supplied', async () => {
        const originalPort = process.env['PORT'];
        delete process.env['PORT'];
        let observedPort: number | undefined;
        let observedRoot: string | undefined;
        const listener: ServerListener = {
            listen: (application, port) => {
                observedPort = port;
                observedRoot = application.locals['fileSystem'].rootpath;
                return Promise.resolve(createServer());
            },
        };

        try {
            await startServer(undefined, undefined, listener);
            expect(observedRoot).toBe('./');
            expect(observedPort).toBe(3000);
        } finally {
            if (originalPort === undefined) {
                delete process.env['PORT'];
            } else {
                process.env['PORT'] = originalPort;
            }
        }
    });

    it('propagates listener startup errors', async () => {
        const startupError = Object.assign(new Error('port is occupied'), { code: 'EADDRINUSE' });
        const listener: ServerListener = {
            listen: () => Promise.reject(startupError),
        };

        await expect(startServer(root, 3000, listener)).rejects.toBe(startupError);
    });

    it('rejects startup when the requested port is invalid', async () => {
        await expect(startServer(root, -1)).rejects.toMatchObject({ code: 'ERR_SOCKET_BAD_PORT' });
    });
});
