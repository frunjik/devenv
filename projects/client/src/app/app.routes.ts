import { Routes } from '@angular/router';
import { MainComponent } from './system/main/main.component';
import { FileBrowserComponent } from './system/file-browser/file-browser/file-browser.component';
import { PPTJSComponent } from './system/ppt/workspaces/js/js.component';

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
