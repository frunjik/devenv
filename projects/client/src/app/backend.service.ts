import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import type {
    FeaturePriority,
    FeatureStatus,
    GitCommitResult,
    GitLogEntry,
    GitStatus,
    LastTestRun,
    PPTField,
    PPTFolderEntry,
    SuccessResponseBody,
    TestOutputStream,
    TestRunCacheStatus,
} from '@shared';
import { LoggerService } from './logger.service';

export type {
    FeaturePriority,
    FeatureStatus,
    GitCommitResult,
    GitLogEntry,
    GitStatus,
    LastTestRun,
    TestOutputStream,
    TestRunCacheStatus,
} from '@shared';

@Injectable({
    providedIn: 'root',
})
export class BackendService {

    private defaultHost = 'http://localhost:3000/';
    private httpservice = inject(HttpClient);
    private logger = inject(LoggerService);

    constructor() { }

    get host(): string {
        return (((window as unknown) as any).host) ?? this.defaultHost
    }

    loadFile(pathname: string): Observable<string> {
        return this.get<string>(`files?path=${pathname}`)
            .pipe(
                catchError(err => {
                    this.logError(`loadFile("${pathname}")`, err);
                    return throwError(() => err);
                })
            );
    }

    saveFile(pathname: string, contents: string): Observable<string> {
        return this.post<any>(`files?path=${pathname}`, {data: contents})
            .pipe(
                catchError(err => {
                    this.logError(`saveFile("${pathname}")`, err);
                    return throwError(() => err);
                })
            );
    }

    loadFolder(pathname: string): Observable<PPTFolderEntry[]> {
        return this.get<PPTFolderEntry[]>(`folders?path=${pathname}`)
            .pipe(
                catchError(err => {
                    this.logError(`loadFolder("${pathname}")`, err);
                    return throwError(() => err);
                })
            );
    }

    commitChanges(message: string): Observable<GitCommitResult> {
        return this.post<GitCommitResult>('git/commit', { message });
    }

    addFeature(
        description: string,
        priority: FeaturePriority = 'Low',
        status: FeatureStatus = 'Backlog',
    ): Observable<string> {
        return this.post<string>('features', { description, priority, status });
    }

    updateFeatureDescription(id: string, description: string): Observable<string> {
        return this.httpservice.patch<SuccessResponseBody<string>>(
            `${this.host}features/${encodeURIComponent(id)}/description`,
            { description },
        ).pipe(map(response => response.data));
    }

    updateFeaturePriority(id: string, priority: FeaturePriority): Observable<string> {
        return this.httpservice.patch<SuccessResponseBody<string>>(
            `${this.host}features/${encodeURIComponent(id)}`,
            { priority },
        ).pipe(map(response => response.data));
    }

    moveInProgressFeature(id: string, direction: 'up' | 'down'): Observable<string[]> {
        return this.httpservice.patch<SuccessResponseBody<string[]>>(
            `${this.host}features/${encodeURIComponent(id)}/order`,
            { direction },
        ).pipe(map(response => response.data));
    }

    updateFeatureStatus(id: string, status: FeatureStatus): Observable<string> {
        return this.httpservice.patch<SuccessResponseBody<string>>(
            `${this.host}features/${encodeURIComponent(id)}/status`,
            { status },
        ).pipe(map(response => response.data));
    }

    startFeature(id: string): Observable<string> {
        return this.httpservice.post<SuccessResponseBody<string>>(
            `${this.host}features/${encodeURIComponent(id)}/start`,
            {},
        ).pipe(map(response => response.data));
    }

    getFeatures(): Observable<string[]> {
        return this.get<string[]>('features');
    }

    removeFeature(id: string): Observable<string> {
        return this.httpservice.delete<SuccessResponseBody<string>>(
            `${this.host}features/${encodeURIComponent(id)}`,
        ).pipe(map(response => response.data));
    }

    getGitLog(): Observable<GitLogEntry[]> {
        return this.get<GitLogEntry[]>('git/log');
    }

    getGitStatus(): Observable<GitStatus> {
        return this.get<GitStatus>('git/status');
    }

    getCurrentEntry(): Observable<string | null> {
        return this.get<string | null>('current');
    }

    getServerVersion(): Observable<string> {
        return this.get<string>('version');
    }

    getPPTFields(): Observable<PPTField[]> {
        return this.get<PPTField[]>('ppt/fields');
    }

    getCurrentTask(): Observable<string | null> {
        return this.get<string | null>('task');
    }

    getTestRunCacheStatus(): Observable<TestRunCacheStatus> {
        return this.get<TestRunCacheStatus>('tests/cache/status');
    }

    getLastTestRun(): Observable<LastTestRun | null> {
        return this.get<LastTestRun | null>('tests/last');
    }

    async runTests(onOutput: (stream: TestOutputStream, chunk: string) => void): Promise<number> {
        const response = await fetch(this.host + 'tests/run', {
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

    logError(message: string, e: Error) {
        this.logger.error(`ERROR BackendService.${message}`, e);
    }


    private get<T>(resource: string): Observable<T> {
        return this.httpservice.get<SuccessResponseBody<T>>(this.host + resource)
            .pipe(
                map(data => data.data),
            );
    }

    private post<T>(resource: string, data: any): Observable<T> {
        return this.httpservice.post<SuccessResponseBody<T>>(this.host + resource, data)
            .pipe(
                map(data => data.data),
            );
    }
}
