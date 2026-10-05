export interface GitCommandResult {
    stdout: string;
    stderr: string;
}

export type GitCommitResult = GitCommandResult;

export interface GitLogEntry {
    hash: string;
    author: string;
    date: string;
    subject: string;
}

export interface GitStatusFile {
    path: string;
    originalPath?: string;
    indexStatus: string;
    workTreeStatus: string;
    staged: boolean;
    unstaged: boolean;
    untracked: boolean;
    conflicted: boolean;
}

export interface GitStatus {
    branch: string | null;
    ahead: number;
    behind: number;
    clean: boolean;
    files: GitStatusFile[];
}
