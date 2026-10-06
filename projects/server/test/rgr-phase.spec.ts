import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';

describe('RGR phase', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-server-test-'));
        app = createApp(root);
        app.use(handleError);
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it('returns the last recorded phase from the phase file', async () => {
        await writeFile(join(root, '.rgr-phase'), 'red\ngreen\n');

        const response = await request(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: 'green' });
    });

    it('returns null for an unrecognized phase value', async () => {
        await writeFile(join(root, '.rgr-phase'), 'purple');

        const response = await request(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: null });
    });

    it('returns null when the phase file is empty', async () => {
        await writeFile(join(root, '.rgr-phase'), ' \n\n');

        const response = await request(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: null });
    });

    it('returns null when the phase file does not exist', async () => {
        const response = await request(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: null });
    });

    it('forwards phase file read errors to Express', async () => {
        await mkdir(join(root, '.rgr-phase'));

        const response = await request(app).get('/rgr-phase');

        expect(response.status).toBe(500);
    });

    it('accepts refactor as a recorded phase', async () => {
        await writeFile(join(root, '.rgr-phase'), 'refactor');

        const response = await request(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: 'refactor' });
    });
});
