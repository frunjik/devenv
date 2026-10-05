import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../../../backend.service';
import type { FolderEntry } from '@shared';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FolderEntriesComponent } from '../folder-entries/folder-entries.component';
// import {SearchInputComponent} from '../../search-input/search-input.component';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';
import { FileEditorComponent } from '../../file-editor/file-editor.component';

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
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileBrowserComponent implements OnInit {
    filename = signal<string>('');
    pathname = signal<string>('');

    filterText: string = '';
    fileContent: string = '';
    editorOptions = { theme: 'vs-dark', language: 'typescript' };
    fileLoadError = '';
    folderLoadError = '';

    folderEntries: FolderEntry[] = [];

    get folderNames(): string[] {
        return this.pathname().split('/');
    }

    get filteredEntries(): FolderEntry[] {
        const filterText = this.filterText.trim();
        return !filterText
            ? this.folderEntries
            : this.folderEntries.filter((entry) =>
                entry.filename.toLowerCase().includes(filterText)
            );
    }

    constructor(
        private backend: BackendService,
        private route: ActivatedRoute,
        private router: Router
    ) {}
    
    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            const pathname = params.get('path') ?? '';
            const filename = params.get('file') ?? '';

            this.showFolder(pathname);
            if (filename) {
                this.showFile(filename);
            } else {
                this.filename.set('');
                this.fileContent = '';
                this.fileLoadError = '';
            }
        });
    }

    clickFileOrFolder(entry: FolderEntry) {
        const name = this.pathname() + '/' + entry.filename;
        if (entry.isFolder) {
            this.navigateTo(name);
        } else {
            this.navigateTo(this.pathname(), name);
        }
    }

    clickPath(i: number) {
        this.filterText = '';
        this.navigateTo(this.folderNames.slice(0, 1 + i).join('/'));
    }

    searchTextChange(text: string) {
        this.filterText = text.toLowerCase();
    }

    private showFile(filename: string) {
        this.filename.set(filename);
        this.fileContent = '';
        this.fileLoadError = '';
        this.backend
            .loadFile(filename)
            .subscribe({
                next: fileContent => (this.fileContent = fileContent),
                error: error => (this.fileLoadError = String(error)),
            });
    }

    private navigateTo(pathname: string, filename = '') {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                path: pathname || null,
                file: filename || null
            },
            queryParamsHandling: 'merge'
        });
    }

    private showFolder(pathname: string) {
        this.pathname.set(pathname);
        this.folderEntries = [];
        this.folderLoadError = '';
        this.backend
            .loadFolder(pathname)
            .subscribe({
                next: folderEntries => (this.folderEntries = folderEntries),
                error: error => (this.folderLoadError = String(error)),
            });
    }
}
