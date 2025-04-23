import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NgFor} from '@angular/common';
import {PPTFolderEntry} from '@ppt';

@Component({
    selector: 'app-folder-entries',
    templateUrl: './folder-entries.component.html',
    styleUrls: ['./folder-entries.component.scss'],
    standalone: true,
    imports: [NgFor, MatIconModule]
})
export class FolderEntriesComponent {
    @Input()
    entries: ReadonlyArray<PPTFolderEntry> = [];
    // entries: PPTFolderEntry[] = [];

    @Output()
    clickFileOrFolder = new EventEmitter();

    get files(): ReadonlyArray<PPTFolderEntry> {
        return this.entries?.filter((e) => !e.isFolder) ?? [];
    }

    get folders(): ReadonlyArray<PPTFolderEntry> {
        return this.entries?.filter((e) => e.isFolder) ?? [];
    }
}
