import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileBrowserComponent } from './file-browser/file-browser/file-browser.component';

const routes: Routes = [
    { path: 'ppt/edit', component: FileBrowserComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
