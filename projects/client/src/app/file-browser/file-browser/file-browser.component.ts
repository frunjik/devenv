import { AfterViewInit, Component, signal } from '@angular/core';
import { PPTFolderEntry } from '@ppt';
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
import { FileAccessService } from '../../file-access/file-access.service';
import { Store } from '@ngrx/store';


export interface FileBrowserState {
    fullpathname: string;
    folderEntries: PPTFolderEntry[];
}

export interface FileEditorState {
    fullpathfilename: string;
    fileContents: string;
}

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
export class FileBrowserComponent implements AfterViewInit {
    filename = signal<string>('');
    pathname = signal<string>('');

    // signals ?
    fileContent: string = '';
    folderEntries: PPTFolderEntry[] = [];

    filterText: string = ''; // not set atm (use search input)
    editorOptions = { theme: 'vs-dark', language: 'typescript' };

    get pathNames(): string[] {
        return this.pathname().split('/');
    }

    get filteredEntries(): PPTFolderEntry[] {
        const filterText = this.filterText.trim();
        return !filterText
            ? this.folderEntries
            : this.folderEntries.filter((entry) =>
                entry.filename.toLowerCase().includes(filterText)
            );
    }

    constructor(
        private _st: Store,
        private _fs: FileAccessService,
    ) {
        // setup the route parameter change here,
        // to receive the commands dispatched from the devenv-command service coming here via the routing

        // this._st.dispatch(() => loadBook({ id: this.bookId() })));
    }
    
    ngAfterViewInit(): void {
        this.showFolder(this.pathname());
    }

    clickFileOrFolder(entry: PPTFolderEntry) {
        const fullpathfilename = this.pathname() + '/' + entry.filename;
        if (entry.isFolder) {
            this.showFolder(fullpathfilename);
        } else {
            this.showFile(fullpathfilename);
        }
    }

    clickPath(i: number) {
        this.filterText = '';
        this.showFolder(
            this.pathNames
                .slice(0, 1 + i)
                .join('/')
        );
    }

    searchTextChange(text: string) {
        this.filterText = text.toLowerCase();
    }

    private showFile(filename: string) {
        this.filename.set(filename);
        this._fs
            .loadFile(filename)
            .subscribe((fileContent) => (this.fileContent = fileContent));
    }

    private showFolder(pathname: string) {
        this.pathname.set(pathname);
        this._fs
            .loadFolderEntries(pathname)
            .subscribe((folderEntries) => (this.folderEntries = folderEntries));
    }
}
