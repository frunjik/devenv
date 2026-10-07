import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WorkflowTodoComponent } from './workflow-todo.component';

describe('WorkflowTodoComponent', () => {
    let fixture: ComponentFixture<WorkflowTodoComponent>;
    let http: HttpTestingController;
    const workflows = [
        { name: 'Glossary Refinement', status: 'Active', resumeLabel: 'Current checkpoint',
            resumePath: './glossary-refinement.md#checkpoint', relatedConcern: 'SC-027; SC-049' },
        { name: 'DevEnv Export', status: 'Pending', resumeLabel: 'Starting checkpoint',
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
            expect(text).toContain(workflow.status);
            expect(text).toContain(workflow.resumeLabel);
            expect(text).toContain(workflow.relatedConcern);
        }
        expect(fixture.nativeElement.querySelectorAll('tr.active').length).toBe(1);
        expect(text).not.toContain('Loading workflows');
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
        http.expectOne('http://localhost:3000/files?path=design\\glossary-refinement.md')
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
        http.expectOne('http://localhost:3000/files?path=design\\glossary-refinement.md').flush({ data: 'Old document' });
        buttons[1].click();
        http.expectOne('http://localhost:3000/files?path=design\\devenv-export-workflow.md')
            .flush({}, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
        expect(fixture.nativeElement.textContent).not.toContain('Old document');
        expect(fixture.nativeElement.textContent).not.toContain('Loading document');
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
        const oldRequest = http.expectOne('http://localhost:3000/files?path=design\\glossary-refinement.md');
        buttons[1].click();
        expect(oldRequest.cancelled).toBe(true);
        const currentRequest = http.expectOne('http://localhost:3000/files?path=design\\devenv-export-workflow.md');
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
