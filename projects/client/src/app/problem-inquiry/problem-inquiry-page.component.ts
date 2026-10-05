import { Component } from '@angular/core';
import { ImportedNote, ProblemTicket, SourceOrigin } from '@shared';
import { FramedTicketsListComponent } from './framed-tickets-list/framed-tickets-list.component';
import { ImportedNotesListComponent } from './imported-notes-list/imported-notes-list.component';
import { InputConverterComponent } from './input-converter/input-converter.component';
import { TicketFramingComponent } from './ticket-framing/ticket-framing.component';

@Component({
    selector: 'app-problem-inquiry-page',
    standalone: true,
    imports: [
        InputConverterComponent,
        ImportedNotesListComponent,
        TicketFramingComponent,
        FramedTicketsListComponent,
    ],
    template: `
        <main>
            <h1>Problem inquiry</h1>
            <label class="sample-data-toggle">
                <input
                    id="sample-data-toggle"
                    type="checkbox"
                    [checked]="showSamples"
                    (change)="toggleSamples()"
                >
                Include sample data
            </label>
            <app-input-converter (noteAccepted)="addNote($event)" />
            <app-imported-notes-list [notes]="visibleNotes" />
            <app-ticket-framing [notes]="visibleNotes" (ticketCreated)="addTicket($event)" />
            <app-framed-tickets-list [tickets]="visibleTickets" [notes]="visibleNotes" />
        </main>
    `,
})
export class ProblemInquiryPageComponent {
    notes: readonly ImportedNote[] = [];
    tickets: readonly ProblemTicket[] = [];
    showSamples = true;

    get visibleNotes(): readonly ImportedNote[] {
        return this.showSamples ? this.notes : this.notes.filter(note => this.isKnownReal(note.proposal.sourceOrigin));
    }

    get visibleTickets(): readonly ProblemTicket[] {
        if (this.showSamples) {
            return this.tickets;
        }

        return this.tickets.filter(ticket => {
            const sourceNoteIds = ticket.sourceNoteIds;
            return sourceNoteIds !== undefined
                && sourceNoteIds.length > 0
                && sourceNoteIds.every(noteId => {
                    const note = this.notes.find(candidate => candidate.id === noteId);
                    return note !== undefined && this.isKnownReal(note.proposal.sourceOrigin);
                });
        });
    }

    addNote(note: ImportedNote): void {
        this.notes = [...this.notes, note];
    }

    addTicket(ticket: ProblemTicket): void {
        this.tickets = [...this.tickets, ticket];
    }

    toggleSamples(): void {
        this.showSamples = !this.showSamples;
    }

    private isKnownReal(sourceOrigin: SourceOrigin): boolean {
        return sourceOrigin === 'external-report'
            || sourceOrigin === 'direct-observation'
            || sourceOrigin === 'system-artifact';
    }
}
