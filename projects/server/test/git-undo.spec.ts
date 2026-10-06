import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { ExecFileException, ExecFileOptions } from 'node:child_process';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';
import { createGitUndoHandler } from '../src/lib/handlers/git-undo';

const mockExecFile = jest.fn<(
    command: string,
    args: string[],
    options: ExecFileOptions,
    callback: (error: ExecFileException | null, stdout: string, stderr: string) => void,
) => void>();

jest.mock('node:child_process', () => {
    const actual = jest.requireActual<typeof import('node:child_process')>('node:child_process');
    return {
        ...actual,
        execFile: (...args: Parameters<typeof mockExecFile>) => mockExecFile(...args),
    };
});

describe('git undo public API', () => {
    const root = process.cwd();
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(() => {
        mockExecFile.mockReset().mockImplementation((_command, _args, _options, callback) => {
            callback(null, '', '');
        });
    });

    it('requests a revert of the latest commit without history-rewriting commands', async () => {
        const output = '[main abc123] Revert "Latest change"\n';
        mockExecFile
            .mockImplementationOnce((_command, _args, _options, callback) => callback(null, '', ''))
            .mockImplementationOnce((_command, _args, _options, callback) => callback(null, output, ''));

        const response = await request(createApp(root, { gitCommitCwd: root })).post('/git/undo');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: { stdout: output, stderr: '' } });
        expect(mockExecFile.mock.calls.map(([command, args, options]) => [command, args, options])).toEqual([
            ['git', ['status', '--porcelain=v1'], { cwd: root, encoding: 'utf8', windowsHide: true }],
            ['git', ['revert', '--no-edit', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }],
        ]);
    });

    it('refuses to undo while tracked or untracked changes are present', async () => {
        mockExecFile.mockImplementationOnce((_command, _args, _options, callback) => {
            callback(null, ' M tracked.txt\n?? untracked.txt\n', '');
        });

        const response = await request(createApp(root, { gitCommitCwd: root })).post('/git/undo');

        expect(response.status).toBe(409);
        expect(response.body.error.message).toContain('uncommitted changes');
        expect(mockExecFile).toHaveBeenCalledTimes(1);
        expect(mockExecFile.mock.calls[0][1]).toEqual(['status', '--porcelain=v1']);
    });

    it('returns git errors when the working directory is not a repository', async () => {
        mockExecFile.mockImplementationOnce((_command, _args, _options, callback) => {
            callback(new Error('git status failed'), 'partial status', 'fatal: not a git repository');
        });
        const response = await request(createApp(root, { gitCommitCwd: root })).post('/git/undo');

        expect(response.status).toBe(500);
        expect(`${response.body.error.stdout}${response.body.error.stderr}`.toLowerCase())
            .toContain('not a git repository');
        expect(response.body.error.stdout).toBe('partial status');
        expect(mockExecFile).toHaveBeenCalledTimes(1);
    });

    it('returns git errors when the repository has no commits', async () => {
        mockExecFile
            .mockImplementationOnce((_command, _args, _options, callback) => callback(null, '', ''))
            .mockImplementationOnce((_command, _args, _options, callback) => {
                callback(new Error('git revert failed'), '', 'fatal: bad revision HEAD');
            });

        const response = await request(createApp(root, { gitCommitCwd: root })).post('/git/undo');

        expect(response.status).toBe(500);
        expect(response.body.error.message).toBeTruthy();
        expect(response.body.error.stderr).toBe('fatal: bad revision HEAD');
        expect(mockExecFile).toHaveBeenCalledTimes(2);
    });

    it('does not register the git undo route in production', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const response = await request(createApp(root)).post('/git/undo');
            expect(response.status).toBe(404);
            expect(mockExecFile).not.toHaveBeenCalled();
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('defaults the undo route working directory to the current directory', async () => {
        const app = express();
        app.post('/git/undo', createGitUndoHandler());

        expect((await request(app).post('/git/undo')).status).toBe(200);
        expect(mockExecFile.mock.calls.map(([, , options]) => options.cwd)).toEqual([process.cwd(), process.cwd()]);
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

    it.each(['dirty worktree', 'command failure'])('allows a new undo after %s', async failure => {
        mockExecFile.mockImplementationOnce((_command, _args, _options, callback) => {
            if (failure === 'command failure') {
                callback(new Error('git status failed'), '', 'status failure');
            } else {
                callback(null, ' M tracked.txt\n', '');
            }
        });
        const app = createApp(root, { gitCommitCwd: root });

        const refused = await request(app).post('/git/undo');
        const retried = await request(app).post('/git/undo');

        expect(refused.status).toBe(failure === 'command failure' ? 500 : 409);
        expect(retried.status).toBe(200);
        expect(mockExecFile.mock.calls.map(([, args]) => args)).toEqual([
            ['status', '--porcelain=v1'],
            ['status', '--porcelain=v1'],
            ['revert', '--no-edit', 'HEAD'],
        ]);
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
