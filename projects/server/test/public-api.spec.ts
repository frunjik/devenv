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
    type TestCommandCallback,
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

    it('runs the fixed test script and returns captured output', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = 'npm-cli.js';
        let observedCommand = '';
        let observedArgs: string[] = [];
        const execute: TestCommandExecutor = (command, args, _options, callback) => {
            observedCommand = command;
            observedArgs = args;
            callback(null, 'client and server tests passed', '');
        };
        const testApp = createApp(root, execute);
        testApp.use(handleError);

        try {
            const response = await request(testApp).post('/tests/run');
            expect(response.body).toEqual({
                data: {
                    exitCode: 0,
                    stdout: 'client and server tests passed',
                    stderr: '',
                },
            });
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

    it('executes the fixed test script and captures output from the child process', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        const npmCliPath = join(root, 'fake-npm.js');
        await writeFile(npmCliPath, "process.stdout.write('captured stdout'); process.stderr.write('captured stderr');");
        process.env['npm_execpath'] = npmCliPath;

        try {
            const testApp = createApp(root);
            const response = await request(testApp).post('/tests/run');
            expect(response.body).toEqual({
                data: {
                    exitCode: 0,
                    stdout: 'captured stdout',
                    stderr: 'captured stderr',
                },
            });
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('returns the test process exit code and output when tests fail', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = 'npm-cli.js';
        const commandError = Object.assign(new Error('tests failed'), { code: 2 });
        const execute: TestCommandExecutor = (_command, _args, _options, callback) => {
            callback(commandError, 'test output', 'failure details');
        };
        const testApp = createApp(root, execute);
        testApp.use(handleError);

        try {
            const response = await request(testApp).post('/tests/run');
            expect(response.body.data).toEqual({
                exitCode: 2,
                stdout: 'test output',
                stderr: 'failure details',
            });
        } finally {
            if (originalNpmExecPath === undefined) {
                delete process.env['npm_execpath'];
            } else {
                process.env['npm_execpath'] = originalNpmExecPath;
            }
        }
    });

    it('forwards test process launch failures as server errors', async () => {
        const originalNpmExecPath = process.env['npm_execpath'];
        process.env['npm_execpath'] = 'npm-cli.js';
        const execute: TestCommandExecutor = (_command, _args, _options, callback) => {
            callback(Object.assign(new Error('npm could not start'), { code: 'ENOENT' }), '', '');
        };
        const testApp = createApp(root, execute);
        testApp.use(handleError);

        try {
            const response = await request(testApp).post('/tests/run');
            expect(response.status).toBe(500);
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
        let finishRun: TestCommandCallback | undefined;
        const execute: TestCommandExecutor = (_command, _args, _options, callback) => {
            finishRun = callback;
        };
        const testApp = createApp(root, execute);
        testApp.use(handleError);
        const firstRequest = request(testApp).post('/tests/run').then((response) => response);
        await new Promise<void>((resolve) => setImmediate(resolve));

        const secondResponse = await request(testApp).post('/tests/run');
        expect(secondResponse.status).toBe(409);

        finishRun?.(null, '', '');
        const firstResponse = await firstRequest;
        expect(firstResponse.status).toBe(200);
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
