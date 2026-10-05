import { execFile, type ExecFileException } from 'node:child_process';
import type { RequestHandler } from 'express';
import type { GitStatus, GitStatusFile } from '@ppt';

export type { GitStatus, GitStatusFile } from '@ppt';

interface GitStatusResult {
    stdout: string;
    stderr: string;
}

export type GitStatusExecutor = (cwd: string) => Promise<GitStatusResult>;

interface GitStatusError extends Error {
    stdout: string;
    stderr: string;
}

const readGitStatus: GitStatusExecutor = cwd => new Promise((resolve, reject) => {
    execFile('git', ['status', '--porcelain=v1', '--branch', '-z'], {
        cwd,
        encoding: 'utf8',
        windowsHide: true,
    }, (error, stdout, stderr) => {
        if (error) {
            const commandError = error as ExecFileException & GitStatusError;
            commandError.stdout = stdout;
            commandError.stderr = stderr;
            reject(commandError);
            return;
        }
        resolve({ stdout, stderr });
    });
});

function parseGitStatus(output: string): GitStatus {
    const records = output.split('\0');
    if (records.at(-1) === '') {
        records.pop();
    }

    let branch: string | null = null;
    let ahead = 0;
    let behind = 0;
    let fileRecordIndex = 0;
    const branchRecord = records[0];
    if (branchRecord?.startsWith('## ')) {
        const branchSummary = branchRecord.slice(3);
        const branchName = branchSummary.match(/^No commits yet on (.+)$/)?.[1]
            ?? branchSummary.split('...')[0];
        branch = branchName === 'HEAD (no branch)' ? null : branchName || null;
        ahead = Number(branchSummary.match(/\[ahead (\d+)/)?.[1] ?? 0);
        behind = Number(branchSummary.match(/\bbehind (\d+)/)?.[1] ?? 0);
        fileRecordIndex = 1;
    }

    const files: GitStatusFile[] = [];
    for (let index = fileRecordIndex; index < records.length; index++) {
        const record = records[index];
        if (record === undefined || record.length < 4 || record[2] !== ' ') {
            throw new Error('Git returned an invalid status result');
        }

        const indexStatus = record[0]!;
        const workTreeStatus = record[1]!;
        const path = record.slice(3);
        const isUntracked = indexStatus === '?' && workTreeStatus === '?';
        const hasRename = indexStatus === 'R' || indexStatus === 'C'
            || workTreeStatus === 'R' || workTreeStatus === 'C';
        const originalPath = hasRename ? records[++index] : undefined;
        if (hasRename && originalPath === undefined) {
            throw new Error('Git returned an invalid status result');
        }
        const conflicted = [indexStatus, workTreeStatus].some(status => status === 'U')
            || (indexStatus === 'A' && workTreeStatus === 'A')
            || (indexStatus === 'D' && workTreeStatus === 'D');

        files.push({
            path,
            ...(originalPath === undefined ? {} : { originalPath }),
            indexStatus,
            workTreeStatus,
            staged: !isUntracked && indexStatus !== ' ',
            unstaged: isUntracked || workTreeStatus !== ' ',
            untracked: isUntracked,
            conflicted,
        });
    }

    return { branch, ahead, behind, clean: files.length === 0, files };
}

export function createGitStatusHandler(
    cwd = process.cwd(),
    execute: GitStatusExecutor = readGitStatus,
): RequestHandler {
    return (_request, response) => {
        void execute(cwd)
            .then(({ stdout }) => response.json({ data: parseGitStatus(stdout) }))
            .catch((error: GitStatusError) => {
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
