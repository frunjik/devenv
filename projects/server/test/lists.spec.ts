import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { createApp } from '../src/public-api';

describe('glossary API', () => {
    let root: string;
    let app: ReturnType<typeof createApp>;

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-lines-test-'));
        app = createApp(root);
        app.set('env', 'production');
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it('prefers .glossary and falls back to .terms', async () => {
        await writeFile(join(root, '.terms'), 'Term\n');
        expect((await request(app).get('/glossary')).body).toEqual({ data: ['Term'] });

        await writeFile(join(root, '.glossary'), 'Glossary term\n');
        expect((await request(app).get('/glossary')).body).toEqual({ data: ['Glossary term'] });
    });

    it('returns an empty glossary when neither file exists', async () => {
        expect((await request(app).get('/glossary')).body).toEqual({ data: [] });
    });

    it('forwards glossary read errors that are not missing files', async () => {
        await mkdir(join(root, '.glossary'));

        expect((await request(app).get('/glossary')).status).toBe(500);
    });
});
