import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom, type Observable } from 'rxjs';
import type { NewProblemTicket } from '@shared';
import { BackendService } from './backend.service';
import { LoggerService } from './logger.service';

describe('BackendService', () => {
    let service: BackendService;
    let http: HttpTestingController;
    const apiHost = 'http://localhost:3000/';
    const browserWindow = window as Window & { host?: string };
    const logError = jest.fn<LoggerService['error']>();

    beforeEach(() => {
        logError.mockReset();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: LoggerService, useValue: { error: logError } },
            ],
        });
        service = TestBed.inject(BackendService);
        http = TestBed.inject(HttpTestingController);
        browserWindow.host = apiHost;
    });

    afterEach(() => {
        http.verify();
        delete browserWindow.host;
    });

    it('uses the default host when no runtime host is configured', () => {
        delete browserWindow.host;
        expect(service.host).toBe(apiHost);
    });

    it('uses the configured runtime host for API requests', async () => {
        browserWindow.host = 'http://configured-host/';
        const result = firstValueFrom(service.getServerVersion());
        http.expectOne('http://configured-host/version').flush({ data: '1.2.3' });
        await expect(result).resolves.toBe('1.2.3');
    });

    it.each<[string, () => Observable<unknown>, unknown]>([
        ['version', () => service.getServerVersion(), '1.2.3'],
        ['git/log', () => service.getGitLog(), [{ hash: 'abc', author: 'Ada', date: '2026-10-09', subject: 'Update' }]],
        ['current', () => service.getCurrentEntry(), '// latest entry'],
        ['current', () => service.getCurrentEntry(), null],
        ['rgr-phase', () => service.getRgrPhase(), 'refactor'],
        ['rgr-phase', () => service.getRgrPhase(), null],
        ['tests/cache/status', () => service.getTestRunCacheStatus(), {
            available: true, status: 'passed', startedAt: null, finishedAt: null, exitCode: 0,
        }],
        ['tests/last', () => service.getLastTestRun(), {
            startedAt: '2026-10-04T12:00:00.000Z', finishedAt: '2026-10-04T12:01:00.000Z',
            exitCode: 1, stdout: 'Failed assertion details', stderr: 'Coverage threshold not met', error: null,
        }],
        ['files?path=sample.txt', () => service.loadFile('sample.txt'), 'initial'],
        ['folders?path=.', () => service.loadFolder('.'), [{ filename: 'sample.txt', isFolder: false }]],
    ])('loads the response data from %s', async (resource, load, data) => {
        const result = firstValueFrom(load());
        const request = http.expectOne(apiHost + resource);
        expect(request.request.method).toBe('GET');
        request.flush({ data });
        await expect(result).resolves.toEqual(data);
    });

    it.each<[string, string, () => Observable<unknown>, string]>([
        ['loadFile', 'files?path=missing.txt', () => service.loadFile('missing.txt'), 'loadFile("missing.txt")'],
        ['saveFile', 'files?path=missing/file.txt', () => service.saveFile('missing/file.txt', 'updated'), 'saveFile("missing/file.txt")'],
        ['loadFolder', 'folders?path=missing', () => service.loadFolder('missing'), 'loadFolder("missing")'],
    ])('logs and preserves %s failures', async (_operation, resource, invoke, context) => {
        const result = firstValueFrom(invoke());
        const assertion = expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
        http.expectOne(apiHost + resource).flush({ error: { message: 'Unavailable' } }, {
            status: 500, statusText: 'Internal Server Error',
        });
        await assertion;
        expect(logError).toHaveBeenCalledWith(`ERROR BackendService.${context}`, expect.any(HttpErrorResponse));
    });

    it('sends file contents and unwraps the save response', async () => {
        const result = firstValueFrom(service.saveFile('sample.txt', 'updated'));
        const request = http.expectOne(apiHost + 'files?path=sample.txt');
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ data: 'updated' });
        request.flush({ data: 'OK' });
        await expect(result).resolves.toBe('OK');
    });

    describe('tickets', () => {
        const newTicket: NewProblemTicket = {
            title: 'Pick list is wrong', report: 'Pickers get the wrong aisle.',
            problem: { condition: 'Wrong aisle', affected: 'Pickers', impact: 'Delays' },
            scope: { level: 'workflow', label: 'Picking' },
            context: { people: [], places: [], things: [] },
            reportedBy: 'Ada', reportedAt: '2026-10-06T10:00:00.000Z',
        };

        it.each(['real', 'sample'] as const)('creates a %s ticket with the correct request', async dataKind => {
            const result = firstValueFrom(dataKind === 'sample'
                ? service.createTicket(newTicket) : service.createTicket(newTicket, dataKind));
            const request = http.expectOne(apiHost + 'tickets');
            expect(request.request.method).toBe('POST');
            expect(request.request.body).toEqual({ ticket: newTicket, dataKind });
            const stored = { ...newTicket, id: 'T-1', version: 1, dataKind, status: { state: 'open' } };
            request.flush({ data: stored });
            await expect(result).resolves.toEqual(stored);
        });

        it('lists stored tickets', async () => {
            const result = firstValueFrom(service.listTickets());
            const request = http.expectOne(apiHost + 'tickets');
            expect(request.request.method).toBe('GET');
            request.flush({ data: [newTicket] });
            await expect(result).resolves.toEqual([newTicket]);
        });

        it('sends versioned commands using an encoded ticket ID', async () => {
            const command = { kind: 'assign', assigneeId: 'user-2' } as const;
            const result = firstValueFrom(service.changeTicket('T/1', command, 1));
            const request = http.expectOne(apiHost + 'tickets/T%2F1/changes');
            expect(request.request.method).toBe('POST');
            expect(request.request.body).toEqual({ command, expectedVersion: 1 });
            const changed = { ticket: { ...newTicket, version: 2 }, event: { kind: 'assign' } };
            request.flush({ data: changed });
            await expect(result).resolves.toEqual(changed);
        });

        it('sends versioned edits using an encoded ticket ID', async () => {
            const content = {
                title: 'Better title', report: newTicket.report, problem: newTicket.problem, scope: newTicket.scope,
            };
            const result = firstValueFrom(service.editTicket('T/1', content, 1));
            const request = http.expectOne(apiHost + 'tickets/T%2F1/edits');
            expect(request.request.method).toBe('POST');
            expect(request.request.body).toEqual({ content, expectedVersion: 1 });
            const edited = { ticket: { ...newTicket, ...content, version: 2 }, event: { kind: 'edit' } };
            request.flush({ data: edited });
            await expect(result).resolves.toEqual(edited);
        });

        it('loads history using an encoded ticket ID', async () => {
            const result = firstValueFrom(service.getTicketHistory('T/1'));
            const request = http.expectOne(apiHost + 'tickets/T%2F1/history');
            expect(request.request.method).toBe('GET');
            request.flush({ data: [{ kind: 'edit' }] });
            await expect(result).resolves.toEqual([{ kind: 'edit' }]);
        });

        it('preserves stale-version conflicts and the current ticket', async () => {
            const result = firstValueFrom(service.changeTicket('T-1', { kind: 'resolve' }, 1));
            const assertion = expect(result).rejects.toMatchObject({
                status: 409, error: { error: { current: { version: 2 } } },
            });
            http.expectOne(apiHost + 'tickets/T-1/changes').flush({
                error: { current: { version: 2 } },
            }, { status: 409, statusText: 'Conflict' });
            await assertion;
        });
    });
});
