import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
    let fixture: ComponentFixture<HistoryComponent>;
    let http: HttpTestingController;

    beforeEach(async () => {
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        await TestBed.configureTestingModule({
            imports: [HistoryComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(HistoryComponent);
        fixture.detectChanges();
    });

    afterEach(() => http.verify());

    it('displays the loaded items', () => {
        http.expectOne('http://localhost:3000/history').flush({ data: ['// [2026-10-05 10:15 +02:00] Did a thing', 'plain line'] });
        fixture.detectChanges();

        const items = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.history-item'));
        expect(items).toHaveLength(2);
        expect(items[0].querySelector('.history-timestamp')!.textContent).toBe('2026-10-05 10:15 +02:00');
        expect(items[0].querySelector('.history-text')!.textContent).toBe('Did a thing');
        expect(items[1].querySelector('.history-timestamp')).toBeNull();
        expect(items[1].querySelector('.history-text')!.textContent).toBe('plain line');
    });

    it('shows an empty message when there is nothing to show', () => {
        http.expectOne('http://localhost:3000/history').flush({ data: [] });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('No history yet.');
    });

    it('shows an error message when loading fails', () => {
        http.expectOne('http://localhost:3000/history').flush({ error: { message: 'boom' } }, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]')!.textContent).toContain('500');
        expect(fixture.nativeElement.textContent).not.toContain('No history yet.');
    });
});