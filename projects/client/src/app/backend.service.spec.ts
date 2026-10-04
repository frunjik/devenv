import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';

import { BackendService } from './backend.service';
import { LoggerService } from './logger.service';
import { startServer } from '../../../server/src/public-api';

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

    it('assigns the default Medium priority when adding a feature without selecting one', async () => {
        const entry = await service.addFeature('Feature with default priority').toPromise();

        expect(entry).toMatch(/\[Medium\] \[Backlog\] Feature with default priority$/);
        await rm(join(root, '.features'), { force: true });
    });

    it('loads the cached test result status through the public API', async () => {
        const status = await service.getTestRunCacheStatus().toPromise();

        expect(status).toMatchObject({
            available: expect.any(Boolean),
            status: expect.stringMatching(/^(empty|passed|failed|error)$/),
        });
        expect(status.startedAt === null || typeof status.startedAt === 'string').toBe(true);
        expect(status.finishedAt === null || typeof status.finishedAt === 'string').toBe(true);
        expect(status.exitCode === null || typeof status.exitCode === 'number').toBe(true);
    });

    it('loads file contents from the API', async () => {
        await expect(service.loadFile('sample.txt').toPromise()).resolves.toBe('initial');
    });

    it('returns empty contents when file loading fails', async () => {
        await expect(service.loadFile('missing.txt').toPromise()).resolves.toBe('');
    });

    it('saves file contents through the API', async () => {
        await expect(service.saveFile('sample.txt', 'updated').toPromise()).resolves.toBe('OK');
    });

    it('returns an empty result when file saving fails', async () => {
        await expect(service.saveFile('missing/file.txt', 'updated').toPromise()).resolves.toBe('');
    });

    it('loads folder entries from the API', async () => {
        const entries = await service.loadFolder('.').toPromise();
        expect(entries).toEqual(expect.arrayContaining([
            { filename: 'sample.txt', isFolder: false },
        ]));
    });

    it('returns an empty list when folder loading fails', async () => {
        await expect(service.loadFolder('missing').toPromise()).resolves.toEqual([]);
    });
});
