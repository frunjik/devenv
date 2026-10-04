import { execFile, type ExecFileOptions } from 'node:child_process';
import type { RequestHandler } from 'express';

export type TestCommandEvent =
    | { type: 'stdout' | 'stderr'; data: string }
    | { type: 'complete'; exitCode: number }
    | { type: 'error'; message: string };

export type TestCommandExecutor = (
    command: string,
    args: string[],
    options: ExecFileOptions,
    emit: (event: TestCommandEvent) => void,
) => void;

const executeCommand: TestCommandExecutor = (command, args, options, emit) => {
    const child = execFile(command, args, { ...options, encoding: 'utf8' });
    child.stdout?.on('data', (data: string | Buffer) => {
        emit({ type: 'stdout', data: data.toString() });
    });
    child.stderr?.on('data', (data: string | Buffer) => {
        emit({ type: 'stderr', data: data.toString() });
    });
    child.on('error', (error) => {
        emit({ type: 'error', message: error.message });
    });
    child.on('close', (code) => {
        if (typeof code === 'number') {
            emit({ type: 'complete', exitCode: code });
        }
    });
};

export function createTestRunHandler(execute: TestCommandExecutor = executeCommand): RequestHandler {
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
        const finish = () => {
            if (finished) {
                return;
            }
            finished = true;
            isRunning = false;
            response.end();
        };

        try {
            execute(process.execPath, [npmExecPath, 'run', 'test:all'], {
                cwd: process.cwd(),
                timeout: 180_000,
                windowsHide: true,
            }, (event) => {
                if (finished) {
                    return;
                }
                response.write(`${JSON.stringify(event)}\n`);
                if (event.type === 'complete' || event.type === 'error') {
                    finish();
                }
            });
        } catch (error) {
            response.write(`${JSON.stringify({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unable to start test process',
            })}\n`);
            finish();
        }
    };
}
