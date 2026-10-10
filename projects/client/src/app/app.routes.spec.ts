import { describe, expect, it } from '@jest/globals';
import { ProblemInquiryPageComponent } from './problem-inquiry/problem-inquiry-page.component';
import { SystemPlanComponent } from './system-plan/system-plan.component';
import { routes } from './app.routes';
import { WorkflowTodoComponent } from './system/workflow-todo/workflow-todo.component';
import { WorkflowEvaluationsComponent } from './system/workflow-todo/workflow-evaluations.component';
import { DiagramPageComponent } from './system/diagram/diagram-page.component';
import { CanvasDiagramEditor } from './system/interactive-canvas/canvas-diagram-editor.component';
import { VisualFoundationsComponent } from './system/visual-foundations/visual-foundations.component';
import { WorkPlansComponent } from './system/work-plans/work-plans.component';
import { TermsComponent } from './system/terms/terms.component';

describe('routes', () => {
    it('retains direct access to Terms without a menu link', () => {
        expect(routes.find(route => route.path === 'terms')?.component).toBe(TermsComponent);
    });
    it('exposes the isolated canvas symbol preview', () => {
        expect(routes.find(route => route.path === 'canvas-symbol-preview')?.component?.name)
            .toBe('CanvasSymbolPreviewComponent');
    });
    it('exposes the read-only agent guide preview', () => {
        expect(routes.find(route => route.path === 'agent-guide')?.component?.name).toBe('AgentGuideComponent');
    });
    it('exposes an isolated visual foundations preview', () => {
        expect(routes.find(route => route.path === 'visual-foundations')?.component).toBe(VisualFoundationsComponent);
    });

    it('exposes the isolated Interactive Canvas prototype', () => {
        expect(routes.find(route => route.path === 'interactive-canvas')?.component)
            .toBe(CanvasDiagramEditor);
    });

    it('exposes the diagram page at its own route', () => {
        expect(routes.find(route => route.path === 'diagram')?.component).toBe(DiagramPageComponent);
    });

    it('exposes the read-only WorkPlans view', () => {
        expect(routes.find(route => route.path === 'work-plans')?.component).toBe(WorkPlansComponent);
    });
    it('exposes the workflow TODO view', () => {
        expect(routes.find(route => route.path === 'workflow-todo')?.component).toBe(WorkflowTodoComponent);
    });
    it('exposes value evaluations at their own route', () => {
        expect(routes.find(route => route.path === 'workflow-evaluations')?.component)
            .toBe(WorkflowEvaluationsComponent);
    });
    it('redirects only the empty path to problem inquiry', () => {
        expect(routes.find(route => route.path === '')).toEqual({
            path: '',
            redirectTo: '/problem-inquiry',
            pathMatch: 'full',
        });
    });

    it('exposes the problem inquiry vertical slice at its own route', () => {
        expect(routes.find(route => route.path === 'problem-inquiry')?.component)
            .toBe(ProblemInquiryPageComponent);
    });

    it('exposes the system plan at its own route', () => {
        expect(routes.find(route => route.path === 'system-plan')?.component)
            .toBe(SystemPlanComponent);
    });
});
