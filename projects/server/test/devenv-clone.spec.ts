import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/public-api';
import type { DevEnvCloneRequest, DevEnvCloneResult } from '@shared';

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
});
