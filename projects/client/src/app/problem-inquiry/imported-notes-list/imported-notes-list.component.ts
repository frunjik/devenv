import { Component, Input } from '@angular/core';
import { ImportedNote } from '@shared';

@Component({
    selector: 'app-imported-notes-list',
    standalone: true,
    templateUrl: './imported-notes-list.component.html',
})
export class ImportedNotesListComponent {
    @Input() notes: readonly ImportedNote[] = [];
}
