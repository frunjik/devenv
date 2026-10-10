import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { requestApp } from './support/request-app';
import { createApp } from '../src/public-api';
import { createGitStatusHandler } from '../src/lib/handlers/git-status';

describe('git status public API', () => {
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

    it('returns the current branch and open worktree changes', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'git-status-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', '-b', 'main', gitRoot]);
        execFileSync('git', ['-C', gitRoot, 'config', 'core.autocrlf', 'false']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'initial');
        execFileSync('git', ['-C', gitRoot, 'add', '--all']);
        execFileSync('git', ['-C', gitRoot, 'commit', '-m', 'Initial commit']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'updated');
        await writeFile(join(gitRoot, 'untracked.txt'), 'new file');
        await writeFile(join(gitRoot, 'staged.txt'), 'staged change');
        execFileSync('git', ['-C', gitRoot, 'add', 'staged.txt']);
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, { gitCommitCwd: gitRoot });
            const response = await requestApp(gitApp).get('/git/status');

            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({
                branch: 'main',
                ahead: 0,
                behind: 0,
                clean: false,
            });
            expect(response.body.data.files).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    path: 'tracked.txt',
                    indexStatus: ' ',
                    workTreeStatus: 'M',
                    staged: false,
                    unstaged: true,
                    untracked: false,
                    conflicted: false,
                }),
                expect.objectContaining({
                    path: 'untracked.txt',
                    indexStatus: '?',
                    workTreeStatus: '?',
                    staged: false,
                    unstaged: true,
                    untracked: true,
                    conflicted: false,
                }),
                expect.objectContaining({
                    path: 'staged.txt',
                    indexStatus: 'A',
                    workTreeStatus: ' ',
                    staged: true,
                    unstaged: false,
                    untracked: false,
                    conflicted: false,
                }),
            ]));
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('returns an empty and clean status for a clean repository', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'clean-git-status-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', gitRoot]);
        execFileSync('git', ['-C', gitRoot, 'config', 'core.autocrlf', 'false']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'initial');
        execFileSync('git', ['-C', gitRoot, 'add', '--all']);
        execFileSync('git', ['-C', gitRoot, 'commit', '-m', 'Initial commit']);
        process.env['NODE_ENV'] = 'test';

        try {
            const response = await requestApp(createApp(root, { gitCommitCwd: gitRoot })).get('/git/status');
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual({
                branch: expect.any(String),
                ahead: 0,
                behind: 0,
                clean: true,
                files: [],
            });
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports git status errors when the working directory is not a repository', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const response = await requestApp(createApp(root, { gitCommitCwd: root })).get('/git/status');
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

    it('reports malformed git status output', async () => {
        const gitApp = express();
        gitApp.get('/git/status', createGitStatusHandler(root, async () => ({
            stdout: 'malformed',
            stderr: '',
        })));
        gitApp.use(handleError);

        const response = await requestApp(gitApp).get('/git/status');

        expect(response.status).toBe(500);
        expect(response.body.error.message).toBe('Git returned an invalid status result');
    });

    it('parses branch tracking and all Git status categories', async () => {
        const gitApp = express();
        gitApp.get('/git/status', createGitStatusHandler(root, async () => ({
            stdout: [
                '## feature...origin/feature [ahead 2, behind 3]',
                'M  staged.txt',
                ' M unstaged.txt',
                '?? untracked.txt',
                'R  renamed-staged.txt',
                'staged-source.txt',
                ' R renamed-unstaged.txt',
                'unstaged-source.txt',
                'C  copied-staged.txt',
                'copied-source.txt',
                ' C copied-unstaged.txt',
                'copied-unstaged-source.txt',
                'UU conflicted.txt',
                'AA added-conflict.txt',
                'DD deleted-conflict.txt',
            ].join('\0') + '\0',
            stderr: '',
        })));

        const response = await requestApp(gitApp).get('/git/status');

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            branch: 'feature',
            ahead: 2,
            behind: 3,
            clean: false,
        });
        expect(response.body.data.files).toEqual(expect.arrayContaining([
            expect.objectContaining({ path: 'renamed-staged.txt', originalPath: 'staged-source.txt' }),
            expect.objectContaining({ path: 'renamed-unstaged.txt', originalPath: 'unstaged-source.txt' }),
            expect.objectContaining({ path: 'copied-staged.txt', originalPath: 'copied-source.txt' }),
            expect.objectContaining({ path: 'copied-unstaged.txt', originalPath: 'copied-unstaged-source.txt' }),
            expect.objectContaining({ path: 'conflicted.txt', conflicted: true }),
            expect.objectContaining({ path: 'added-conflict.txt', conflicted: true }),
            expect.objectContaining({ path: 'deleted-conflict.txt', conflicted: true }),
        ]));
    });

    it('parses status without branch metadata and branch summary variants', async () => {
        const outputs = [
            { stdout: '', branch: null, ahead: 0, behind: 0 },
            { stdout: '## ', branch: null, ahead: 0, behind: 0 },
            { stdout: '## main', branch: 'main', ahead: 0, behind: 0 },
            { stdout: '## main...origin/main [ahead 1]', branch: 'main', ahead: 1, behind: 0 },
            { stdout: '## main...origin/main [behind 2]', branch: 'main', ahead: 0, behind: 2 },
            { stdout: '## No commits yet on new-branch', branch: 'new-branch', ahead: 0, behind: 0 },
            { stdout: '## HEAD (no branch)', branch: null, ahead: 0, behind: 0 },
        ];

        for (const { stdout, branch, ahead, behind } of outputs) {
            const gitApp = express();
            gitApp.get('/git/status', createGitStatusHandler(root, async () => ({ stdout, stderr: '' })));
            const response = await requestApp(gitApp).get('/git/status');

            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({ branch, ahead, behind });
        }
    });

    it('rejects malformed Git status records and missing rename paths', async () => {
        for (const stdout of ['x\0', 'malformed', 'R  renamed.txt\0']) {
            const gitApp = express();
            gitApp.get('/git/status', createGitStatusHandler(root, async () => ({ stdout, stderr: '' })));
            gitApp.use(handleError);

            const response = await requestApp(gitApp).get('/git/status');

            expect(response.status).toBe(500);
            expect(response.body.error.message).toBe('Git returned an invalid status result');
        }
    });

    it('returns Git execution errors from the status endpoint', async () => {
        const gitApp = express();
        gitApp.get('/git/status', createGitStatusHandler(root, async () => {
            throw Object.assign(new Error('git status failed'), { stdout: 'out', stderr: 'err' });
        }));

        const response = await requestApp(gitApp).get('/git/status');

        expect(response.status).toBe(500);
        expect(response.body.error).toEqual({
            message: 'git status failed',
            stdout: 'out',
            stderr: 'err',
        });
    });

    it('does not register the git status route in production', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const response = await requestApp(createApp(root)).get('/git/status');
            expect(response.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('defaults the git status route working directory to the current directory', () => {
        expect(createGitStatusHandler()).toBeDefined();
    });
});
