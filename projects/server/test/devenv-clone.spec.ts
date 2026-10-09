import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createApp } from '../src/public-api';
import type { DevEnvCloneRequest, DevEnvCloneResult } from '@shared';
import { createDevEnvCloneHandler, DevEnvCloneError } from '../src/lib/handlers/devenv-clone';

describe('DevEnv clone API', () => {
    const clone = jest.fn<(root: string, request: DevEnvCloneRequest) => Promise<DevEnvCloneResult>>();

    beforeEach(() => {
        clone.mockReset();
    });

    it('requires an absolute destination and explicit replacement consent', async () => {
        const response = await request(createApp(process.cwd(), { devEnvClone: clone }))
            .post('/devenv/clone')
            .send({ destination: 'exports/dev-env', replaceExisting: false });

        expect(response.status).toBe(400);
        expect(clone).not.toHaveBeenCalled();
    });

    it('copies the curated package to the requested destination', async () => {
        clone.mockResolvedValue({
            destination: 'C:\\exports\\devenv',
            replacedExisting: true,
        });

        const response = await request(createApp(process.cwd(), { devEnvClone: clone }))
            .post('/devenv/clone')
            .send({ destination: 'C:\\exports\\devenv', replaceExisting: true });

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({
            destination: 'C:\\exports\\devenv',
            replacedExisting: true,
        });
        expect(clone).toHaveBeenCalledWith(process.cwd(), {
            destination: 'C:\\exports\\devenv',
            replaceExisting: true,
        });
    });

    it.each([
        null, 'invalid', {}, { destination: 1 }, { destination: '  ' },
        { destination: 'C:\\exports\\devenv' },
        { destination: 'C:\\exports\\devenv', replaceExisting: 'yes' },
    ])('rejects malformed request %p without cloning', async body => {
        const response = await request(createApp(process.cwd(), { devEnvClone: clone }))
            .post('/devenv/clone').send(JSON.stringify(body)).set('Content-Type', 'application/json');
        expect(response.status).toBe(400);
        expect(clone).not.toHaveBeenCalled();
    });

    it('reports clone refusal using its explicit status and message', async () => {
        clone.mockRejectedValue(new DevEnvCloneError('Replacement requires consent.', 409));
        const response = await request(createApp(process.cwd(), { devEnvClone: clone }))
            .post('/devenv/clone').send({ destination: 'C:\\exports\\devenv', replaceExisting: false });
        expect(response.status).toBe(409);
        expect(response.body.error.message).toBe('Replacement requires consent.');
    });

    it('passes unexpected clone failures to the API error handler', async () => {
        clone.mockRejectedValue(new Error('Storage unavailable'));
        const response = await request(createApp(process.cwd(), { devEnvClone: clone }))
            .post('/devenv/clone').send({ destination: 'C:\\exports\\devenv', replaceExisting: true });
        expect(response.status).toBe(500);
        expect(response.text).toContain('Storage unavailable');
    });

    it('rejects a request without a body', async () => {
        const response = await request(createApp(process.cwd(), { devEnvClone: clone }))
            .post('/devenv/clone');
        expect(response.status).toBe(400);
        expect(clone).not.toHaveBeenCalled();
    });

    it('rejects a scalar body even when the HTTP parser permits it', async () => {
        const app = express();
        app.use(express.json({ strict: false }));
        app.post('/devenv/clone', createDevEnvCloneHandler(process.cwd(), clone));
        const response = await request(app).post('/devenv/clone')
            .set('Content-Type', 'application/json').send('42');
        expect(response.status).toBe(400);
        expect(clone).not.toHaveBeenCalled();
    });

    it('uses the default clone implementation when no boundary override is supplied', async () => {
        const app = express();
        app.use(express.json());
        app.post('/devenv/clone', createDevEnvCloneHandler(process.cwd()));
        const response = await request(app).post('/devenv/clone')
            .send({ destination: process.cwd(), replaceExisting: true });
        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe('Destination must be outside the DevEnv source folder.');
    });

    it('uses the real filesystem only to read and reject a source-overlapping destination', async () => {
        const response = await request(createApp(process.cwd()))
            .post('/devenv/clone')
            .send({ destination: process.cwd(), replaceExisting: true });
        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe('Destination must be outside the DevEnv source folder.');
    });
});
