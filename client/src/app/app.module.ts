import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileBrowserComponent } from './file-browser/file-browser/file-browser.component';
import { FolderEntriesComponent } from './file-browser/folder-entries/folder-entries.component';
import { FileEditorComponent } from './file-editor/file-editor.component';
import { MatButton } from '@angular/material/button';

// Not used - see /main.ts
@NgModule({
    declarations: [
    ],
    imports: [
        MatButton,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AppComponent,
        FileEditorComponent
    ],
    providers: [],
})
export class AppModule { }
