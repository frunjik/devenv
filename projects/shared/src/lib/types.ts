export interface FolderEntry {
    filename: string;
    isFolder: boolean;
}

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

export interface SuccessResponseBody<T> {
    data: T;
}

export type SystemPlanStatus = 'In progress' | 'Ready' | 'Validated';
export type ConcernAcceptanceStatus = 'Pending' | 'Accepted' | 'Rejected';

export type SystemPlanConcern = {
    id: string;
    title: string;
    kind: string;
    dependsOn: string[];
    summary: string;
} & (
    | { status: 'Validated'; userAcceptance: ConcernAcceptanceStatus }
    | { status: Exclude<SystemPlanStatus, 'Validated'>; userAcceptance?: never }
);

export interface FailureResponseBody {
    error: {
        message: string;
    };
}

export type TestOutputStream = 'stdout' | 'stderr';

export type TestCommandEvent =
    | { type: TestOutputStream; data: string }
    | { type: 'complete'; exitCode: number }
    | { type: 'error'; message: string };

export interface LastTestRun {
    startedAt: string;
    finishedAt: string;
    exitCode: number | null;
    stdout: string;
    stderr: string;
    error: string | null;
}

export interface TestRunCacheStatus {
    available: boolean;
    status: 'empty' | 'passed' | 'failed' | 'error';
    startedAt: string | null;
    finishedAt: string | null;
    exitCode: number | null;
}

// The current Red-Green-Refactor phase (P-001), recorded explicitly by whoever is working
// rather than derived from test results, so Refactor can be distinguished from Green.
export type RgrPhase = 'red' | 'green' | 'refactor';

export const RGR_PHASES: readonly RgrPhase[] = ['red', 'green', 'refactor'];
