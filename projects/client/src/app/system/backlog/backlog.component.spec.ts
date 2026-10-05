import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BacklogComponent } from './backlog.component';

describe('BacklogComponent', () => {
    let fixture: ComponentFixture<BacklogComponent>;
    let http: HttpTestingController;

    beforeEach(async () => {
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        await TestBed.configureTestingModule({
            imports: [BacklogComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(BacklogComponent);
        fixture.detectChanges();
    });

    afterEach(() => http.verify());

    it('displays the loaded items', () => {
        http.expectOne('http://localhost:3000/backlog').flush({ data: [{ id: '123e4567-e89b-42d3-a456-426614174000', priority: 'High', status: 'Queued', description: 'Backlog item' }] });
        fixture.detectChanges();

        const feature = fixture.nativeElement.querySelector('.backlog-feature');
        expect(feature.querySelector('.backlog-feature-id').textContent).toBe('123e4567');
        expect(feature.querySelector('.backlog-feature-priority').textContent).toBe('High');
        expect(feature.querySelector('.backlog-feature-status').textContent).toBe('Queued');
        expect(feature.querySelector('.backlog-feature-description').textContent).toBe('Backlog item');
    });

    it('shows an empty message when there is nothing to show', () => {
        http.expectOne('http://localhost:3000/backlog').flush({ data: [] });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('The backlog is empty.');
    });

    it('shows an error message when loading fails', () => {
        http.expectOne('http://localhost:3000/backlog').flush({ error: { message: 'boom' } }, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
        expect(fixture.nativeElement.textContent).not.toContain('The backlog is empty.');
    });
});