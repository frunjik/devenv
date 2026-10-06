import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import type {
    DataKind,
    GitCommitResult,
    GitLogEntry,
    GitStatus,
    LastTestRun,
    FolderEntry,
    NewProblemTicket,
    ProblemTicketId,
    StoredTicket,
    TicketChangeEvent,
    TicketCommand,
    TicketContent,
    TicketEditEvent,
    TicketHistoryEvent,
    SuccessResponseBody,
    TestOutputStream,
    TestRunCacheStatus,
} from '@shared';
import { LoggerService } from './logger.service';

export type {
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

    private readonly defaultHost = 'http://localhost:3000/';
    private readonly httpService = inject(HttpClient);
    private readonly logger = inject(LoggerService);

    get host(): string {
        return (window as Window & { host?: string }).host ?? this.defaultHost;
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
        return this.post<string, { data: string }>(`files?path=${pathname}`, { data: contents })
            .pipe(
                catchError(err => {
                    this.logError(`saveFile("${pathname}")`, err);
                    return throwError(() => err);
                })
            );
    }

    loadFolder(pathname: string): Observable<FolderEntry[]> {
        return this.get<FolderEntry[]>(`folders?path=${pathname}`)
            .pipe(
                catchError(err => {
                    this.logError(`loadFolder("${pathname}")`, err);
                    return throwError(() => err);
                })
            );
    }

    commitChanges(message: string): Observable<GitCommitResult> {
        return this.post<GitCommitResult, { message: string }>('git/commit', { message });
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

    getGlossary(): Observable<string[]> {
        return this.get<string[]>('glossary');
    }

    getServerVersion(): Observable<string> {
        return this.get<string>('version');
    }

    listTickets(): Observable<StoredTicket[]> {
        return this.get<StoredTicket[]>('tickets');
    }

    createTicket(ticket: NewProblemTicket, dataKind: DataKind = 'sample'): Observable<StoredTicket> {
        return this.post<StoredTicket, { ticket: NewProblemTicket; dataKind: DataKind }>(
            'tickets', { ticket, dataKind });
    }

    changeTicket(
        id: ProblemTicketId,
        command: TicketCommand,
        expectedVersion: number,
    ): Observable<{ ticket: StoredTicket; event: TicketChangeEvent }> {
        return this.post<{ ticket: StoredTicket; event: TicketChangeEvent },
            { command: TicketCommand; expectedVersion: number }>(
            `tickets/${encodeURIComponent(id)}/changes`, { command, expectedVersion });
    }

    editTicket(
        id: ProblemTicketId,
        content: TicketContent,
        expectedVersion: number,
    ): Observable<{ ticket: StoredTicket; event: TicketEditEvent }> {
        return this.post<{ ticket: StoredTicket; event: TicketEditEvent },
            { content: TicketContent; expectedVersion: number }>(
            `tickets/${encodeURIComponent(id)}/edits`, { content, expectedVersion });
    }

    getTicketHistory(id: ProblemTicketId): Observable<TicketHistoryEvent[]> {
        return this.get<TicketHistoryEvent[]>(`tickets/${encodeURIComponent(id)}/history`);
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
        return this.httpService.get<SuccessResponseBody<T>>(this.host + resource)
            .pipe(
                map(data => data.data),
            );
    }

    private post<TResponse, TRequest>(resource: string, data: TRequest): Observable<TResponse> {
        return this.httpService.post<SuccessResponseBody<TResponse>>(this.host + resource, data)
            .pipe(
                map(data => data.data),
            );
    }
}
