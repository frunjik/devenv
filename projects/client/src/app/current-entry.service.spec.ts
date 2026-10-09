import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CurrentEntryService } from './current-entry.service';
import { SCHEDULER } from './scheduler';
import type { IScheduler } from './scheduler';

describe('CurrentEntryService polling', () => {
    let service: CurrentEntryService;
    let http: HttpTestingController;
    let every: jest.MockedFunction<IScheduler['every']>;
    let cancel: jest.MockedFunction<() => void>;
    let tick: () => void;

    beforeEach(() => {
        let callback: (() => void) | undefined;
        cancel = jest.fn(() => {
            callback = undefined;
        });
        every = jest.fn<IScheduler['every']>((milliseconds, scheduledCallback) => {
            callback = scheduledCallback;
            return cancel;
        });
        tick = () => callback?.();
        const scheduler: IScheduler = { every };
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(), provideHttpClientTesting(),
                { provide: SCHEDULER, useValue: scheduler },
            ],
        });
        service = TestBed.inject(CurrentEntryService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        service.stopPolling();
        http.verify();
    });

    it('refreshes immediately and schedules ticks every 30 seconds', () => {
        service.startPolling();
        expect(every).toHaveBeenCalledWith(30_000, expect.any(Function));
        http.expectOne('http://localhost:3000/current').flush({ data: 'Initial entry' });
        expect(service.entry).toBe('Initial entry');
    });

    it('does not refresh or schedule again when already polling', () => {
        service.startPolling();
        http.expectOne('http://localhost:3000/current').flush({ data: 'Initial entry' });
        service.startPolling();
        expect(every).toHaveBeenCalledTimes(1);
        http.expectNone('http://localhost:3000/current');
    });

    it('refreshes on a scheduled tick', () => {
        service.startPolling();
        http.expectOne('http://localhost:3000/current').flush({ data: 'Initial entry' });
        tick();
        http.expectOne('http://localhost:3000/current').flush({ data: 'Updated entry' });
        expect(service.entry).toBe('Updated entry');
    });

    it('can stop before polling starts', () => {
        service.stopPolling();
        expect(cancel).not.toHaveBeenCalled();
        expect(every).not.toHaveBeenCalled();
        http.expectNone('http://localhost:3000/current');
    });

    it('cancels once and stops ticks when stopped repeatedly', () => {
        service.startPolling();
        http.expectOne('http://localhost:3000/current').flush({ data: 'Initial entry' });
        service.stopPolling();
        service.stopPolling();
        expect(cancel).toHaveBeenCalledTimes(1);
        tick();
        http.expectNone('http://localhost:3000/current');
    });

    it('refreshes and schedules again after stopping', () => {
        service.startPolling();
        http.expectOne('http://localhost:3000/current').flush({ data: 'Initial entry' });
        service.stopPolling();
        service.startPolling();
        expect(every).toHaveBeenCalledTimes(2);
        http.expectOne('http://localhost:3000/current').flush({ data: 'Restarted entry' });
        expect(service.entry).toBe('Restarted entry');
    });

    it('clears a stale entry and exposes a refresh error', () => {
        service.entry = 'Stale entry';
        service.refresh();
        http.expectOne('http://localhost:3000/current').flush(
            { error: 'Unavailable' }, { status: 500, statusText: 'Unavailable' },
        );
        expect(service.entry).toBeNull();
        expect(service.errorMessage).toContain('500');
    });

    it('updates the entry and clears a previous error on successful refresh', () => {
        service.errorMessage = 'Previous error';
        service.refresh();
        http.expectOne('http://localhost:3000/current').flush({ data: 'Recovered entry' });
        expect(service.entry).toBe('Recovered entry');
        expect(service.errorMessage).toBe('');
    });

    it.each([
        [null, ''],
        ['', ''],
        ['{"description":"Feature summary"}', 'Feature summary'],
        ['null', 'null'],
        ['42', '42'],
        ['{}', '{}'],
        ['{"description":42}', '{"description":42}'],
        ['// [2026-10-10 01:00 +02:00] Legacy summary', 'Legacy summary'],
        ['Plain text', 'Plain text'],
    ])('summarizes current entry %s', (entry, expected) => {
        service.entry = entry;
        expect(service.summary).toBe(expected);
    });
});
