import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { requestApp } from './support/request-app';
import { createApp } from '../src/public-api';
import { createGitDiffHandler } from '../src/lib/handlers/git-diff';

describe('git diff public API', () => {
    let root: string;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-git-diff-test-'));
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it('defaults the git diff route working directory to the current directory', () => {
        expect(createGitDiffHandler()).toBeDefined();
    });

    it('returns staged and unstaged tracked changes from HEAD', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        execFileSync('git', ['init', '-b', 'main', root]);
        execFileSync('git', ['-C', root, 'config', 'core.autocrlf', 'false']);
        execFileSync('git', ['-C', root, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', root, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(root, 'unstaged.txt'), 'before\n');
        await writeFile(join(root, 'staged.txt'), 'before\n');
        execFileSync('git', ['-C', root, 'add', '--all']);
        execFileSync('git', ['-C', root, 'commit', '-m', 'Initial commit']);
        await writeFile(join(root, 'unstaged.txt'), 'unstaged content\n');
        await writeFile(join(root, 'staged.txt'), 'staged content\n');
        await writeFile(join(root, 'new-file.ts'), 'export const added = true;\n');
        execFileSync('git', ['-C', root, 'add', 'staged.txt']);
        process.env['NODE_ENV'] = 'test';

        try {
            const response = await requestApp(createApp(root, { gitCommitCwd: root })).get('/git/diff');

            expect(response.status).toBe(200);
            expect(response.body.data).toContain('diff --git a/unstaged.txt b/unstaged.txt');
            expect(response.body.data).toContain('+unstaged content');
            expect(response.body.data).toContain('diff --git a/staged.txt b/staged.txt');
            expect(response.body.data).toContain('+staged content');
            expect(response.body.data).toContain('new file mode');
            expect(response.body.data).toContain('+++ b/new-file.ts');
            expect(response.body.data).toContain('+export const added = true;');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns an empty diff when there are no changes', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        execFileSync('git', ['init', root]);
        execFileSync('git', ['-C', root, 'config', 'core.autocrlf', 'false']);
        execFileSync('git', ['-C', root, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', root, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(root, 'tracked.txt'), 'unchanged\n');
        execFileSync('git', ['-C', root, 'add', '--all']);
        execFileSync('git', ['-C', root, 'commit', '-m', 'Initial commit']);
        process.env['NODE_ENV'] = 'test';

        try {
            const response = await requestApp(createApp(root, { gitCommitCwd: root })).get('/git/diff');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ data: '' });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns git errors when the working directory is not a repository', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const response = await requestApp(createApp(root, { gitCommitCwd: root })).get('/git/diff');

            expect(response.status).toBe(500);
            expect(response.body.error.stderr.toLowerCase()).toContain('not a git repository');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('does not register the git diff route in production', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const response = await requestApp(createApp(root)).get('/git/diff');
            expect(response.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns the diff executor error and output details', async () => {
        const gitApp = express();
        gitApp.get('/git/diff', createGitDiffHandler(root, async () => {
            const error = new Error('git diff failed') as Error & { stdout: string; stderr: string };
            error.stdout = 'partial diff';
            error.stderr = 'git failure';
            throw error;
        }));
        gitApp.use(handleError);

        const response = await requestApp(gitApp).get('/git/diff');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error: {
                message: 'git diff failed',
                stdout: 'partial diff',
                stderr: 'git failure',
            },
        });
    });
});
