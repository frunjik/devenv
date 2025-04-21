import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { FileBrowserComponent } from './file-browser/file-browser/file-browser.component';
import { PPTTextComponent } from './ppt/text/text.component';
import { MetaiiComponent } from './ppt/metaii/metaii.component';

export const routes: Routes = [
    {
        path: '',
        component: MetaiiComponent
    },
    {
        path: 'main',
        component: MainComponent
    },
    {
        path: 'ppt/browse',
        component: FileBrowserComponent
    },
    // { path: '',   redirectTo: '/ppt/browse', pathMatch: 'full' }    
];
