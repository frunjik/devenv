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
import { SCHEDULER } from '../scheduler';
import type { IScheduler } from '../scheduler';

class MockScheduler implements IScheduler {
    interval: number | undefined;
    private callback: (() => void) | undefined;

    every(milliseconds: number, callback: () => void): () => void {
        this.interval = milliseconds;
        this.callback = callback;
        return () => {
            this.callback = undefined;
        };
    }

    tick(): void {
        this.callback?.();
    }
}

describe('StatusToolbarComponent', () => {
    it('loads the selected workflow, refreshes on click and every 30 seconds, and stops on destruction', () => {
        const scheduler = new MockScheduler();
        TestBed.configureTestingModule({
            imports: [StatusToolbarComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
                { provide: SCHEDULER, useValue: scheduler }],
        });
        const fixture = TestBed.createComponent(StatusToolbarComponent);
        fixture.componentRef.setInput('gitStatus', TestBed.inject(GitStatusService));
        fixture.componentRef.setInput('currentEntry', TestBed.inject(CurrentEntryService));
        fixture.componentRef.setInput('testRunCacheStatus', TestBed.inject(TestRunCacheStatusService));
        fixture.componentRef.setInput('rgrPhase', TestBed.inject(RgrPhaseService));
        fixture.detectChanges();
        const http = TestBed.inject(HttpTestingController);
        http.expectOne('http://localhost:3000/version').flush({ data: '0.0.1' });
        const button = fixture.nativeElement.querySelector('[aria-label="Refresh active workflow"]') as HTMLButtonElement;
        expect(button).not.toBeNull();
        expect(button.textContent).toContain('Loading');
        const initial = http.expectOne('http://localhost:3000/workflow-todo');
        button.click();
        expect(initial.cancelled).toBe(true);
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { activeWorkflow: 'InteractiveCanvas Prototype (provisional)' } });
        fixture.detectChanges();
        expect(button.textContent).toContain('InteractiveCanvas Prototype (provisional)');
        button.click();
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { activeWorkflow: null } });
        fixture.detectChanges();
        expect(button.textContent).toContain('None active');
        expect(scheduler.interval).toBe(30_000);
        scheduler.tick();
        http.expectOne('http://localhost:3000/workflow-todo').flush({ error: 'Unavailable' }, { status: 500, statusText: 'Unavailable' });
        fixture.detectChanges();
        expect(button.textContent).toContain('unavailable');
        scheduler.tick();
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { activeWorkflow: 'Recovered workflow' } });
        fixture.detectChanges();
        expect(button.textContent).toContain('Recovered workflow');
        button.click();
        const pending = http.expectOne('http://localhost:3000/workflow-todo');
        fixture.destroy();
        expect(pending.cancelled).toBe(true);
        scheduler.tick();
        http.expectNone('http://localhost:3000/workflow-todo');
        http.verify();
    });
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
        TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/workflow-todo')
            .flush({ data: { activeWorkflow: null } });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[aria-label="Client busy"]')).toBeNull();
    });

    it('hides the current task control while retaining the workflow display and version errors', () => {
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

        expect(fixture.nativeElement.querySelector('[aria-label="Refresh current task"]')).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('Current task');
        expect(fixture.nativeElement.querySelector('[aria-label="Refresh active workflow"]')).not.toBeNull();
        TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/version')
            .flush({ error: 'Unavailable' }, { status: 500, statusText: 'Unavailable' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.version-info').textContent).toContain('Server vunavailable');
    });

    it('labels an unrecorded TDD phase as idle before the test status', () => {
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
        expect(phase.textContent.trim()).toBe('TDD: idle');
        expect(phase.getAttribute('aria-label')).toBe('Red-Green-Refactor phase: idle');
        expect(fixture.nativeElement.querySelector('.workflow-refresh').textContent.trim()).toBe('Refresh');
        expect(phase.compareDocumentPosition(fixture.nativeElement.querySelector('.test-run-status'))
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
        expect(phase.textContent.trim()).toBe('TDD: red');
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
        expect(phase.textContent.trim()).toBe('TDD: unavailable');
        expect(phase.classList).toContain('rgr-phase-error');
    });
});
