import { describe, expect, it } from '@jest/globals';
import { ProblemInquiryPageComponent } from './problem-inquiry/problem-inquiry-page.component';
import { SystemPlanComponent } from './system-plan/system-plan.component';
import { routes } from './app.routes';
import { WorkflowTodoComponent } from './system/workflow-todo/workflow-todo.component';

describe('routes', () => {
    it('exposes the workflow TODO view', () => {
        expect(routes.find(route => route.path === 'workflow-todo')?.component).toBe(WorkflowTodoComponent);
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
