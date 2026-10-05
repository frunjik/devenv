import { Component, Input } from '@angular/core';
import { ImportedNote } from '@shared';

@Component({
    selector: 'app-imported-notes-list',
    standalone: true,
    template: `
        <section aria-labelledby="imported-notes-heading">
            <h2 id="imported-notes-heading">Imported notes</h2>
            <p>No accepted notes yet.</p>
        </section>
    `,
})
export class ImportedNotesListComponent {
    @Input() notes: readonly ImportedNote[] = [];
}
