import { Routes } from '@angular/router';
import { FileBrowserComponent } from './system/file-browser/file-browser/file-browser.component';
import { TestRunnerComponent } from './system/test-runner/test-runner.component';
import { GitLogComponent } from './system/git-log/git-log.component';
import { TermsComponent } from './system/terms/terms.component';
import { GlossaryComponent } from './system/glossary/glossary.component';
import { ProblemInquiryPageComponent } from './problem-inquiry/problem-inquiry-page.component';
import { SystemPlanComponent } from './system-plan/system-plan.component';
import { WorkflowTodoComponent } from './system/workflow-todo/workflow-todo.component';
import { WorkflowEvaluationsComponent } from './system/workflow-todo/workflow-evaluations.component';
import { DiagramPageComponent } from './system/diagram/diagram-page.component';
import { CanvasDiagramEditor } from './system/interactive-canvas/canvas-diagram-editor.component';
import { VisualFoundationsComponent } from './system/visual-foundations/visual-foundations.component';
import { AgentGuideComponent } from './system/agent-guide/agent-guide.component';
import { WorkPlansComponent } from './system/work-plans/work-plans.component';

export const routes: Routes = [
    {
        path: 'agent-guide',
        component: AgentGuideComponent,
    },
    {
        path: 'visual-foundations',
        component: VisualFoundationsComponent,
    },
    {
        path: 'interactive-canvas',
        component: CanvasDiagramEditor
    },
    {
        path: 'diagram',
        component: DiagramPageComponent
    },
    {
        path: 'work-plans',
        component: WorkPlansComponent
    },
    {
        path: 'workflow-todo',
        component: WorkflowTodoComponent
    },
    {
        path: 'workflow-evaluations',
        component: WorkflowEvaluationsComponent
    },
    {
        path: '',
        redirectTo: '/problem-inquiry',
        pathMatch: 'full',
    },
    {
        path: 'browse',
        component: FileBrowserComponent
    },
    {
        path: 'tests',
        component: TestRunnerComponent
    },
    {
        path: 'git/log',
        component: GitLogComponent
    },
    {
        path: 'terms',
        component: TermsComponent
    },
    {
        path: 'glossary',
        component: GlossaryComponent
    },
    {
        path: 'problem-inquiry',
        component: ProblemInquiryPageComponent
    },
    {
        path: 'system-plan',
        component: SystemPlanComponent
    },
];
