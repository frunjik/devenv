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
            expect(text).toContain(workflow.resumeLabel);
            expect(text).toContain(workflow.relatedConcern);
        }
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

    it('opens a workflow document read-only and preserves its checkpoint reference', () => {
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows } });
        fixture.detectChanges();
        fixture.nativeElement.querySelector('.resume-button').click();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Loading document');
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\glossary-refinement.md')
            .flush({ data: '# Glossary Refinement\n\n## Checkpoint\nNext: MetaExport <script>not HTML</script>' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('pre').textContent).toContain('<script>not HTML</script>');
        expect(fixture.nativeElement.querySelector('script')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('./glossary-refinement.md#checkpoint');
        expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
    });

    it('clears the previous document and reports document failures explicitly', () => {
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows } });
        fixture.detectChanges();
        const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.resume-button'));
        buttons[0].click();
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\glossary-refinement.md').flush({ data: 'Old document' });
        buttons[1].click();
        http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-export-workflow.md')
            .flush({}, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
        expect(fixture.nativeElement.textContent).not.toContain('Old document');
        expect(fixture.nativeElement.textContent).not.toContain('Loading document');
    });

    it('loads a generated practice checkpoint relative to the workflow list', () => {
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows: [] } });
        fixture.componentInstance.openDocument('../practices/portable-practices-checklist.generated.md#checkpoint');
        http.expectOne('http://localhost:3000/files?path=knowledge\\practices\\portable-practices-checklist.generated.md')
            .flush({ data: '# Checklist' });
        expect(fixture.componentInstance.documentText).toBe('# Checklist');
    });

    it('shows an empty message only after a successful empty response', () => {
        expect(fixture.nativeElement.textContent).not.toContain('No workflows registered');
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows: [] } });
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('No workflows registered');
    });

    it('cancels obsolete document loads and outstanding requests on destruction', () => {
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows } });
        fixture.detectChanges();
        const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.resume-button'));
        buttons[0].click();
        const oldRequest = http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\glossary-refinement.md');
        buttons[1].click();
        expect(oldRequest.cancelled).toBe(true);
        const currentRequest = http.expectOne('http://localhost:3000/files?path=knowledge\\workflows\\devenv-export-workflow.md');
        fixture.destroy();
        expect(currentRequest.cancelled).toBe(true);
    });

    it('reports list loading failures without presenting an empty success', () => {
        http.expectOne('http://localhost:3000/workflow-todo').flush({}, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
        expect(fixture.nativeElement.textContent).not.toContain('No workflows registered');
        expect(fixture.nativeElement.textContent).not.toContain('Loading workflows');
    });
});
