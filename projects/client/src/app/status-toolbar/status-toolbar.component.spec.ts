import { describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { StatusToolbarComponent } from './status-toolbar.component';
import { GitStatusService } from '../git-status.service';
import { CurrentEntryService } from '../current-entry.service';
import { RgrPhaseService } from '../rgr-phase.service';
import { TestRunCacheStatusService } from '../test-run-cache-status.service';
import { busyIndicatorInterceptor } from '../busy-indicator.interceptor';

describe('StatusToolbarComponent', () => {
    it('shows a busy indicator while an HTTP request is pending', () => {
        TestBed.configureTestingModule({
            imports: [StatusToolbarComponent],
            providers: [
                provideHttpClient(withInterceptors([busyIndicatorInterceptor])),
                provideHttpClientTesting(),
                provideRouter([]),
            ],
        });

        const fixture = TestBed.createComponent(StatusToolbarComponent);
        fixture.componentRef.setInput('gitStatus', TestBed.inject(GitStatusService));
        fixture.componentRef.setInput('currentEntry', TestBed.inject(CurrentEntryService));
        fixture.componentRef.setInput('testRunCacheStatus', TestBed.inject(TestRunCacheStatusService));
        fixture.componentRef.setInput('rgrPhase', TestBed.inject(RgrPhaseService));
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[aria-label="Client busy"]')).not.toBeNull();

        const request = TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/version');
        request.flush({ data: '0.0.1' });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[aria-label="Client busy"]')).toBeNull();
    });

    it('shows no placeholder text while the current task is not known', () => {
        TestBed.configureTestingModule({
            imports: [StatusToolbarComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
        });

        const fixture = TestBed.createComponent(StatusToolbarComponent);
        fixture.componentRef.setInput('gitStatus', TestBed.inject(GitStatusService));
        fixture.componentRef.setInput('currentEntry', TestBed.inject(CurrentEntryService));
        fixture.componentRef.setInput('testRunCacheStatus', TestBed.inject(TestRunCacheStatusService));
        fixture.componentRef.setInput('rgrPhase', TestBed.inject(RgrPhaseService));
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.current-entry-summary').textContent.trim()).toBe('');
        expect(fixture.nativeElement.textContent).not.toContain('Loading current');
    });

    it('shows "not set" next to the current task when no phase is recorded', () => {
        TestBed.configureTestingModule({
            imports: [StatusToolbarComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
        });

        const fixture = TestBed.createComponent(StatusToolbarComponent);
        fixture.componentRef.setInput('gitStatus', TestBed.inject(GitStatusService));
        fixture.componentRef.setInput('currentEntry', TestBed.inject(CurrentEntryService));
        fixture.componentRef.setInput('testRunCacheStatus', TestBed.inject(TestRunCacheStatusService));
        fixture.componentRef.setInput('rgrPhase', TestBed.inject(RgrPhaseService));
        fixture.detectChanges();

        const phase = fixture.nativeElement.querySelector('.rgr-phase');
        expect(phase.textContent.trim()).toBe('not set');
        expect(phase.getAttribute('aria-label')).toBe('Red-Green-Refactor phase: not set');
        expect(phase.compareDocumentPosition(fixture.nativeElement.querySelector('.current-entry'))
            & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('shows the recorded phase and colors it accordingly', () => {
        TestBed.configureTestingModule({
            imports: [StatusToolbarComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
        });

        const fixture = TestBed.createComponent(StatusToolbarComponent);
        fixture.componentRef.setInput('gitStatus', TestBed.inject(GitStatusService));
        fixture.componentRef.setInput('currentEntry', TestBed.inject(CurrentEntryService));
        fixture.componentRef.setInput('testRunCacheStatus', TestBed.inject(TestRunCacheStatusService));
        const rgrPhase = TestBed.inject(RgrPhaseService);
        rgrPhase.phase = 'red';
        fixture.componentRef.setInput('rgrPhase', rgrPhase);
        fixture.detectChanges();

        const phase = fixture.nativeElement.querySelector('.rgr-phase');
        expect(phase.textContent.trim()).toBe('red');
        expect(phase.classList).toContain('rgr-phase-red');
    });

    it('shows a phase loading error', () => {
        TestBed.configureTestingModule({
            imports: [StatusToolbarComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
        });

        const fixture = TestBed.createComponent(StatusToolbarComponent);
        fixture.componentRef.setInput('gitStatus', TestBed.inject(GitStatusService));
        fixture.componentRef.setInput('currentEntry', TestBed.inject(CurrentEntryService));
        fixture.componentRef.setInput('testRunCacheStatus', TestBed.inject(TestRunCacheStatusService));
        const rgrPhase = TestBed.inject(RgrPhaseService);
        rgrPhase.errorMessage = 'Phase unavailable';
        fixture.componentRef.setInput('rgrPhase', rgrPhase);
        fixture.detectChanges();

        const phase = fixture.nativeElement.querySelector('.rgr-phase');
        expect(phase.textContent.trim()).toBe('unavailable');
        expect(phase.classList).toContain('rgr-phase-error');
    });
});

