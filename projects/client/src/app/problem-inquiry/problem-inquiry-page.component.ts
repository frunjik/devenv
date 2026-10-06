import { Component, inject, OnInit } from '@angular/core';
import { DataKind, ImportedNote, NewProblemTicket, ProblemTicket, SourceOrigin } from '@shared';
import { BackendService } from '../backend.service';
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
            @if (storageError) {
                <p class="storage-error" role="alert">{{ storageError }}</p>
            }
            <app-input-converter (noteAccepted)="addNote($event)" />
            <app-imported-notes-list [notes]="visibleNotes" />
            <app-ticket-framing [notes]="visibleNotes" (ticketCreated)="addTicket($event)" />
            <app-framed-tickets-list [tickets]="visibleTickets" [notes]="visibleNotes" />
        </main>
    `,
    styles: `
        :host {
            display: block;
            min-width: 0;
        }

        main {
            box-sizing: border-box;
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 1.5rem;
            width: min(100%, 100rem);
            margin-inline: auto;
            padding: 1rem;
        }

        h1,
        .sample-data-toggle {
            margin: 0;
        }

        .sample-data-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .storage-error {
            margin: 0;
            color: #d69a90;
        }

        .sample-data-toggle input {
            width: auto;
        }

        @media (min-width: 70rem) {
            main {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                column-gap: 2rem;
                row-gap: 2rem;
                padding: 2rem;
            }

            h1,
            .sample-data-toggle,
            .storage-error {
                grid-column: 1 / -1;
            }
        }
    `,
})
export class ProblemInquiryPageComponent implements OnInit {
    private readonly backend = inject(BackendService);

    notes: readonly ImportedNote[] = [];
    tickets: readonly ProblemTicket[] = [];
    showSamples = true;
    storageError = '';

    get visibleNotes(): readonly ImportedNote[] {
        return this.showSamples ? this.notes : this.notes.filter(note => this.isKnownReal(note.proposal.sourceOrigin));
    }

    get visibleTickets(): readonly ProblemTicket[] {
        if (this.showSamples) {
            return this.tickets;
        }

        return this.tickets.filter(ticket =>
            ('dataKind' in ticket ? ticket.dataKind : this.dataKindOf(ticket)) === 'real');
    }

    ngOnInit(): void {
        this.backend.listTickets().subscribe({
            next: stored => this.tickets = [...this.tickets, ...stored],
            error: () => this.storageError = 'Stored tickets could not be loaded.',
        });
    }

    addNote(note: ImportedNote): void {
        this.notes = [...this.notes, note];
    }

    addTicket(ticket: ProblemTicket): void {
        const { id: _localId, ...newTicket } = ticket;
        this.backend.createTicket(newTicket satisfies NewProblemTicket, this.dataKindOf(ticket)).subscribe({
            next: stored => {
                this.storageError = '';
                this.tickets = [...this.tickets, stored];
            },
            error: () => this.storageError = 'The ticket could not be saved.',
        });
    }

    toggleSamples(): void {
        this.showSamples = !this.showSamples;
    }

    private dataKindOf(ticket: ProblemTicket): DataKind {
        const noteIds = ticket.sourceNoteIds ?? [];
        const real = noteIds.length > 0 && noteIds.every(noteId => {
            const note = this.notes.find(candidate => candidate.id === noteId);
            return note !== undefined && this.isKnownReal(note.proposal.sourceOrigin);
        });
        return real ? 'real' : 'sample';
    }

    private isKnownReal(sourceOrigin: SourceOrigin): boolean {
        return sourceOrigin === 'external-report'
            || sourceOrigin === 'direct-observation'
            || sourceOrigin === 'system-artifact';
    }
}
