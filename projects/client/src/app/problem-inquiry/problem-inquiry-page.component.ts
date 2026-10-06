import { Component, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataKind, ImportedNote, NewProblemTicket, NoteProposal, NoteReviewDecision, ProblemTicket, ReviewedNoteProposal, SourceOrigin, StoredTicket, TicketCommand, TicketContent, TicketHistoryEvent } from '@shared';
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
    templateUrl: './problem-inquiry-page.component.html',
    styleUrl: './problem-inquiry-page.component.scss',
})
export class ProblemInquiryPageComponent implements OnInit {
    private readonly backend = inject(BackendService);

    notes: readonly ImportedNote[] = [];
    reviewedProposals: readonly ReviewedNoteProposal[] = [];
    tickets: readonly (ProblemTicket | StoredTicket)[] = [];
    histories: Readonly<Record<string, readonly TicketHistoryEvent[]>> = {};
    showSamples = true;
    storageError = '';

    get visibleNotes(): readonly ImportedNote[] {
        return this.showSamples ? this.notes : this.notes.filter(note => this.isKnownReal(note.proposal.sourceOrigin));
    }

    get visibleTickets(): readonly (ProblemTicket | StoredTicket)[] {
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

    reviewProposal({ proposal, decision }: { proposal: NoteProposal; decision: NoteReviewDecision }): void {
        this.reviewedProposals = [...this.reviewedProposals, { proposal, decision }];
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

    assign({ ticket, assigneeId }: { ticket: StoredTicket; assigneeId: string }): void {
        this.applyChange(this.backend.changeTicket(ticket.id, { kind: 'assign', assigneeId }, ticket.version), 'assigned');
    }

    change({ ticket, command }: { ticket: StoredTicket; command: TicketCommand }): void {
        this.applyChange(this.backend.changeTicket(ticket.id, command, ticket.version), 'changed');
    }

    edit({ ticket, content }: { ticket: StoredTicket; content: TicketContent }): void {
        this.applyChange(this.backend.editTicket(ticket.id, content, ticket.version), 'saved');
    }

    loadHistory(ticket: StoredTicket): void {
        this.backend.getTicketHistory(ticket.id).subscribe({
            next: events => {
                this.histories = { ...this.histories, [ticket.id]: events };
            },
            error: () => {
                this.storageError = 'The ticket history could not be loaded.';
            },
        });
    }

    private applyChange(request: Observable<{ ticket: StoredTicket }>, verb: string): void {
        request.subscribe({
            next: ({ ticket: changed }) => {
                this.storageError = '';
                this.replaceTicket(changed);
            },
            error: (error: HttpErrorResponse) => {
                const current = error.status === 409 ? (error.error?.error?.current as StoredTicket | undefined) : undefined;
                if (current) {
                    this.replaceTicket(current);
                    this.storageError = 'The ticket changed in the meantime; the latest version is shown.';
                } else {
                    this.storageError = `The ticket could not be ${verb}.`;
                }
            },
        });
    }
    toggleSamples(): void {
        this.showSamples = !this.showSamples;
    }

    private replaceTicket(changed: StoredTicket): void {
        this.tickets = this.tickets.map(ticket => ticket.id === changed.id ? changed : ticket);
        if (this.histories[changed.id]) {
            this.loadHistory(changed);
        }
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
