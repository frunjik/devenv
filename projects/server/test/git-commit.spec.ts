import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { execFileSync } from 'node:child_process';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import {
    createApp,
    startServer,
    type AuthenticationService,
    type ServerListener,
    type TestCommandEvent,
    type TestCommandExecutor,
} from '../src/public-api';
import { forwardTestProcessOutput } from '../src/lib/handlers/test-runner';
import { createGitCommitHandler } from '../src/lib/handlers/git-commit';
import { createGitLogHandler } from '../src/lib/handlers/git-log';
import { createGitStatusHandler } from '../src/lib/handlers/git-status';

describe('git commit public API', () => {
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

    it('commits all worktree changes with the supplied message', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        const gitRoot = join(root, 'git-repo');
        await mkdir(gitRoot);
        execFileSync('git', ['init', gitRoot]);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', gitRoot, 'config', 'user.email', 'test@example.com']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'initial');
        execFileSync('git', ['-C', gitRoot, 'add', '--all']);
        execFileSync('git', ['-C', gitRoot, 'commit', '-m', 'initial']);
        await writeFile(join(gitRoot, 'tracked.txt'), 'updated');
        await writeFile(join(gitRoot, 'untracked.txt'), 'new file');
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, gitRoot);
            const response = await request(gitApp)
                .post('/git/commit')
                .send({ message: 'Commit all worktree changes' });
            expect(response.status).toBe(200);
            expect(response.body.data.stdout).toContain('Commit all worktree changes');
            expect(execFileSync('git', ['-C', gitRoot, 'show', '--format=%s', '--no-patch'], { encoding: 'utf8' }).trim())
                .toBe('Commit all worktree changes');
            expect(execFileSync('git', ['-C', gitRoot, 'status', '--porcelain'], { encoding: 'utf8' }).trim()).toBe('');
            expect(execFileSync('git', ['-C', gitRoot, 'show', 'HEAD:untracked.txt'], { encoding: 'utf8' }))
                .toBe('new file');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('defaults the commit route working directory to the current directory', () => {
        expect(createGitCommitHandler()).toBeDefined();
    });

    it('requires a valid commit message', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root);
            const response = await request(gitApp).post('/git/commit').send({ message: '  ' });
            expect(response.status).toBe(400);
            expect(response.body.error.message).toContain('commit message');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('rejects a non-string commit message', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root);
            const response = await request(gitApp).post('/git/commit').send({ message: 123 });
            expect(response.status).toBe(400);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('rejects commit messages longer than 5000 characters', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root);
            const response = await request(gitApp).post('/git/commit').send({ message: 'x'.repeat(5001) });
            expect(response.status).toBe(400);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('reports git commit failures with captured output', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        execFileSync('git', ['init', root]);
        execFileSync('git', ['-C', root, 'config', 'user.name', 'Test User']);
        execFileSync('git', ['-C', root, 'config', 'user.email', 'test@example.com']);
        execFileSync('git', ['-C', root, 'add', '--all']);
        execFileSync('git', ['-C', root, 'commit', '-m', 'initial']);
        process.env['NODE_ENV'] = 'test';

        try {
            const gitApp = createApp(root, undefined, root);
            const response = await request(gitApp)
                .post('/git/commit')
                .send({ message: 'Nothing to commit' });
            expect(response.status).toBe(500);
            expect(`${response.body.error.stdout}${response.body.error.stderr}`).toContain('nothing to commit');
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

    it('rejects concurrent git commit requests', async () => {
        let markCommitStarted: (() => void) | undefined;
        let finishCommit: (() => void) | undefined;
        const commitStarted = new Promise<void>(resolve => markCommitStarted = resolve);
        const app = express();
        app.use(express.json());
        app.post('/git/commit', createGitCommitHandler(root, async args => {
            if (args[0] === 'add') {
                return { stdout: '', stderr: '' };
            }
            markCommitStarted?.();
            return new Promise(resolve => {
                finishCommit = () => resolve({ stdout: 'committed', stderr: '' });
            });
        }));
        let firstStatus: number | undefined;
        const firstRequest = request(app).post('/git/commit').send({ message: 'first' })
            .then(response => firstStatus = response.status);

        try {
            await commitStarted;
            const secondResponse = await request(app).post('/git/commit').send({ message: 'second' });
            expect(secondResponse.status).toBe(409);
        } finally {
            finishCommit?.();
        }

        await firstRequest;
        expect(firstStatus).toBe(200);
    });

    it('does not register the commit route in production', async () => {
        const originalNodeEnv = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';

        try {
            const productionApp = createApp(root);
            const response = await request(productionApp).post('/git/commit').send({ message: 'not committed' });
            expect(response.status).toBe(404);
        } finally {
            if (originalNodeEnv === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = originalNodeEnv;
            }
        }
    });

});
