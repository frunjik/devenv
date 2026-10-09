import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import type {
    DataKind,
    DevEnvCloneRequest,
    DevEnvCloneResult,
    GitCommitResult,
    GitLogEntry,
    GitStatus,
    LastTestRun,
    FolderEntry,
    GlossaryEntry,
    NewProblemTicket,
    ProblemTicketId,
    RgrPhase,
    StoredTicket,
    TicketChangeEvent,
    TicketCommand,
    TicketContent,
    TicketEditEvent,
    TicketHistoryEvent,
    SuccessResponseBody,
    SystemPlanConcern,
    TestRunCacheStatus,
    WorkflowTodoList,
} from '@shared';
import { LoggerService } from './logger.service';

export type {
    GitCommitResult,
    GitLogEntry,
    GitStatus,
    LastTestRun,
    RgrPhase,
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

    getRgrPhase(): Observable<RgrPhase | null> {
        return this.get<RgrPhase | null>('rgr-phase');
    }

    getGlossary(): Observable<GlossaryEntry[]> {
        return this.get<GlossaryEntry[]>('glossary');
    }

    getSystemPlan(): Observable<SystemPlanConcern[]> {
        return this.get<SystemPlanConcern[]>('system-plan');
    }

    getWorkflowTodo(): Observable<WorkflowTodoList> {
        return this.get<WorkflowTodoList>('workflow-todo');
    }

    cloneDevEnv(request: DevEnvCloneRequest): Observable<DevEnvCloneResult> {
        return this.post<DevEnvCloneResult, DevEnvCloneRequest>('devenv/clone', request);
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
