import { execFile, type ExecFileException } from 'node:child_process';
import type { RequestHandler } from 'express';

interface GitUndoResult {
    stdout: string;
    stderr: string;
}

export type GitUndoExecutor = (args: string[], cwd: string) => Promise<GitUndoResult>;

interface GitUndoError extends Error {
    stdout: string;
    stderr: string;
}

const executeGit: GitUndoExecutor = (args, cwd) => new Promise((resolve, reject) => {
    execFile('git', args, { cwd, encoding: 'utf8', windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
            const commandError = error as ExecFileException & GitUndoError;
            commandError.stdout = stdout;
            commandError.stderr = stderr;
            reject(commandError);
            return;
        }
        resolve({ stdout, stderr });
    });
});

export function createGitUndoHandler(
    cwd = process.cwd(),
    execute: GitUndoExecutor = executeGit,
): RequestHandler {
    let isRunning = false;

    return (_request, response) => {
        if (isRunning) {
            response.status(409).json({ error: { message: 'A git undo is already running' } });
            return;
        }

        isRunning = true;
        void (async () => {
            try {
                const { stdout } = await execute(['status', '--porcelain=v1'], cwd);
                if (stdout.trim()) {
                    response.status(409).json({
                        error: { message: 'Cannot undo the latest commit while the working tree has uncommitted changes' },
                    });
                    return;
                }

                const result = await execute(['revert', '--no-edit', 'HEAD'], cwd);
                response.json({ data: result });
            } catch (error) {
                const commandError = error as GitUndoError;
                response.status(500).json({
                    error: {
                        message: commandError.message,
                        stdout: commandError.stdout,
                        stderr: commandError.stderr,
                    },
                });
            } finally {
                isRunning = false;
            }
        })();
    };
}
