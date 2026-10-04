import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';

describe('features public API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-feature-test-'));
        app = createApp(root);
        app.set('env', 'production');
        app.use(handleError);
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it('appends a timestamped one-line feature entry in history format', async () => {
        const response = await request(app)
            .post('/features')
            .send({ description: '  Add a feature\nwith multiline details  ' });

        expect(response.status).toBe(201);
        expect(response.body.data).toMatch(
            /^\/\/ \[\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2}\] Add a feature with multiline details$/,
        );
        expect(await readFile(join(root, '.features'), 'utf8')).toBe(`${response.body.data}\n`);
    });

    it('appends new entries after existing feature entries', async () => {
        await writeFile(join(root, '.features'), '// existing entry\n');

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        expect((await readFile(join(root, '.features'), 'utf8')).split(/\r?\n/)).toEqual([
            '// existing entry',
            response.body.data,
            '',
        ]);
    });

    it('separates an existing file without a trailing newline', async () => {
        await writeFile(join(root, '.features'), '// existing entry');

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        expect((await readFile(join(root, '.features'), 'utf8')).split(/\r?\n/)).toEqual([
            '// existing entry',
            response.body.data,
            '',
        ]);
    });

    it.each([
        ['missing description', {}],
        ['empty description', { description: '' }],
        ['whitespace-only description', { description: ' \n\t ' }],
        ['non-string description', { description: 42 }],
    ])('rejects a %s', async (_caseName, body) => {
        const response = await request(app).post('/features').send(body);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: { message: 'Feature description is required.' } });
    });

    it('forwards filesystem read errors to Express', async () => {
        await mkdir(join(root, '.features'));

        const response = await request(app).post('/features').send({ description: 'Next feature' });

        expect(response.status).toBe(500);
    });
});
