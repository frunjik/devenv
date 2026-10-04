import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import {
    createApp,
    startServer,
    type ServerListener,
    type TestCommandEvent,
    type TestCommandExecutor,
} from '../src/public-api';

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
            expect(observedArgs).toEqual(['npm-cli.js', 'run', 'test:all']);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
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

        try {
            const firstRequest = request(testApp).post('/tests/run').then((response) => response);
            await runStarted;

            const secondResponse = await request(testApp).post('/tests/run');
            expect(secondResponse.status).toBe(409);

            finishRun?.({ type: 'complete', exitCode: 0 });
            const firstResponse = await firstRequest;
            expect(firstResponse.status).toBe(200);
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
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
