import { Component } from '@angular/core';
import { ImportedNote, ProblemTicket } from '@shared';
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
            <app-input-converter (noteAccepted)="addNote($event)" />
            <app-imported-notes-list [notes]="notes" />
            <app-ticket-framing [notes]="notes" (ticketCreated)="addTicket($event)" />
            <app-framed-tickets-list [tickets]="tickets" [notes]="notes" />
        </main>
    `,
})
export class ProblemInquiryPageComponent {
    notes: readonly ImportedNote[] = [];
    tickets: readonly ProblemTicket[] = [];

    addNote(note: ImportedNote): void {
        this.notes = [...this.notes, note];
    }

    addTicket(ticket: ProblemTicket): void {
        this.tickets = [...this.tickets, ticket];
    }
}
