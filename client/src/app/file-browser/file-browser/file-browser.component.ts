import { Component } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
import { FolderEntry } from '@shared';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FolderEntriesComponent } from '../folder-entries/folder-entries.component';
// import {SearchInputComponent} from '../../search-input/search-input.component';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';
import { FileEditorComponent } from 'src/app/file-editor/file-editor.component';

import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-file-browser',
    templateUrl: './file-browser.component.html',
    styleUrls: ['./file-browser.component.scss'],
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        MatButtonModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MonacoEditorModule,
        FormsModule,
        // SearchInputComponent,
        FolderEntriesComponent,
        FileEditorComponent
    ]
})
export class FileBrowserComponent {
    filename: string = '';
    pathname: string = '';

    filterText: string = '';
    fileContent: string = '';
    editorOptions = { theme: 'vs-dark', language: 'typescript' };

    folderEntries: FolderEntry[] = [];

    get folderNames(): string[] {
        return this.pathname.split('/');
    }

    get filteredEntries(): FolderEntry[] {
        const filterText = this.filterText.trim();
        return !filterText
            ? this.folderEntries
            : this.folderEntries.filter((entry) =>
                entry.filename.toLowerCase().includes(filterText)
            );
    }

    constructor(private backend: BackendService) {
        this.showFolder(this.pathname);
    }

    clickFileOrFolder(entry: FolderEntry) {
        const name = this.pathname + '/' + entry.filename;
        if (entry.isFolder) {
            this.showFolder(name);
        } else {
            this.showFile(name);
        }
    }

    clickPath(i: number) {
        this.filterText = '';
        this.showFolder(this.folderNames.slice(0, 1 + i).join('/'));
    }

    searchTextChange(text: string) {
        this.filterText = text.toLowerCase();
    }

    private showFile(filename: string) {
        this.filename = filename;
        this.backend
            .loadFile(filename)
            .subscribe((fileContent) => (this.fileContent = fileContent));
    }

    private showFolder(pathname: string) {
        this.pathname = pathname;
        this.backend
            .loadFolder(pathname)
            .subscribe((folderEntries) => (this.folderEntries = folderEntries));
    }
}
