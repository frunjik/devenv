import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp, startServer, type ServerListener } from '../src/public-api';

describe('server startup public API', () => {
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

    it('starts the server and binds an ephemeral port', async () => {
        const server = await startServer(root, 0);
        const address = server.address();
        expect(address && typeof address === 'object' && address.port).toBeTruthy();
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    });

    it('exposes the server version', async () => {
        const response = await request(app).get('/version');

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

            await request(started).post('/tickets').send({ ticket });

            const saved = JSON.parse(await readFile(join(root, '.tickets.json'), 'utf8'));
            expect(saved.tickets).toHaveLength(1);
            expect((await request(await startedApp()).get('/tickets')).body.data).toHaveLength(1);
        });

        it('keeps tickets in the file named by TICKETS_FILE when it is set', async () => {
            const original = process.env['TICKETS_FILE'];
            process.env['TICKETS_FILE'] = join(root, 'elsewhere.json');
            try {
                await request(await startedApp()).post('/tickets').send({ ticket });

                expect(JSON.parse(await readFile(join(root, 'elsewhere.json'), 'utf8')).tickets).toHaveLength(1);
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
