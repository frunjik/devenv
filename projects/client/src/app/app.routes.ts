import { Routes } from '@angular/router';
import { FileBrowserComponent } from './system/file-browser/file-browser/file-browser.component';
import { PPTJSComponent } from './system/ppt/workspaces/js/js.component';
import { TestRunnerComponent } from './system/test-runner/test-runner.component';
import { GitLogComponent } from './system/git-log/git-log.component';
import { ModelsComponent } from './system/models/models.component';
import { TermsComponent } from './system/terms/terms.component';
import { GlossaryComponent } from './system/glossary/glossary.component';
import { HistoryComponent } from './system/history/history.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/ppt/browse',
        pathMatch: 'full',
    },
    // {
    //     path: 'ppt/metaii',
    //     component: PPTMetaiiComponent
    // },
    {
        path: 'ppt/js',
        component: PPTJSComponent
    },
    {
        path: 'ppt/browse',
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
        path: 'models',
        component: ModelsComponent
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
        path: 'history',
        component: HistoryComponent
    },
];
