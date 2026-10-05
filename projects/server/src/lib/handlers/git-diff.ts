import { execFile, type ExecFileException } from 'node:child_process';
import type { RequestHandler } from 'express';

interface GitDiffResult {
    stdout: string;
    stderr: string;
}

export type GitDiffExecutor = (cwd: string) => Promise<GitDiffResult>;

interface GitDiffError extends Error {
    code?: string | number;
    stdout: string;
    stderr: string;
}

function executeGit(cwd: string, args: string[], allowExitCodeOne = false): Promise<GitDiffResult> {
    return new Promise((resolve, reject) => {
        execFile('git', args, {
            cwd,
            encoding: 'utf8',
            windowsHide: true,
            maxBuffer: 10 * 1024 * 1024,
        }, (error, stdout, stderr) => {
            if (error) {
                const commandError = error as ExecFileException & GitDiffError;
                commandError.stdout = stdout;
                commandError.stderr = stderr;
                if (allowExitCodeOne && error.code === 1) {
                    resolve({ stdout, stderr });
                    return;
                }
                reject(commandError);
                return;
            }
            resolve({ stdout, stderr });
        });
    });
}

const readGitDiff: GitDiffExecutor = async cwd => {
    const [{ stdout, stderr }, { stdout: untrackedOutput }] = await Promise.all([
        executeGit(cwd, ['diff', 'HEAD', '--no-ext-diff', '--binary']),
        executeGit(cwd, ['ls-files', '--others', '--exclude-standard', '-z']),
    ]);
    const untrackedDiffs = await Promise.all(untrackedOutput.split('\0').filter(Boolean).map(path =>
        executeGit(cwd, ['diff', '--no-index', '--binary', '--', '/dev/null', path], true)
            .then(result => result.stdout),
    ));

    return { stdout: [stdout, ...untrackedDiffs].join(''), stderr };
};

export function createGitDiffHandler(
    cwd = process.cwd(),
    execute: GitDiffExecutor = readGitDiff,
): RequestHandler {
    return (_request, response) => {
        void execute(cwd)
            .then(({ stdout }) => response.json({ data: stdout }))
            .catch((error: GitDiffError) => {
                response.status(500).json({
                    error: {
                        message: error.message,
                        stdout: error.stdout,
                        stderr: error.stderr,
                    },
                });
            });
    };
}
