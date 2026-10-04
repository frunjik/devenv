import { execFile, type ExecFileException } from 'node:child_process';
import type { RequestHandler } from 'express';

export interface GitLogEntry {
    hash: string;
    author: string;
    date: string;
    subject: string;
}

interface GitLogResult {
    stdout: string;
    stderr: string;
}

export type GitLogExecutor = (cwd: string) => Promise<GitLogResult>;

interface GitLogError extends Error {
    stdout: string;
    stderr: string;
}

const readGitLog: GitLogExecutor = cwd => new Promise((resolve, reject) => {
    execFile('git', ['log', '-z', '-50', '--format=%H%x1f%an%x1f%aI%x1f%s'], {
        cwd,
        encoding: 'utf8',
        windowsHide: true,
    }, (error, stdout, stderr) => {
        if (error) {
            if (error.code === 128 && stderr.includes('does not have any commits yet')) {
                resolve({ stdout: '', stderr: '' });
                return;
            }
            const commandError = error as ExecFileException & GitLogError;
            commandError.stdout = stdout;
            commandError.stderr = stderr;
            reject(commandError);
            return;
        }
        resolve({ stdout, stderr });
    });
});

function parseGitLog(output: string): GitLogEntry[] {
    const records = output.split('\0').filter(record => record.length > 0);
    return records.map(record => {
        const [hash, author, date, subject] = record.split('\x1f');
        if (hash === undefined || author === undefined || date === undefined || subject === undefined) {
            throw new Error('Git returned an invalid log result');
        }
        return { hash, author, date, subject };
    });
}

export function createGitLogHandler(
    cwd = process.cwd(),
    execute: GitLogExecutor = readGitLog,
): RequestHandler {
    return (_request, response) => {
        void execute(cwd)
            .then(({ stdout }) => response.json({ data: parseGitLog(stdout) }))
            .catch((error: GitLogError) => {
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
