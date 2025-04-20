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
    entries: PPTFolderEntry[] = [];

    @Output()
    clickFileOrFolder = new EventEmitter();

    get files(): PPTFolderEntry[] {
        return this.entries?.filter((e) => !e.isFolder) ?? [];
    }

    get folders(): PPTFolderEntry[] {
        return this.entries?.filter((e) => e.isFolder) ?? [];
    }
}
