import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import { requestApp } from './support/request-app';
import { createApp } from '../src/public-api';

jest.mock('node:fs/promises', () => {
    const actual = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises');
    return { ...actual, readFile: jest.fn() };
});

const fileReader = jest.mocked(readFile);

describe('RGR phase', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(() => {
        root = process.cwd();
        fileReader.mockReset();
        fileReader.mockRejectedValue(Object.assign(new Error('File not found'), { code: 'ENOENT' }));
        app = createApp(root);
        app.use(handleError);
    });

    it('returns the last recorded phase from the phase file', async () => {
        fileReader.mockResolvedValue('red\ngreen\n');

        const response = await requestApp(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: 'green' });
        expect(fileReader).toHaveBeenCalledWith(join(root, '.rgr-phase'), 'utf8');
    });

    it('returns null for an unrecognized phase value', async () => {
        fileReader.mockResolvedValue('purple');

        const response = await requestApp(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: null });
    });

    it('returns null when the phase file is empty', async () => {
        fileReader.mockResolvedValue(' \n\n');

        const response = await requestApp(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: null });
    });

    it('returns null when the phase file does not exist', async () => {
        const response = await requestApp(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: null });
    });

    it('forwards phase file read errors to Express', async () => {
        fileReader.mockRejectedValue(Object.assign(new Error('Not a file'), { code: 'EISDIR' }));

        const response = await requestApp(app).get('/rgr-phase');

        expect(response.status).toBe(500);
    });

    it('accepts refactor as a recorded phase', async () => {
        fileReader.mockResolvedValue('refactor');

        const response = await requestApp(app).get('/rgr-phase');

        expect(response.body).toEqual({ data: 'refactor' });
    });
});
