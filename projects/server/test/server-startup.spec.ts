import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer } from 'node:http';
import type { ErrorRequestHandler } from 'express';
import { requestApp } from './support/request-app';
import { createApp, startServer, type ServerListener } from '../src/public-api';

const mockFiles = new Map<string, string>();

jest.mock('node:fs/promises', () => {
    const actual = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises');
    return {
        ...actual,
        mkdir: jest.fn(),
        readFile: jest.fn(async (filename: string, encoding?: string) => {
            const contents = mockFiles.get(filename);
            if (contents === undefined) {
                throw Object.assign(new Error('File not found'), { code: 'ENOENT' });
            }
            return encoding ? contents : Buffer.from(contents);
        }),
        rename: jest.fn(),
        writeFile: jest.fn(),
    };
});

const fileReader = jest.mocked(readFile);
const fileWriter = jest.mocked(writeFile);
const fileRenamer = jest.mocked(rename);
const directoryMaker = jest.mocked(mkdir);

describe('server startup public API', () => {
    const root = process.cwd();
    const files = mockFiles;
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(() => {
        files.clear();
        fileReader.mockClear();
        fileWriter.mockReset().mockImplementation(async (filename, contents) => {
            if (typeof contents !== 'string') {
                throw new Error('The startup persistence boundary expects text contents');
            }
            files.set(String(filename), contents);
        });
        fileRenamer.mockReset().mockImplementation(async (from, to) => {
            const contents = files.get(String(from));
            if (contents === undefined) {
                throw Object.assign(new Error('Source file not found'), { code: 'ENOENT' });
            }
            files.set(String(to), contents);
            files.delete(String(from));
        });
        directoryMaker.mockReset().mockResolvedValue(undefined);
        app = createApp(root);
        app.set('env', 'production');
        app.use(handleError);
    });

    it('starts the server and binds an ephemeral port', async () => {
        const server = await startServer(root, 0);
        const address = server.address();
        expect(address && typeof address === 'object' && address.port).toBeTruthy();
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    });

    it('exposes the server version', async () => {
        const response = await requestApp(app).get('/version');

        expect(response.status).toBe(200);
        expect(response.body.data).toMatch(/^\d+\.\d+\.\d+/);
    });

    describe('ticket persistence', () => {
        const ticket = {
            title: 'Pick list is wrong',
            report: 'Pickers get the wrong aisle.',
            problem: { condition: 'Wrong aisle', affected: 'Pickers', impact: 'Delays' },
            scope: { level: 'workflow', label: 'Picking' },
            context: { people: [], places: [], things: [] },
            reportedBy: 'Ada',
            reportedAt: '2026-10-06T10:00:00.000Z',
        };

        async function startedApp(): Promise<ReturnType<typeof createApp>> {
            let started: ReturnType<typeof createApp> | undefined;
            await startServer(root, 0, { listen: (application) => {
                started = application;
                return Promise.resolve(createServer());
            } });
            return started!;
        }

        it('keeps tickets in a file under the root by default', async () => {
            const started = await startedApp();

            const created = await requestApp(started).post('/tickets').send({ ticket });
            expect(created.status).toBe(201);

            const saved = JSON.parse(await readFile(join(root, '.tickets.json'), 'utf8'));
            expect(saved.tickets).toHaveLength(1);
            expect((await requestApp(await startedApp()).get('/tickets')).body.data).toEqual([created.body.data]);
            expect(directoryMaker).toHaveBeenCalledWith(root, { recursive: true });
            expect(fileReader).toHaveBeenCalledWith(join(root, '.tickets.json'), 'utf8');
            expect(fileWriter).toHaveBeenCalledTimes(1);
            const temporary = fileWriter.mock.calls[0][0];
            expect(temporary).toEqual(expect.stringMatching(/\.tickets\.json\.[^.]+\.tmp$/));
            expect(fileRenamer).toHaveBeenCalledWith(temporary, join(root, '.tickets.json'));
            expect([...files.keys()]).toEqual([join(root, '.tickets.json')]);
        });

        it('keeps tickets in the file named by TICKETS_FILE when it is set', async () => {
            const original = process.env['TICKETS_FILE'];
            process.env['TICKETS_FILE'] = join(root, 'elsewhere.json');
            try {
                const created = await requestApp(await startedApp()).post('/tickets').send({ ticket });
                expect(created.status).toBe(201);

                expect(JSON.parse(await readFile(join(root, 'elsewhere.json'), 'utf8')).tickets).toHaveLength(1);
                expect(fileRenamer).toHaveBeenCalledWith(
                    fileWriter.mock.calls[0][0],
                    join(root, 'elsewhere.json'),
                );
                expect([...files.keys()]).toEqual([join(root, 'elsewhere.json')]);
            } finally {
                if (original === undefined) {
                    delete process.env['TICKETS_FILE'];
                } else {
                    process.env['TICKETS_FILE'] = original;
                }
            }
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
