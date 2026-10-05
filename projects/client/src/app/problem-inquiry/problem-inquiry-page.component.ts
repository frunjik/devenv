import { Component } from '@angular/core';
import { ImportedNote } from '@shared';
import { ImportedNotesListComponent } from './imported-notes-list/imported-notes-list.component';
import { InputConverterComponent } from './input-converter/input-converter.component';

@Component({
    selector: 'app-problem-inquiry-page',
    standalone: true,
    imports: [InputConverterComponent, ImportedNotesListComponent],
    template: `
        <main>
            <h1>Problem inquiry</h1>
            <app-input-converter (noteAccepted)="addNote($event)" />
            <app-imported-notes-list [notes]="notes" />
        </main>
    `,
})
export class ProblemInquiryPageComponent {
    notes: readonly ImportedNote[] = [];

    addNote(note: ImportedNote): void {
        this.notes = [...this.notes, note];
    }
}
