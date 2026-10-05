import { Routes } from '@angular/router';
import { FileBrowserComponent } from './system/file-browser/file-browser/file-browser.component';
import { TestRunnerComponent } from './system/test-runner/test-runner.component';
import { GitLogComponent } from './system/git-log/git-log.component';
import { TermsComponent } from './system/terms/terms.component';
import { GlossaryComponent } from './system/glossary/glossary.component';
import { ProblemInquiryPageComponent } from './problem-inquiry/problem-inquiry-page.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/browse',
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
];
