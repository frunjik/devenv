import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';
import { createGitUndoHandler } from '../src/lib/handlers/git-undo';

describe('git undo public API', () => {
    let root: string;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-git-undo-test-'));
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    function initializeRepository(): void {
        execFileSync('git', ['init', '-b', 'main', root]);
        execFileSync('git', ['-C', root, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', root, 'config', 'user.email', 'test@example.com']);
    }

    async function commitFile(path: string, content: string, message: string): Promise<void> {
        await writeFile(path, content);
        execFileSync('git', ['-C', root, 'add', '--all']);
        execFileSync('git', ['-C', root, 'commit', '-m', message]);
    }

    it('reverts the latest commit without rewriting commit history', async () => {
        initializeRepository();
        await commitFile(join(root, 'tracked.txt'), 'initial content\n', 'Initial commit');
        await commitFile(join(root, 'tracked.txt'), 'latest content\n', 'Latest change');

        const response = await request(createApp(root, { gitCommitCwd: root })).post('/git/undo');

        expect(response.status).toBe(200);
        expect(response.body.data.stdout).toContain('Latest change');
        expect(execFileSync('git', ['-C', root, 'show', 'HEAD:tracked.txt'], { encoding: 'utf8' }))
            .toBe('initial content\n');
        expect(execFileSync('git', ['-C', root, 'rev-list', '--count', 'HEAD'], { encoding: 'utf8' }).trim())
            .toBe('3');
        expect(execFileSync('git', ['-C', root, 'show', '--format=%s', '--no-patch'], { encoding: 'utf8' }).trim())
            .toBe('Revert "Latest change"');
    });

    it('refuses to undo while tracked or untracked changes are present', async () => {
        initializeRepository();
        await commitFile(join(root, 'tracked.txt'), 'initial content\n', 'Initial commit');
        await writeFile(join(root, 'tracked.txt'), 'local changes\n');
        await writeFile(join(root, 'untracked.txt'), 'untracked changes\n');

        const response = await request(createApp(root, { gitCommitCwd: root })).post('/git/undo');

        expect(response.status).toBe(409);
        expect(response.body.error.message).toContain('uncommitted changes');
        expect(execFileSync('git', ['-C', root, 'show', '--format=%s', '--no-patch'], { encoding: 'utf8' }).trim())
            .toBe('Initial commit');
        expect(execFileSync('git', ['-C', root, 'status', '--porcelain'], { encoding: 'utf8' })).toContain('tracked.txt');
    });

    it('returns git errors when the working directory is not a repository', async () => {
        const response = await request(createApp(root, { gitCommitCwd: root })).post('/git/undo');

        expect(response.status).toBe(500);
        expect(`${response.body.error.stdout}${response.body.error.stderr}`.toLowerCase())
            .toContain('not a git repository');
    });

    it('returns git errors when the repository has no commits', async () => {
        initializeRepository();

        const response = await request(createApp(root, { gitCommitCwd: root })).post('/git/undo');

        expect(response.status).toBe(500);
        expect(response.body.error.message).toBeTruthy();
    });

    it('does not register the git undo route in production', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const response = await request(createApp(root)).post('/git/undo');
            expect(response.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('defaults the undo route working directory to the current directory', () => {
        expect(createGitUndoHandler()).toBeDefined();
    });

    it('rejects concurrent undo requests', async () => {
        let markStatusStarted: (() => void) | undefined;
        let finishStatus: (() => void) | undefined;
        let callCount = 0;
        const statusStarted = new Promise<void>(resolve => markStatusStarted = resolve);
        const app = express();
        app.post('/git/undo', createGitUndoHandler(root, async () => {
            callCount += 1;
            if (callCount > 1) {
                return { stdout: 'reverted', stderr: '' };
            }
            markStatusStarted?.();
            return new Promise(resolve => {
                finishStatus = () => resolve({ stdout: '', stderr: '' });
            });
        }));

        let firstStatus: number | undefined;
        const firstRequest = request(app).post('/git/undo')
            .then(response => firstStatus = response.status);

        try {
            await statusStarted;
            const secondResponse = await request(app).post('/git/undo');
            expect(secondResponse.status).toBe(409);
        } finally {
            finishStatus?.();
        }

        await firstRequest;
        expect(firstStatus).toBe(200);
    });

    it('returns the executor error and captured output', async () => {
        const app = express();
        app.post('/git/undo', createGitUndoHandler(root, async () => {
            const error = new Error('git undo failed') as Error & { stdout: string; stderr: string };
            error.stdout = 'partial output';
            error.stderr = 'undo failure';
            throw error;
        }));
        app.use(handleError);

        const response = await request(app).post('/git/undo');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error: {
                message: 'git undo failed',
                stdout: 'partial output',
                stderr: 'undo failure',
            },
        });
    });
});
