import { execFile, type ExecFileException, type ExecFileOptions } from 'node:child_process';
import type { Buffer } from 'node:buffer';
import type { RequestHandler } from 'express';

export interface TestRunResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}

export type TestCommandRunner = () => Promise<TestRunResult>;

export type TestCommandCallback = (
    error: ExecFileException | null,
    stdout: string | Buffer,
    stderr: string | Buffer,
) => void;

export type TestCommandExecutor = (
    command: string,
    args: string[],
    options: ExecFileOptions,
    callback: TestCommandCallback,
) => void;

const executeCommand: TestCommandExecutor = (command, args, options, callback) => {
    execFile(command, args, { ...options, encoding: 'utf8' }, callback);
};

export function createTestCommandRunner(execute: TestCommandExecutor = executeCommand): TestCommandRunner {
    return () => new Promise((resolve, reject) => {
        const npmExecPath = process.env['npm_execpath'];
        if (!npmExecPath) {
            reject(new Error('Start the development server with npm run dev:server to enable test execution'));
            return;
        }

        execute(process.execPath, [npmExecPath, 'run', 'test:all'], {
            cwd: process.cwd(),
            maxBuffer: 10 * 1024 * 1024,
            timeout: 180_000,
            windowsHide: true,
        }, (error, stdout, stderr) => {
            if (error && typeof error.code !== 'number') {
                reject(error);
                return;
            }

            const exitCode = error ? Number(error.code) : 0;
            resolve({
                exitCode,
                stdout: stdout.toString(),
                stderr: stderr.toString(),
            });
        });
    });
}

export function createTestRunHandler(runTests: TestCommandRunner): RequestHandler {
    let isRunning = false;

    return (_request, response, next) => {
        if (isRunning) {
            response.status(409).json({ error: { message: 'Tests are already running' } });
            return;
        }

        isRunning = true;
        void runTests()
            .then((result) => {
                response.json({ data: result });
            })
            .catch(next)
            .finally(() => {
                isRunning = false;
            });
    };
}
