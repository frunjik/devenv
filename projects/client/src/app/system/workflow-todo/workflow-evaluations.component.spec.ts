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
        const evaluation = fixture.nativeElement.querySelector('details.work-evaluation') as HTMLDetailsElement;
        expect(evaluation.open).toBe(false);
        expect(evaluation.querySelector('summary')!.textContent).toContain('Not completed');
        expect(fixture.nativeElement.querySelector('details.metric-definitions').open).toBe(false);
        expect(fixture.nativeElement.querySelector('details.credit-estimator').open).toBe(false);
        const header = fixture.nativeElement.querySelector('.evaluation-columns') as HTMLElement;
        expect(Array.from(header.children).map(column => column.textContent?.trim())).toEqual([
            'Title', 'Status', 'Duration',
        ]);
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
        const durations = Array.from(
            fixture.nativeElement.querySelectorAll('.work-evaluation .evaluation-duration') as NodeListOf<HTMLElement>,
        ).map(duration => duration.textContent?.trim());
        expect(durations).toEqual([
            '16m 45s', '—', 'Unknown', 'Unavailable (invalid timestamp)',
            'Unavailable (completion precedes start)', '01h 16m 45s', '00m 00s',
        ]);
        expect(text).not.toContain('Elapsed duration:');
        const unfinished = Array.from(
            fixture.nativeElement.querySelectorAll('.work-evaluation') as NodeListOf<HTMLElement>,
        ).find(section => section.querySelector('h2')?.textContent?.trim() === 'Unfinished item');
        expect(unfinished).toBeDefined();
        expect(unfinished?.textContent).not.toContain('Elapsed duration:');
        const completed = fixture.nativeElement.querySelector('.work-evaluation summary') as HTMLElement;
        expect(completed.querySelector('.evaluation-status')!.textContent).toBe('Completed');
        expect(completed.querySelector('.evaluation-duration')!.textContent?.trim()).toBe('16m 45s');
    });

    it('reports evaluation file loading failures', () => {
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json')
            .flush({}, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
    });

    it('estimates credits from imported Copilot token usage', () => {
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
                    title: 'Sample evaluation',
                    beneficiary: 'Developer',
                    intendedOutcome: 'Estimate model usage.',
                    successCondition: 'Show an estimated credit total.',
                    baseline: 'No estimate.',
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

        expect(fixture.nativeElement.textContent).toContain('Copilot AI credit estimate');
        expect(fixture.componentInstance.estimatedAiCredits).toBe(0);
        expect(fixture.componentInstance.estimatedUsdCost).toBe(0);
        fixture.componentInstance.updateTokenUsage(new Event('input'));
        expect(fixture.componentInstance.tokenUsageJson).toBe('');
        const usageInput = fixture.nativeElement.querySelector(
            'textarea[aria-label="Copilot token usage JSON"]',
        ) as HTMLTextAreaElement;
        usageInput.value = JSON.stringify([{
            model: 'gpt-5.4',
            uncachedInputTokens: 1000000,
            outputTokens: 0,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
        }]);
        usageInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        (fixture.nativeElement.querySelector('button[aria-label="Estimate AI credits"]') as HTMLButtonElement)
            .click();
        fixture.detectChanges();

        const estimatorText = fixture.nativeElement.textContent as string;
        expect(estimatorText).toContain('Estimated AI credits: 500');
        expect(estimatorText).toContain('uncachedInputTokens');
        expect(estimatorText).toContain('non-overlapping');
        expect(estimatorText).toContain('Gemini 3.7 and 3.8 Flash promotional pricing through 2026-12-31');
        usageInput.value = '{';
        usageInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        (fixture.nativeElement.querySelector('button[aria-label="Estimate AI credits"]') as HTMLButtonElement)
            .click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent.trim()).not.toBe('');
        expect(fixture.nativeElement.textContent).not.toContain('Estimated AI credits:');
        usageInput.value = JSON.stringify([{
            model: 'unknown-model',
            uncachedInputTokens: 10,
            outputTokens: 5,
        }]);
        usageInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        (fixture.nativeElement.querySelector('button[aria-label="Estimate AI credits"]') as HTMLButtonElement)
            .click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
            .toContain('No pricing snapshot is available');
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
