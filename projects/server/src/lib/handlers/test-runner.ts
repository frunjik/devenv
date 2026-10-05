import { execFile, type ExecFileOptions } from 'node:child_process';
import type { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import type { LastTestRun, TestCommandEvent, TestRunCacheStatus } from '@ppt';

export type { LastTestRun, TestCommandEvent, TestRunCacheStatus } from '@ppt';

export type TestCommandExecutor = (
    command: string,
    args: string[],
    options: ExecFileOptions,
    emit: (event: TestCommandEvent) => void,
) => void;

const defaultTestDataDirectory = join(process.cwd(), 'test-run-cache');

async function cacheLastTestRun(directory: string, result: LastTestRun): Promise<void> {
    const filePath = join(directory, 'last-test-run.json');
    const temporaryPath = join(directory, `last-test-run-${process.pid}-${randomUUID()}.tmp`);
    await mkdir(directory, { recursive: true });
    await writeFile(temporaryPath, JSON.stringify(result), 'utf8');
    await rename(temporaryPath, filePath);
}

interface TestProcess {
    stdout: { on(event: 'data', listener: (data: string | Buffer) => void): unknown } | null;
    stderr: { on(event: 'data', listener: (data: string | Buffer) => void): unknown } | null;
    on(event: 'error', listener: (error: Error) => void): unknown;
    on(event: 'close', listener: (code: number | null) => void): unknown;
}

export function forwardTestProcessOutput(
    child: TestProcess,
    emit: (event: TestCommandEvent) => void,
): void {
    child.stdout?.on('data', (data) => {
        emit({ type: 'stdout', data: data.toString() });
    });
    child.stderr?.on('data', (data) => {
        emit({ type: 'stderr', data: data.toString() });
    });
    child.on('error', (error) => {
        emit({ type: 'error', message: error.message });
    });
    child.on('close', (code) => {
        emit({ type: 'complete', exitCode: code ?? 1 });
    });
}

const executeCommand: TestCommandExecutor = (command, args, options, emit) => {
    const child = execFile(command, args, { ...options, encoding: 'utf8' });
    forwardTestProcessOutput(child, emit);
};

export function createTestRunHandler(
    execute: TestCommandExecutor = executeCommand,
    cacheDirectory = defaultTestDataDirectory,
): RequestHandler {
    let isRunning = false;

    return (_request, response, next) => {
        if (isRunning) {
            response.status(409).json({ error: { message: 'Tests are already running' } });
            return;
        }

        const npmExecPath = process.env['npm_execpath'];
        if (!npmExecPath) {
            next(new Error('Start the development server with npm run dev:server to enable test execution'));
            return;
        }

        isRunning = true;
        response.status(200);
        response.set({
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
        });
        response.flushHeaders();

        let finished = false;
        const startedAt = new Date().toISOString();
        const result: LastTestRun = {
            startedAt,
            finishedAt: '',
            exitCode: null,
            stdout: '',
            stderr: '',
            error: null,
        };
        const finish = async (event: TestCommandEvent) => {
            if (finished) {
                return;
            }
            finished = true;
            result.finishedAt = new Date().toISOString();
            if (event.type === 'complete') {
                result.exitCode = event.exitCode;
            } else if (event.type === 'error') {
                result.error = event.message;
            }

            let cacheError: string | null = null;
            try {
                await cacheLastTestRun(cacheDirectory, result);
            } catch (error) {
                cacheError = String(error);
            }

            response.write(`${JSON.stringify(event)}\n`);
            if (cacheError !== null) {
                response.write(`${JSON.stringify({
                    type: 'error',
                    message: `Test run finished but could not be cached: ${cacheError}`,
                })}\n`);
            }
            isRunning = false;
            response.end();
        };

        try {
            execute(process.execPath, [npmExecPath, 'run', 'test:all:coverage'], {
                cwd: process.cwd(),
                timeout: 180_000,
                windowsHide: true,
            }, (event) => {
                if (finished) {
                    return;
                }
                if (event.type === 'stdout') {
                    result.stdout += event.data;
                    response.write(`${JSON.stringify(event)}\n`);
                } else if (event.type === 'stderr') {
                    result.stderr += event.data;
                    response.write(`${JSON.stringify(event)}\n`);
                } else {
                    void finish(event);
                }
            });
        } catch (error) {
            void finish({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unable to start test process',
            });
        }
    };
}

export function createLastTestRunHandler(cacheDirectory = defaultTestDataDirectory): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(cacheDirectory, 'last-test-run.json'), 'utf8')
            .then(contents => response.json({ data: JSON.parse(contents) as LastTestRun }))
            .catch((error: NodeJS.ErrnoException) => {
                if (error.code === 'ENOENT') {
                    response.json({ data: null });
                    return;
                }
                next(error);
            });
    };
}

export function createTestRunCacheStatusHandler(cacheDirectory = defaultTestDataDirectory): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(cacheDirectory, 'last-test-run.json'), 'utf8')
            .then(contents => {
                const result = JSON.parse(contents) as LastTestRun;
                const status: TestRunCacheStatus['status'] = result.error !== null
                    ? 'error'
                    : result.exitCode === 0 ? 'passed' : 'failed';
                response.json({
                    data: {
                        available: true,
                        status,
                        startedAt: result.startedAt,
                        finishedAt: result.finishedAt,
                        exitCode: result.exitCode,
                    } satisfies TestRunCacheStatus,
                });
            })
            .catch((error: NodeJS.ErrnoException) => {
                if (error.code === 'ENOENT') {
                    response.json({
                        data: {
                            available: false,
                            status: 'empty',
                            startedAt: null,
                            finishedAt: null,
                            exitCode: null,
                        } satisfies TestRunCacheStatus,
                    });
                    return;
                }
                next(error);
            });
    };
}
