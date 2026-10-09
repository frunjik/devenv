import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { TestOutputStream } from '@shared';
import { BackendService } from './backend.service';

@Injectable({
    providedIn: 'root',
})
export class TestRunnerService {
    private readonly backend = inject(BackendService);

    async runTests(onOutput: (stream: TestOutputStream, chunk: string) => void): Promise<number> {
        const response = await fetch(this.backend.host + 'tests/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        });

        if (!response.ok) {
            const responseBody = await response.text();
            let errorBody: unknown = responseBody;
            try {
                errorBody = JSON.parse(responseBody);
            } catch {
                // Preserve the response text when the server returns a non-JSON error.
            }
            throw new HttpErrorResponse({
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                error: errorBody,
            });
        }

        if (!response.body) {
            throw new Error('The server did not provide a test output stream');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pendingLine = '';
        let exitCode: number | undefined;

        const processLine = (line: string) => {
            if (!line.trim()) {
                return;
            }

            const event: unknown = JSON.parse(line);
            if (!event || typeof event !== 'object' || !('type' in event)) {
                throw new Error('The server sent an invalid test output event');
            }
            if ((event.type === 'stdout' || event.type === 'stderr')
                && 'data' in event && typeof event.data === 'string') {
                onOutput(event.type, event.data);
            } else if (event.type === 'complete' && 'exitCode' in event
                && typeof event.exitCode === 'number') {
                exitCode = event.exitCode;
            } else if (event.type === 'error' && 'message' in event
                && typeof event.message === 'string') {
                throw new Error(event.message);
            } else {
                throw new Error('The server sent an invalid test output event');
            }
        };

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                pendingLine += decoder.decode();
                processLine(pendingLine);
                break;
            }
            pendingLine += decoder.decode(value, { stream: true });
            const lines = pendingLine.split('\n');
            pendingLine = lines.pop()!;
            lines.forEach(processLine);
        }

        if (exitCode === undefined) {
            throw new Error('The test output stream ended before the run completed');
        }
        return exitCode;
    }
}
