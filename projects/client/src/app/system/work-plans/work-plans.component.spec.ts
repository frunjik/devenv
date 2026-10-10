import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { WorkPlansComponent } from './work-plans.component';

const registryUrl = 'http://localhost:3000/files?path=knowledge\\workflows\\work-plans.json';
const ledgerUrl = 'http://localhost:3000/files?path=knowledge\\workflows\\devenv-value-evaluation.json';

const ledger = {
    schemaVersion: 1,
    metrics: [{ id: 'outcome-and-quality', name: 'Outcome', definition: 'Result achieved.', interpretation: 'Observed only.' }],
    evaluations: [{
        id: 'mock-reuse',
        title: 'Mock reuse',
        beneficiary: 'Developer',
        intendedOutcome: 'Shared mocks.',
        successCondition: 'Both suites use them.',
        baseline: 'Separate mocks.',
        startedAt: null,
        completedAt: null,
        measures: [{ metricId: 'outcome-and-quality', value: null, evidence: null }],
    }],
};

function registry(task: Record<string, unknown>) {
    return {
        schemaVersion: 2,
        workPlans: [{
            id: 'test-boundary-mocks',
            title: 'Test Boundary Mocks',
            description: 'Reusable test doubles.',
            topics: [{
                id: 'cross-runtime',
                title: 'Cross-runtime test boundaries',
                description: 'Filesystem and HTTP doubles.',
                tasks: [{
                    id: 'shared-doubles',
                    title: 'Create shared test doubles',
                    description: 'Reuse or create doubles for both suites.',
                    status: 'Active',
                    measurement: 'Measured',
                    evaluationIds: ['mock-reuse'],
                    ...task,
                }],
            }],
        }],
    };
}

describe('WorkPlansComponent', () => {
    let fixture: ComponentFixture<WorkPlansComponent>;
    let http: HttpTestingController;

    beforeEach(async () => {
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        await TestBed.configureTestingModule({
            imports: [WorkPlansComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(WorkPlansComponent);
        fixture.detectChanges();
    });

    afterEach(() => http.verify());

    function respond(registryValue: unknown, ledgerValue: unknown = ledger): void {
        http.expectOne(registryUrl).flush({ data: JSON.stringify(registryValue) });
        http.expectOne(ledgerUrl).flush({ data: JSON.stringify(ledgerValue) });
        fixture.detectChanges();
    }

    it('shows the WorkPlan hierarchy with task status, measurement and linked evaluations', () => {
        expect(fixture.nativeElement.textContent).toContain('Loading WorkPlans');
        respond(registry({}));

        const page = fixture.nativeElement as HTMLElement;
        expect(page.querySelector('.work-plans')?.classList.contains('layout-page')).toBe(true);
        expect(page.querySelector('h2')?.textContent).toContain('Test Boundary Mocks');
        const topic = page.querySelector('details.work-topic') as HTMLDetailsElement;
        expect(topic.open).toBe(false);
        const topicSummary = topic.querySelector('summary') as HTMLElement;
        expect(topicSummary.querySelector('h3')?.textContent).toContain('Cross-runtime test boundaries');
        expect(topicSummary.querySelector('.work-topic-count')?.textContent?.trim()).toBe('1 task');
        expect(topic.textContent).toContain('Filesystem and HTTP doubles.');
        const task = topic.querySelector('.work-task') as HTMLElement;
        const header = task.querySelector('header') as HTMLElement;
        expect(header.querySelector('h4')?.textContent).toContain('Create shared test doubles');
        expect(header.textContent).toContain('Reuse or create doubles for both suites.');
        expect(header.querySelector('.work-task-status')?.textContent?.trim()).toBe('Active');
        expect(header.querySelector('.work-task-measurement')?.textContent?.trim()).toBe('Measured');
        const link = task.querySelector('a') as HTMLAnchorElement;
        expect(link.getAttribute('href')).toBe('/workflow-evaluations');
        expect(link.textContent?.trim()).toBe('mock-reuse');
        expect(page.querySelector('[role="status"]')).toBeNull();
    });

    it('counts several tasks in a topic header', () => {
        const value = registry({});
        const tasks = value.workPlans[0].topics[0].tasks;
        tasks.push({ ...tasks[0], id: 'second-task', title: 'Second task' });
        respond(value);
        expect(fixture.nativeElement.querySelector('.work-topic-count')?.textContent?.trim()).toBe('2 tasks');
        expect(fixture.nativeElement.querySelectorAll('.work-task')).toHaveLength(2);
    });

    it('omits the evaluation list for unmeasured tasks and says when no plans exist', () => {
        respond(registry({ measurement: 'NotMeasured', evaluationIds: [] }));
        const task = fixture.nativeElement.querySelector('.work-task') as HTMLElement;
        expect(task.querySelector('.work-task-measurement')?.textContent?.trim()).toBe('NotMeasured');
        expect(task.querySelector('.work-task-evaluations')).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('No WorkPlans recorded');

        fixture = TestBed.createComponent(WorkPlansComponent);
        fixture.detectChanges();
        respond({ schemaVersion: 2, workPlans: [] });
        expect(fixture.nativeElement.textContent).toContain('No WorkPlans recorded');
    });

    it('reports invalid registries and unknown evaluation links instead of showing data', () => {
        respond(registry({ evaluationIds: ['missing-evaluation'] }));
        const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
        expect(alert.textContent).toContain('unknown evaluation "missing-evaluation"');
        expect(fixture.nativeElement.querySelector('.work-task')).toBeNull();
        expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    });

    it('reports load failures', () => {
        http.expectOne(registryUrl).flush({ data: JSON.stringify(registry({})) });
        http.expectOne(ledgerUrl).flush({}, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Could not load WorkPlans');
        expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    });
});
