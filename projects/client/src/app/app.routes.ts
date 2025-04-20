import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { FileBrowserComponent } from './file-browser/file-browser/file-browser.component';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
    {
        path: 'ppt/browse',
        component: FileBrowserComponent
    }
];
