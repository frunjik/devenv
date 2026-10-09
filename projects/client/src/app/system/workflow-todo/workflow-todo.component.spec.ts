import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
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
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(WorkflowTodoComponent);
        fixture.detectChanges();
    });
    afterEach(() => http.verify());

    it('shows loading, then all JSON fields and the active workflow', () => {
        expect(fixture.nativeElement.textContent).toContain('Loading workflows');
        expect(fixture.componentInstance.metricSummary).toEqual([]);
        expect(fixture.componentInstance.completedEvaluationSummary('Minimal Typed Diagram Editor')).toBe('—');
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows } });
        fixture.detectChanges();
        const text = fixture.nativeElement.textContent;
        for (const workflow of workflows) {
            expect(text).toContain(workflow.name);
            expect(text).toContain(workflow.primaryWorkPurpose);
            expect(text).toContain(workflow.status);
            expect(text).toContain(workflow.relatedConcern);
        }
        const groups = fixture.nativeElement.querySelectorAll('.workflow-group') as NodeListOf<HTMLElement>;
        expect(groups).toHaveLength(2);
        expect(groups[0].querySelector('h2')?.textContent).toContain('End-user tools and capabilities');
        expect(groups[1].querySelector('h2')?.textContent).toContain('DevEnv meta work');
        expect(groups[0].textContent).toContain('DevEnv Export');
        expect(groups[0].textContent).not.toContain('Glossary Refinement');
        expect(groups[1].textContent).toContain('Glossary Refinement');
        expect(groups[1].textContent).not.toContain('DevEnv Export');
        expect(text).not.toContain('Resume reference');
        expect(text).not.toContain('Current checkpoint');
        expect(fixture.nativeElement.querySelector('.resume-button')).toBeNull();
        expect(text).not.toContain('Show current evaluation metrics in the Workflow TODO view');
        expect(fixture.nativeElement.querySelectorAll('tr.active').length).toBe(1);
        expect(text).not.toContain('Loading workflows');
    });

    it('uses the same explicit column sizing for product and meta workflow tables', () => {
        http.expectOne('http://localhost:3000/workflow-todo').flush({ data: { workflows } });
        fixture.detectChanges();

        const workflowTables = Array.from(
            fixture.nativeElement.querySelectorAll('.workflow-group table') as NodeListOf<HTMLTableElement>,
        );
        expect(workflowTables).toHaveLength(2);
        const columnClasses = workflowTables.map(table =>
            Array.from(table.querySelectorAll('colgroup col') as NodeListOf<HTMLTableColElement>)
                .map(column => column.className),
        );
        expect(columnClasses[0]).toEqual([
            'workflow-name-column',
            'workflow-purpose-column',
            'workflow-status-column',
            'workflow-concern-column',
            'workflow-evaluation-column',
        ]);
        expect(columnClasses[1]).toEqual(columnClasses[0]);
    });

    it('shows a metric availability summary and links to evaluation details', () => {
        const metricWorkflow = {
            name: 'DevEnv Value Evaluation',
            primaryWorkPurpose: 'Meta work',
            status: 'Active',
            resumeLabel: 'Measurement-feasibility pilot',
            resumePath: './devenv-value-evaluation-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        };
        const diagramWorkflow = {
            name: 'Minimal Typed Diagram Editor',
            primaryWorkPurpose: 'Product work',
            status: 'Paused',
            resumeLabel: 'Document-operations checkpoint',
            resumePath: './diagram-editor-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        };
        const todoViewWorkflow = {
            name: 'TODO View (DevEnv system layer)',
            primaryWorkPurpose: 'Meta work',
            status: 'Completed',
            resumeLabel: 'Implementation and review checkpoint',
            resumePath: './todo-view-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        };
        http.expectOne('http://localhost:3000/workflow-todo')
            .flush({ data: { workflows: [...workflows, metricWorkflow, diagramWorkflow, todoViewWorkflow] } });
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
                }, {
                    id: 'outcome-and-quality',
                    name: 'Outcome and quality',
                    definition: 'Check agreed results and rework.',
                    interpretation: 'Tests do not establish user impact.',
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
                    }, {
                        metricId: 'outcome-and-quality',
                        value: 'Passed acceptance checks.',
                        evidence: 'Client tests.',
                    }],
                }, {
                    id: 'workflow-todo-value-metrics-view',
                    title: 'Show current evaluation metrics on the Workflow TODO view',
                    beneficiary: 'DevEnv developers reviewing current work and evidence',
                    intendedOutcome: 'Display metric definitions and current work evaluations.',
                    successCondition: 'Known values and explicit Unknown values are distinguishable.',
                    baseline: 'The Workflow TODO view showed no evaluation metrics.',
                    startedAt: '2026-10-09T13:40:17+02:00',
                    completedAt: '2026-10-09T13:59:12+02:00',
                    measures: [{
                        metricId: 'delivery-flow-and-effort',
                        value: 'About 19 minutes wall-clock; active effort is unknown.',
                        evidence: 'Recorded start and completion timestamps.',
                    }, {
                        metricId: 'outcome-and-quality',
                        value: 'Passed acceptance checks.',
                        evidence: 'Client tests.',
                    }],
                }, {
                    id: 'diagram-selection-and-movement',
                    title: 'Diagram selection and movement',
                    beneficiary: 'Developer using the diagram editor',
                    intendedOutcome: 'Select diagram items and reposition them by dragging.',
                    successCondition: 'Dragging an item updates its persisted diagram coordinates.',
                    baseline: 'Selection and movement were not implemented.',
                    startedAt: '2026-10-09T13:22:00+02:00',
                    completedAt: '2026-10-09T13:38:45+02:00',
                    measures: [{
                        metricId: 'delivery-flow-and-effort',
                        value: null,
                        evidence: null,
                    }, {
                        metricId: 'outcome-and-quality',
                        value: 'Passed acceptance checks.',
                        evidence: 'Client tests.',
                    }],
                }],
            }) });
        fixture.detectChanges();

        const metrics = fixture.nativeElement.querySelector(
            '[aria-label="DevEnv value evaluation metrics"]',
        ) as HTMLElement;
        expect(metrics.textContent).toContain('Delivery flow and effort');
        expect(metrics.textContent).toContain('Outcome and quality');
        expect(metrics.textContent).toContain('Metric availability across 3 work evaluations');
        expect(metrics.textContent).toContain('Recorded evaluations');
        expect(metrics.textContent).toContain('Unknown evaluations');
        expect(metrics.textContent).toContain('0');
        expect(metrics.textContent).toContain('2');
        const metricRows = Array.from(metrics.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
        expect(metricRows[0].textContent).toContain('Delivery flow and effort');
        expect(metricRows[0].textContent).toContain('1');
        expect(metricRows[0].textContent).toContain('2');
        expect(metricRows[1].textContent).toContain('Outcome and quality');
        expect(metricRows[1].textContent).toContain('3');
        expect(metricRows[1].textContent).toContain('0');
        expect(metrics.textContent).not.toContain('Show current evaluation metrics in the Workflow TODO view');
        expect(metrics.querySelector('a[href="/workflow-evaluations"]')).not.toBeNull();
        const workflowRows = Array.from(
            fixture.nativeElement.querySelectorAll('.workflow-group tbody tr') as NodeListOf<HTMLTableRowElement>,
        );
        const diagramRow = workflowRows.find(row => row.querySelector('th')?.textContent?.trim()
            === 'Minimal Typed Diagram Editor');
        const todoViewRow = workflowRows.find(row => row.querySelector('th')?.textContent?.trim()
            === 'TODO View (DevEnv system layer)');
        const evaluationPilotRow = workflowRows.find(row => row.querySelector('th')?.textContent?.trim()
            === 'DevEnv Value Evaluation');
        expect(diagramRow?.textContent).toContain('Diagram selection and movement (16m 45s)');
        expect(todoViewRow?.textContent)
            .toContain('Show current evaluation metrics on the Workflow TODO view (18m 55s)');
        expect(evaluationPilotRow?.textContent).toContain('—');
        expect(fixture.nativeElement.querySelector('.completed-evaluations')).toBeNull();

        const todoViewEvaluation = fixture.componentInstance.evaluationDataset?.evaluations.find(
            evaluation => evaluation.id === 'workflow-todo-value-metrics-view',
        );
        expect(todoViewEvaluation).toBeDefined();
        if (todoViewEvaluation) {
            todoViewEvaluation.completedAt = null;
            expect(fixture.componentInstance.completedEvaluationSummary('TODO View (DevEnv system layer)'))
                .toBe('—');
        }
    });

    it('reports evaluation data load failures instead of presenting an empty dataset', () => {
        const metricWorkflow = {
            name: 'DevEnv Value Evaluation',
            primaryWorkPurpose: 'Meta work',
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
            primaryWorkPurpose: 'Meta work',
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
