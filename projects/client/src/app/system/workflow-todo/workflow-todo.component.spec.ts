import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WorkflowTodoComponent } from './workflow-todo.component';

describe('WorkflowTodoComponent', () => {
    let fixture: ComponentFixture<WorkflowTodoComponent>;
    let http: HttpTestingController;
    const workflows = [
        { name: 'Glossary Refinement', primaryWorkPurpose: 'Meta work', status: 'Active', resumeLabel: 'Current checkpoint',
            resumePath: './glossary-refinement.md#checkpoint', relatedConcern: 'SC-027; SC-049' },
        { name: 'DevEnv Export', primaryWorkPurpose: 'Product work', status: 'Pending', resumeLabel: 'Starting checkpoint',
            resumePath: './devenv-export-workflow.md#checkpoint', relatedConcern: 'Not assigned' },
    ];

    beforeEach(async () => {
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        await TestBed.configureTestingModule({
            imports: [WorkflowTodoComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(WorkflowTodoComponent);
        fixture.detectChanges();
    });
    afterEach(() => http.verify());

    it('shows loading, then all JSON fields and the active workflow', () => {
        expect(fixture.nativeElement.textContent).toContain('Loading workflows');
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows } });
        fixture.detectChanges();
        const text = fixture.nativeElement.textContent;
        for (const workflow of workflows) {
            expect(text).toContain(workflow.name);
            expect(text).toContain(workflow.primaryWorkPurpose);
            expect(text).toContain(workflow.status);
            expect(text).toContain(workflow.relatedConcern);
        }
        expect(text).not.toContain('Resume reference');
        expect(text).not.toContain('Current checkpoint');
        expect(fixture.nativeElement.querySelector('.resume-button')).toBeNull();
        expect(fixture.nativeElement.querySelectorAll('tr.active').length).toBe(1);
        expect(text).not.toContain('Loading workflows');
    });

    it('shows evaluation metrics from the typed data file and labels unavailable values Unknown', () => {
        const metricWorkflow = {
            name: 'DevEnv Value Evaluation',
            status: 'Active',
            resumeLabel: 'Measurement-feasibility pilot',
            resumePath: './devenv-value-evaluation-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        };
        http.expectOne('http://localhost:3000/workflow-todo')
            .flush({ data: { workflows: [...workflows, metricWorkflow] } });
        fixture.detectChanges();
        const loadingMetrics = fixture.nativeElement.querySelector(
            '[aria-label="DevEnv value evaluation metrics"]',
        ) as HTMLElement;
        expect((loadingMetrics.querySelector('[role="status"]') as HTMLElement).textContent)
            .toContain('Loading evaluation metrics');
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json')
            .flush({ data: JSON.stringify({
                schemaVersion: 1,
                metrics: [{
                    id: 'delivery-flow-and-effort',
                    name: 'Delivery flow and effort',
                    definition: 'Record delivery elapsed time and active effort separately.',
                    interpretation: 'Do not infer active effort from tool runtime.',
                }],
                evaluations: [{
                    id: 'metrics-workflow-todo-view',
                    title: 'Show current evaluation metrics in the Workflow TODO view',
                    beneficiary: 'DevEnv developer',
                    intendedOutcome: 'Current metric definitions and work observations are visible.',
                    successCondition: 'Known values and explicit Unknown values are distinguishable.',
                    baseline: 'The Workflow TODO view showed no evaluation metrics.',
                    startedAt: '2026-10-09T13:40:17+02:00',
                    completedAt: null,
                    measures: [{
                        metricId: 'delivery-flow-and-effort',
                        value: null,
                        evidence: null,
                    }],
                }],
            }) });
        fixture.detectChanges();

        const metrics = fixture.nativeElement.querySelector(
            '[aria-label="DevEnv value evaluation metrics"]',
        ) as HTMLElement;
        expect(metrics.textContent).toContain('Delivery flow and effort');
        expect(metrics.textContent).toContain('Record delivery elapsed time and active effort separately.');
        expect(metrics.textContent).toContain('Show current evaluation metrics in the Workflow TODO view');
        expect(metrics.textContent).toContain('Unknown');
    });

    it('reports evaluation data load failures instead of presenting an empty dataset', () => {
        const metricWorkflow = {
            name: 'DevEnv Value Evaluation',
            status: 'Active',
            resumeLabel: 'Measurement-feasibility pilot',
            resumePath: './devenv-value-evaluation-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        };
        http.expectOne('http://localhost:3000/workflow-todo')
            .flush({ data: { workflows: [metricWorkflow] } });
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json')
            .flush({}, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();

        const metrics = fixture.nativeElement.querySelector(
            '[aria-label="DevEnv value evaluation metrics"]',
        ) as HTMLElement;
        expect((metrics.querySelector('[role="alert"]') as HTMLElement).textContent).toContain('500');
        expect(metrics.textContent).not.toContain('Loading evaluation metrics');
        expect(metrics.querySelector('table')).toBeNull();
    });

    it.each([
        { label: 'invalid JSON', contents: '{', expectedError: 'SyntaxError:' },
        {
            label: 'invalid evaluation data',
            contents: '{"schemaVersion":1,"metrics":[],"evaluations":[]}',
            expectedError: 'Invalid WorkEvaluationDataset',
        },
    ])('reports $label from the evaluation data file', ({ contents, expectedError }) => {
        const metricWorkflow = {
            name: 'DevEnv Value Evaluation',
            status: 'Active',
            resumeLabel: 'Measurement-feasibility pilot',
            resumePath: './devenv-value-evaluation-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        };
        http.expectOne('http://localhost:3000/workflow-todo')
            .flush({ data: { workflows: [metricWorkflow] } });
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json')
            .flush({ data: contents });
        fixture.detectChanges();

        const metrics = fixture.nativeElement.querySelector(
            '[aria-label="DevEnv value evaluation metrics"]',
        ) as HTMLElement;
        expect(metrics.getAttribute('aria-live')).toBe('polite');
        expect((metrics.querySelector('[role="alert"]') as HTMLElement).textContent)
            .toContain(expectedError);
        expect(metrics.textContent).not.toContain('Loading evaluation metrics');
    });

    it('provides a visible, accessible cue for horizontally scrolling the workflow table', () => {
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows } });
        fixture.detectChanges();
        const tableScroll = fixture.nativeElement.querySelector('.table-scroll') as HTMLElement;
        const hint = fixture.nativeElement.querySelector('#workflow-table-scroll-hint') as HTMLElement;

        expect(tableScroll.getAttribute('aria-describedby')).toBe('workflow-table-scroll-hint');
        expect(hint.textContent).toContain('Swipe or scroll horizontally to see all workflow details.');
    });

    it('shows an empty message only after a successful empty response', () => {
        expect(fixture.nativeElement.textContent).not.toContain('No workflows registered');
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows: [] } });
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('No workflows registered');
    });

    it('cancels outstanding evaluation data requests on destruction', () => {
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: {
            workflows: [{
                name: 'DevEnv Value Evaluation',
                primaryWorkPurpose: 'Meta work',
                status: 'Active',
                resumeLabel: 'Checkpoint',
                resumePath: './devenv-value-evaluation-workflow.md#checkpoint',
                relatedConcern: 'Not assigned',
            }],
        } });
        fixture.detectChanges();
        const request = http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json');
        fixture.destroy();
        expect(request.cancelled).toBe(true);
    });

    it('reports list loading failures without presenting an empty success', () => {
        http.expectOne('http://localhost:3000/workflow-todo').flush({}, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
        expect(fixture.nativeElement.textContent).not.toContain('No workflows registered');
        expect(fixture.nativeElement.textContent).not.toContain('Loading workflows');
    });
});
