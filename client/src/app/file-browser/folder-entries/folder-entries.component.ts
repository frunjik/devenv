import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FolderEntry} from '@shared';
import {MatIconModule} from '@angular/material/icon';
import {NgFor} from '@angular/common';

@Component({
    selector: 'app-folder-entries',
    templateUrl: './folder-entries.component.html',
    styleUrls: ['./folder-entries.component.scss'],
    standalone: true,
    imports: [NgFor, MatIconModule]
})
export class FolderEntriesComponent {
    @Input()
    entries: FolderEntry[] = [];

    @Output()
    clickFileOrFolder = new EventEmitter();

    get files(): FolderEntry[] {
        return this.entries?.filter((e) => !e.isFolder) ?? [];
    }

    get folders(): FolderEntry[] {
        return this.entries?.filter((e) => e.isFolder) ?? [];
    }
}
