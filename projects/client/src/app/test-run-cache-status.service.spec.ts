import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TestRunCacheStatusService } from './test-run-cache-status.service';

describe('TestRunCacheStatusService', () => {
    let http: HttpTestingController;
    let service: TestRunCacheStatusService;

    beforeEach(() => {
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        http = TestBed.inject(HttpTestingController);
        service = TestBed.inject(TestRunCacheStatusService);
    });

    afterEach(() => http.verify());

    it('loads the most recent cached test status', () => {
        service.refresh();

        expect(service.isLoading).toBe(true);
        expect(service.error).toBe('');
        http.expectOne('http://localhost:3000/tests/cache/status').flush({
            data: {
                available: true,
                status: 'passed',
                startedAt: '2026-10-04T12:00:00.000Z',
                finishedAt: '2026-10-04T12:01:00.000Z',
                exitCode: 0,
            },
        });

        expect(service.status?.status).toBe('passed');
        expect(service.isLoading).toBe(false);
    });

    it('records a cache status retrieval error', () => {
        service.refresh();
        http.expectOne('http://localhost:3000/tests/cache/status').flush(
            { error: { message: 'Cache unavailable' } },
            { status: 500, statusText: 'Error' },
        );

        expect(service.error).toContain('Cache unavailable');
        expect(service.isLoading).toBe(false);
    });
});
