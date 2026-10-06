import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import fs from 'fs';
import { join } from 'node:path';
import { createServer } from 'node:http';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import {
    createApp,
    startServer,
    type AuthenticationService,
    type ServerListener,
} from '../src/public-api';

jest.mock('fs', () => {
    const actual = jest.requireActual<typeof import('fs')>('fs');
    return { ...actual, promises: { ...actual.promises, readFile: jest.fn() } };
});

const fileReader = jest.mocked(fs.promises.readFile);

describe('authentication public API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(() => {
        root = process.cwd();
        fileReader.mockReset();
        fileReader.mockResolvedValue('initial');
        app = createApp(root);
        app.set('env', 'production');
        app.use(handleError);
    });

    it('allows unauthenticated requests with the development authentication service', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'development';

        try {
            const developmentApp = createApp(root);
            const response = await request(developmentApp).get('/files').query({ path: 'sample.txt' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ data: 'initial' });
            expect(fileReader).toHaveBeenCalledWith(join(root, 'sample.txt'), 'utf-8');
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
            const authenticatedApp = createApp(root, { authenticationService });
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
            const authenticatedApp = createApp(root, { authenticationService });
            const response = await request(authenticatedApp).get('/files').query({ path: 'sample.txt' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: { message: 'Authentication required' } });
            expect(fileReader).not.toHaveBeenCalled();
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
            const authenticatedApp = createApp(root, { authenticationService });
            authenticatedApp.use(((_error, _request, response, _next) => response.status(503).end()) as ErrorRequestHandler);
            const response = await request(authenticatedApp).get('/files').query({ path: 'sample.txt' });

            expect(response.status).toBe(503);
            expect(fileReader).not.toHaveBeenCalled();
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
});
