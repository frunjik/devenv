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
