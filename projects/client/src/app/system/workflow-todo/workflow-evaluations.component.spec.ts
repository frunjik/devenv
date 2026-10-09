import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WorkflowEvaluationsComponent } from './workflow-evaluations.component';

describe('WorkflowEvaluationsComponent', () => {
    let fixture: ComponentFixture<WorkflowEvaluationsComponent>;
    let http: HttpTestingController;

    beforeEach(async () => {
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        await TestBed.configureTestingModule({
            imports: [WorkflowEvaluationsComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(WorkflowEvaluationsComponent);
        fixture.detectChanges();
    });

    afterEach(() => http.verify());

    it('shows full evaluation definitions, evidence, and explicit unknown values', () => {
        expect(fixture.nativeElement.textContent).toContain('Loading evaluation data');
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json')
            .flush({ data: JSON.stringify({
                schemaVersion: 1,
                metrics: [{
                    id: 'delivery-flow-and-effort',
                    name: 'Delivery flow and effort',
                    definition: 'Record elapsed time and active effort separately.',
                    interpretation: 'Do not infer effort from tool runtime.',
                }],
                evaluations: [{
                    id: 'evaluation-one',
                    title: 'Diagram selection and movement',
                    beneficiary: 'Diagram editor user',
                    intendedOutcome: 'Move diagram items.',
                    successCondition: 'Dragged position is saved.',
                    baseline: 'Movement did not exist.',
                    startedAt: null,
                    completedAt: null,
                    measures: [{
                        metricId: 'delivery-flow-and-effort',
                        value: null,
                        evidence: null,
                    }],
                }],
            }) });
        fixture.detectChanges();

        const text = fixture.nativeElement.textContent;
        expect(text).toContain('Delivery flow and effort');
        expect(text).toContain('Record elapsed time and active effort separately.');
        expect(text).toContain('Diagram selection and movement');
        expect(text).toContain('Dragged position is saved.');
        expect(text).toContain('Unknown');
        expect(text).toContain('Evidence');
    });

    it('shows elapsed duration for completed evaluations only', () => {
        const evaluation = (
            id: string,
            title: string,
            startedAt: string | null,
            completedAt: string | null,
        ) => ({
            id,
            title,
            beneficiary: 'Developer',
            intendedOutcome: 'Finish a task.',
            successCondition: 'The task is complete.',
            baseline: 'Not complete.',
            startedAt,
            completedAt,
            measures: [{ metricId: 'delivery-flow-and-effort', value: null, evidence: null }],
        });
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json')
            .flush({ data: JSON.stringify({
                schemaVersion: 1,
                metrics: [{
                    id: 'delivery-flow-and-effort',
                    name: 'Delivery flow and effort',
                    definition: 'Record elapsed time and active effort separately.',
                    interpretation: 'Do not infer effort from tool runtime.',
                }],
                evaluations: [
                    evaluation(
                        'completed-evaluation',
                        'Completed item',
                        '2026-10-09T13:22:00+02:00',
                        '2026-10-09T13:38:45+02:00',
                    ),
                    evaluation(
                        'unfinished-evaluation',
                        'Unfinished item',
                        '2026-10-09T13:40:00+02:00',
                        null,
                    ),
                    evaluation('missing-start', 'Missing start', null, '2026-10-09T13:38:45+02:00'),
                    evaluation('invalid-time', 'Invalid timestamp', 'not-a-time', '2026-10-09T13:38:45+02:00'),
                    evaluation(
                        'negative-time',
                        'Completion before start',
                        '2026-10-09T14:00:00+02:00',
                        '2026-10-09T13:38:45+02:00',
                    ),
                    evaluation(
                        'long-duration',
                        'Long duration',
                        '2026-10-09T13:22:00+02:00',
                        '2026-10-09T14:38:45+02:00',
                    ),
                    evaluation(
                        'zero-duration',
                        'Zero duration',
                        '2026-10-09T13:22:00+02:00',
                        '2026-10-09T13:22:00+02:00',
                    ),
                ],
            }) });
        fixture.detectChanges();

        const text = fixture.nativeElement.textContent as string;
        expect(text).toContain('Elapsed duration: 16m 45s');
        expect(text).toContain('Elapsed duration: Unknown');
        expect(text).toContain('Elapsed duration: Unavailable (invalid timestamp)');
        expect(text).toContain('Elapsed duration: Unavailable (completion precedes start)');
        expect(text).toContain('Elapsed duration: 1h 16m 45s');
        expect(text).toContain('Elapsed duration: 0m 0s');
        expect(text.match(/Elapsed duration:/g)).toHaveLength(6);
        const unfinished = Array.from(
            fixture.nativeElement.querySelectorAll('.work-evaluation') as NodeListOf<HTMLElement>,
        ).find(section => section.querySelector('h2')?.textContent?.trim() === 'Unfinished item');
        expect(unfinished).toBeDefined();
        expect(unfinished?.textContent).not.toContain('Elapsed duration:');
    });

    it('reports evaluation file loading failures', () => {
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json')
            .flush({}, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
    });

    it.each(['{', '{"schemaVersion":1,"metrics":[],"evaluations":[]}'])(
        'reports invalid evaluation data',
        contents => {
            http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json')
                .flush({ data: contents });
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
            expect(fixture.nativeElement.textContent).not.toContain('Loading evaluation data');
        },
    );
});
