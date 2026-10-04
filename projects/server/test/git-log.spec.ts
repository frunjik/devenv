import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';
import { createGitLogHandler } from '../src/lib/handlers/git-log';

describe('git log public API', () => {
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

    it('returns git errors when the working directory is not a repository', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, root);
            const response = await request(gitApp).get('/git/log');
            expect(response.status).toBe(500);
            expect(response.body.error.stderr).toContain('not a git repository');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports malformed git log output', async () => {
        const gitApp = express();
        gitApp.get('/git/log', createGitLogHandler(root, async () => ({
            stdout: 'incomplete\x1fcommit',
            stderr: '',
        })));
        gitApp.use(handleError);

        const response = await request(gitApp).get('/git/log');

        expect(response.status).toBe(500);
        expect(response.body.error.message).toBe('Git returned an invalid log result');
    });

    it('does not register the git log route in production', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const productionApp = createApp(root);
            const response = await request(productionApp).get('/git/log');
            expect(response.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('defaults the git log route working directory to the current directory', () => {
        expect(createGitLogHandler()).toBeDefined();
    });

    it('returns recent commit details from the git log', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'git-log-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', gitRoot]);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(gitRoot, 'log.txt'), 'initial');
        execFileSync('git', ['-C', gitRoot, 'add', '--all']);
        execFileSync('git', ['-C', gitRoot, 'commit', '-m', 'Initial commit']);
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, gitRoot);
            const response = await request(gitApp).get('/git/log');
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0]).toMatchObject({
                hash: expect.stringMatching(/^[0-9a-f]{40}$/),
                author: 'Test User',
                subject: 'Initial commit',
            });
            expect(response.body.data[0].date).toEqual(expect.any(String));
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns an empty list when the git repository has no commits', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'empty-git-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', gitRoot]);
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, gitRoot);
            const response = await request(gitApp).get('/git/log');
            expect(response.body).toEqual({ data: [] });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });
});
