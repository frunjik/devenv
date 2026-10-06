import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RgrPhaseService } from './rgr-phase.service';

describe('RgrPhaseService', () => {
    let service: RgrPhaseService;
    let http: HttpTestingController;

    beforeEach(() => {
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(RgrPhaseService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        service.stopPolling();
        http.verify();
        jest.useRealTimers();
    });

    it('starts with no known phase', () => {
        expect(service.phase).toBeNull();
        expect(service.errorMessage).toBe('');
    });

    it('polls the phase endpoint and avoids duplicate polling subscriptions', () => {
        service.startPolling();
        service.startPolling();

        http.expectOne('http://localhost:3000/rgr-phase').flush({ data: 'green' });
        http.expectNone('http://localhost:3000/rgr-phase');

        expect(service.phase).toBe('green');

        service.stopPolling();
        service.stopPolling();
    });

    it('refreshes the phase every 30 seconds while polling', () => {
        jest.useFakeTimers();
        service.startPolling();
        http.expectOne('http://localhost:3000/rgr-phase').flush({ data: 'red' });

        jest.advanceTimersByTime(30_000);
        http.expectOne('http://localhost:3000/rgr-phase').flush({ data: 'refactor' });

        expect(service.phase).toBe('refactor');
    });

    it('stops polling safely before it has started', () => {
        service.stopPolling();

        http.expectNone('http://localhost:3000/rgr-phase');
        expect(service.phase).toBeNull();
    });

    it('records an error when the phase cannot be loaded', () => {
        service.refresh();
        http.expectOne('http://localhost:3000/rgr-phase').flush(
            { error: { message: 'Phase unavailable' } },
            { status: 500, statusText: 'Error' },
        );

        expect(service.phase).toBeNull();
        expect(service.errorMessage).toContain('Http failure response');
    });
});
