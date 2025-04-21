import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { FileBrowserComponent } from './file-browser/file-browser/file-browser.component';
import { PPTJSComponent } from './ppt/workspaces/js/js.component';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent
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
    // { path: '',   redirectTo: '/ppt/browse', pathMatch: 'full' }    
];
