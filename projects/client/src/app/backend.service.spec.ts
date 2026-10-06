import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { firstValueFrom } from 'rxjs';
import type { Server } from 'node:http';
import type { NewProblemTicket } from '@shared';

import { BackendService } from './backend.service';
import { LoggerService } from './logger.service';
import { createApp, startServer } from '../../../server/src/public-api';

describe('BackendService', () => {
    let service: BackendService;
    let root: string;
    let server: Server;
    let apiHost: string;
    const browserWindow = window as Window & { host?: string };

    beforeAll(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-client-api-'));
        await writeFile(join(root, 'sample.txt'), 'initial');
        server = await startServer(root, 0);
        const address = server.address();
        if (!address || typeof address === 'string') {
            throw new Error('Test server did not bind to a TCP port');
        }
        apiHost = `http://127.0.0.1:${address.port}/`;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                {
                    provide: LoggerService,
                    useValue: { error: (_message: string, _error: Error) => undefined },
                },
            ],
        });
        service = TestBed.inject(BackendService);
        browserWindow.host = apiHost;
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
        await rm(root, { recursive: true, force: true });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('uses the default host when no runtime host is configured', () => {
        delete browserWindow.host;
        expect(service.host).toBe('http://localhost:3000/');
    });

    it('uses the configured runtime host', () => {
        expect(service.host).toBe(apiHost);
    });

    it('loads the server version from the public API', async () => {
        await expect(service.getServerVersion().toPromise()).resolves.toMatch(/^\d+\.\d+\.\d+/);
    });

    it('loads recent commit entries from the git log API', async () => {
        const entries = await service.getGitLog().toPromise();

        expect(entries).toEqual(expect.any(Array));
        expect(entries?.every(entry =>
            typeof entry.hash === 'string'
            && typeof entry.author === 'string'
            && typeof entry.date === 'string'
            && typeof entry.subject === 'string',
        )).toBe(true);
    });

    it('loads the latest nonempty current entry from the API', async () => {
        await writeFile(join(root, '.current'), 'Current\n// previous entry\n// latest entry\n');

        await expect(service.getCurrentEntry().toPromise()).resolves.toBe('// latest entry');
    });

    it('returns null from the API when the current entry file is missing', async () => {
        await rm(join(root, '.current'), { force: true });

        await expect(service.getCurrentEntry().toPromise()).resolves.toBeNull();
    });

    it('loads the cached test result status through the public API', async () => {
        const status = (await service.getTestRunCacheStatus().toPromise())!;

        expect(status).toMatchObject({
            available: expect.any(Boolean),
            status: expect.stringMatching(/^(empty|passed|failed|error)$/),
        });
        expect(status.startedAt === null || typeof status.startedAt === 'string').toBe(true);
        expect(status.finishedAt === null || typeof status.finishedAt === 'string').toBe(true);
        expect(status.exitCode === null || typeof status.exitCode === 'number').toBe(true);
    });

    it('loads the complete cached test result through the public API', async () => {
        const cacheDirectory = join(root, 'last-test-run-client-api');
        await mkdir(cacheDirectory);
        const cachedRun = {
            startedAt: '2026-10-04T12:00:00.000Z',
            finishedAt: '2026-10-04T12:01:00.000Z',
            exitCode: 1,
            stdout: 'Failed assertion details',
            stderr: 'Coverage threshold not met',
            error: null,
        };
        await writeFile(join(cacheDirectory, 'last-test-run.json'), JSON.stringify(cachedRun));
        const cachedResultServer = createServer(createApp(root, { testRunCacheDirectory: cacheDirectory }));
        await new Promise<void>(resolve => cachedResultServer.listen(0, resolve));
        const address = cachedResultServer.address();
        if (!address || typeof address === 'string') {
            throw new Error('Test server did not bind to a TCP port');
        }
        browserWindow.host = `http://127.0.0.1:${address.port}/`;

        try {
            await expect(service.getLastTestRun().toPromise()).resolves.toEqual(cachedRun);
        } finally {
            await new Promise<void>((resolve, reject) => {
                cachedResultServer.close(error => error ? reject(error) : resolve());
            });
            browserWindow.host = apiHost;
            await rm(cacheDirectory, { recursive: true, force: true });
        }
    });

    it('loads file contents from the API', async () => {
        await expect(service.loadFile('sample.txt').toPromise()).resolves.toBe('initial');
    });

    it('preserves file loading errors', async () => {
        await expect(firstValueFrom(service.loadFile('missing.txt')))
            .rejects.toBeInstanceOf(HttpErrorResponse);
    });

    it('saves file contents through the API', async () => {
        await expect(service.saveFile('sample.txt', 'updated').toPromise()).resolves.toBe('OK');
    });

    it('preserves file saving errors', async () => {
        await expect(firstValueFrom(service.saveFile('missing/file.txt', 'updated')))
            .rejects.toBeInstanceOf(HttpErrorResponse);
    });

    it('loads folder entries from the API', async () => {
        const entries = await service.loadFolder('.').toPromise();
        expect(entries).toEqual(expect.arrayContaining([
            { filename: 'sample.txt', isFolder: false },
        ]));
    });

    it('preserves folder loading errors', async () => {
        await expect(firstValueFrom(service.loadFolder('missing')))
            .rejects.toBeInstanceOf(HttpErrorResponse);
    });

    describe('tickets', () => {
        const newTicket: NewProblemTicket = {
            title: 'Pick list is wrong',
            report: 'Pickers get the wrong aisle.',
            problem: { condition: 'Wrong aisle', affected: 'Pickers', impact: 'Delays' },
            scope: { level: 'workflow', label: 'Picking' },
            context: { people: [], places: [], things: [] },
            reportedBy: 'Ada',
            reportedAt: '2026-10-06T10:00:00.000Z',
        };

        it('creates, lists, changes, and reads the history of a ticket through the API', async () => {
            const created = await firstValueFrom(service.createTicket(newTicket, 'real'));
            const listed = await firstValueFrom(service.listTickets());
            const changed = await firstValueFrom(
                service.changeTicket(created.id, { kind: 'assign', assigneeId: 'user-2' }, created.version));
            const history = await firstValueFrom(service.getTicketHistory(created.id));

            expect(created).toMatchObject({ status: { state: 'open' }, version: 1, dataKind: 'real' });
            expect(listed.map(ticket => ticket.id)).toContain(created.id);
            expect(changed.ticket).toMatchObject({ version: 2, status: { state: 'assigned', assigneeId: 'user-2' } });
            expect(history).toEqual([changed.event]);
        });

        it('defaults new tickets to sample data', async () => {
            const created = await firstValueFrom(service.createTicket(newTicket));

            expect(created.dataKind).toBe('sample');
        });

        it('preserves stale-version conflicts with the current ticket', async () => {
            const created = await firstValueFrom(service.createTicket(newTicket));
            await firstValueFrom(service.changeTicket(created.id, { kind: 'assign', assigneeId: 'u' }, 1));

            const error = await firstValueFrom(service.changeTicket(created.id, { kind: 'resolve' }, 1))
                .catch(e => e as HttpErrorResponse);

            expect(error).toBeInstanceOf(HttpErrorResponse);
            expect((error as HttpErrorResponse).status).toBe(409);
            expect((error as HttpErrorResponse).error.error.current.version).toBe(2);
        });
    });
});
