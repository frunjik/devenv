import { execFile, type ExecFileException } from 'node:child_process';
import type { RequestHandler } from 'express';
import type { GitCommandResult } from '@shared';

export type { GitCommandResult } from '@shared';

export type GitCommandExecutor = (args: string[], cwd: string) => Promise<GitCommandResult>;

interface GitCommandError extends Error {
    stdout: string;
    stderr: string;
}

const runGit: GitCommandExecutor = (args, cwd) => {
    return new Promise((resolve, reject) => {
        execFile('git', args, { cwd, encoding: 'utf8', windowsHide: true }, (error, stdout, stderr) => {
            if (error) {
                const commandError = error as ExecFileException & GitCommandError;
                commandError.stdout = stdout;
                commandError.stderr = stderr;
                reject(commandError);
                return;
            }
            resolve({ stdout, stderr });
        });
    });
};

export function createGitCommitHandler(
    cwd = process.cwd(),
    execute: GitCommandExecutor = runGit,
    beforeCommit: () => Promise<unknown> = () => Promise.resolve(),
): RequestHandler {
    let isRunning = false;

    return (request, response) => {
        const message: unknown = request.body?.message;
        if (typeof message !== 'string' || !message.trim() || message.length > 5000) {
            response.status(400).json({
                error: { message: 'A non-empty commit message of at most 5000 characters is required' },
            });
            return;
        }
        if (isRunning) {
            response.status(409).json({ error: { message: 'A git commit is already running' } });
            return;
        }

        isRunning = true;
        void beforeCommit()
            .then(() => execute(['add', '--all'], cwd))
            .then(() => execute(['commit', '-m', message], cwd))
            .then(({ stdout, stderr }) => {
                response.json({ data: { stdout, stderr } });
            })
            .catch((error: GitCommandError) => {
                response.status(500).json({
                    error: {
                        message: error.message,
                        stdout: error.stdout,
                        stderr: error.stderr,
                    },
                });
            })
            .finally(() => {
                isRunning = false;
            });
    };
}
