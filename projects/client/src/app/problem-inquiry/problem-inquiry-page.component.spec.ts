import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { DataKind, ImportedNote, NewProblemTicket, ProblemTicket, StoredTicket } from '@shared';
import { BackendService } from '../backend.service';
import { ProblemInquiryPageComponent } from './problem-inquiry-page.component';

describe('ProblemInquiryPageComponent', () => {
    let fixture: ComponentFixture<ProblemInquiryPageComponent>;
    let stored: StoredTicket[];
    let created: { ticket: NewProblemTicket; dataKind: DataKind }[];
    let createResult: (ticket: NewProblemTicket, dataKind: DataKind) => Observable<StoredTicket>;
    let listResult: () => Observable<StoredTicket[]>;

    beforeEach(async () => {
        stored = [];
        created = [];
        listResult = () => of(stored);
        createResult = (ticket, dataKind) => of(storedTicket(ticket, dataKind, 'T-1'));
        const backend = {
            listTickets: jest.fn(() => listResult()),
            createTicket: jest.fn((ticket: NewProblemTicket, dataKind: DataKind) => {
                created.push({ ticket, dataKind });
                return createResult(ticket, dataKind);
            }),
        };
        await TestBed.configureTestingModule({
            imports: [ProblemInquiryPageComponent],
            providers: [{ provide: BackendService, useValue: backend }],
        }).compileComponents();

        fixture = TestBed.createComponent(ProblemInquiryPageComponent);
        fixture.detectChanges();
    });

    it('adds a note to the list only after explicit acceptance', () => {
        setText('#source-text', 'The scan timed out and may have been applied.');
        setText('#interpretation', 'The operation outcome is uncertain.');
        submitForm();

        expect(fixture.nativeElement.textContent).toContain('No accepted notes yet.');
        expect(fixture.nativeElement.textContent).toContain('Review note proposal');

        fixture.nativeElement.querySelector('#accept-note').click();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('The operation outcome is uncertain.');
        expect(fixture.nativeElement.textContent).not.toContain('No accepted notes yet.');
        expect(fixture.nativeElement.textContent).toContain('unreviewed');
    });

    it('creates and lists a ticket only after explicit framing from an accepted note', () => {
        setText('#source-text', 'The scan timed out and may have been applied.');
        setText('#interpretation', 'The operation outcome is uncertain.');
        submitForm();
        fixture.nativeElement.querySelector('#accept-note').click();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('No framed problem tickets yet.');
        const sourceNotes = fixture.nativeElement.querySelector('#source-note-ids') as HTMLSelectElement;
        expect(sourceNotes.options.length).toBe(1);
        sourceNotes.options[0].selected = true;
        setText('#ticket-title', 'Unclear scan outcome');
        setText('#ticket-report', 'A manually entered ticket report.');
        setText('#problem-condition', 'The scan result is unclear after a timeout.');
        setText('#problem-affected', 'Warehouse operator');
        setText('#problem-impact', 'The operator cannot confirm the operation outcome.');
        setText('#scope-level', 'workflow');
        setText('#scope-label', 'Outbound scanning');
        setText('#reported-by', 'A. Reporter');
        setText('#reported-at', '2026-10-05T12:00');

        const ticketForm = sourceNotes.closest('form') as HTMLFormElement;
        ticketForm.dispatchEvent(new Event('submit'));
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent as string;
        expect(fixture.nativeElement.querySelectorAll('.ticket-card').length).toBe(1);
        expect(content).toContain('Unclear scan outcome');
        expect(content).toContain('A manually entered ticket report.');
        expect(content).toContain('The scan result is unclear after a timeout.');
        expect(content).toContain('note-1');
        expect(content).toContain('The scan timed out and may have been applied.');
        expect(content).toContain('The operation outcome is uncertain.');
    });

    it('toggles between all notes and known-real notes without changing the records', () => {
        fixture.componentInstance.addNote(makeNote('note-sample', 'synthetic', 'A sample report.'));
        fixture.componentInstance.addNote(makeNote('note-real', 'external-report', 'A real report.'));
        fixture.componentInstance.addNote(makeNote('note-unknown', 'unknown', 'An unknown-origin report.'));
        fixture.componentInstance.addNote(makeNote('note-system', 'system-artifact', 'A system-artifact report.'));
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('A sample report.');
        expect(fixture.nativeElement.textContent).toContain('A real report.');
        expect(fixture.nativeElement.textContent).toContain('An unknown-origin report.');
        expect(fixture.nativeElement.textContent).toContain('A system-artifact report.');

        toggleSampleData();

        expect(fixture.nativeElement.textContent).not.toContain('A sample report.');
        expect(fixture.nativeElement.textContent).toContain('A real report.');
        expect(fixture.nativeElement.textContent).not.toContain('An unknown-origin report.');
        expect(fixture.nativeElement.textContent).toContain('A system-artifact report.');
        expect((fixture.nativeElement.querySelector('#source-note-ids') as HTMLSelectElement).options.length)
            .toBe(2);
        expect(fixture.componentInstance.notes).toHaveLength(4);

        toggleSampleData();

        expect(fixture.nativeElement.textContent).toContain('A sample report.');
        expect(fixture.nativeElement.textContent).toContain('A real report.');
        expect(fixture.nativeElement.textContent).toContain('An unknown-origin report.');
        expect(fixture.nativeElement.textContent).toContain('A system-artifact report.');
    });

    it('shows only tickets whose linked notes are all known-real in real-only mode', () => {
        const sample = makeNote('note-sample', 'synthetic', 'A sample report.');
        const real = makeNote('note-real', 'direct-observation', 'A real report.');
        const systemNote = makeNote('note-system', 'system-artifact', 'A system-artifact report.');
        fixture.componentInstance.notes = [sample, real, systemNote];
        fixture.componentInstance.tickets = [
            makeTicket('ticket-real', ['note-real']),
            makeTicket('ticket-system', ['note-system']),
            makeTicket('ticket-mixed', ['note-real', 'note-sample']),
            makeTicket('ticket-sample', ['note-sample']),
            makeTicket('ticket-unlinked', undefined),
            makeTicket('ticket-empty-links', []),
            makeTicket('ticket-missing-note', ['note-missing']),
        ];
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.ticket-card').length).toBe(7);

        toggleSampleData();

        expect(fixture.nativeElement.querySelectorAll('.ticket-card').length).toBe(2);
        expect(fixture.nativeElement.textContent).toContain('ticket-real');
        expect(fixture.nativeElement.textContent).toContain('ticket-system');
        expect(fixture.nativeElement.textContent).not.toContain('ticket-mixed');
        expect(fixture.nativeElement.textContent).not.toContain('ticket-sample');
        expect(fixture.nativeElement.textContent).not.toContain('ticket-unlinked');
        expect(fixture.nativeElement.textContent).not.toContain('ticket-empty-links');
        expect(fixture.nativeElement.textContent).not.toContain('ticket-missing-note');
        expect(fixture.nativeElement.textContent).toContain('A real report.');
        expect(fixture.nativeElement.textContent).not.toContain('A sample report.');
    });

    it('lists stored tickets loaded from the server', () => {
        stored = [storedTicket(makeTicket('ignored', undefined), 'real', 'T-9')];
        fixture = TestBed.createComponent(ProblemInquiryPageComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.ticket-card').length).toBe(1);
        expect(fixture.nativeElement.textContent).toContain('T-9');
    });

    it('filters stored tickets by their stored data kind, not by notes', () => {
        stored = [
            storedTicket(makeTicket('x', undefined), 'real', 'T-real'),
            storedTicket(makeTicket('x', undefined), 'sample', 'T-sample'),
        ];
        fixture = TestBed.createComponent(ProblemInquiryPageComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.ticket-card').length).toBe(2);

        toggleSampleData();

        expect(fixture.nativeElement.querySelectorAll('.ticket-card').length).toBe(1);
        expect(fixture.nativeElement.textContent).toContain('T-real');
        expect(fixture.nativeElement.textContent).not.toContain('T-sample');
    });

    it('stores a new ticket with the server, flagged real only when all linked notes are known-real', () => {
        fixture.componentInstance.notes = [
            makeNote('note-real', 'external-report', 'A real report.'),
            makeNote('note-sample', 'synthetic', 'A sample report.'),
        ];

        fixture.componentInstance.addTicket(makeTicket('local-1', ['note-real']));
        fixture.componentInstance.addTicket(makeTicket('local-2', ['note-real', 'note-sample']));
        fixture.componentInstance.addTicket(makeTicket('local-3', undefined));

        expect(created.map(entry => entry.dataKind)).toEqual(['real', 'sample', 'sample']);
        expect(created[0].ticket).not.toHaveProperty('id');
        expect(created[0].ticket.title).toBe('Title for local-1');
        expect(fixture.componentInstance.tickets.map(ticket => ticket.id)).toEqual(['T-1', 'T-1', 'T-1']);
    });

    it('does not list a ticket the server failed to store, and says so', () => {
        createResult = () => throwError(() => new Error('down'));

        fixture.componentInstance.addTicket(makeTicket('local-1', undefined));
        fixture.detectChanges();

        expect(fixture.componentInstance.tickets).toHaveLength(0);
        expect(fixture.nativeElement.querySelector('.storage-error').textContent)
            .toContain('could not be saved');
    });

    it('says so when stored tickets cannot be loaded', () => {
        listResult = () => throwError(() => new Error('down'));
        fixture = TestBed.createComponent(ProblemInquiryPageComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.storage-error').textContent)
            .toContain('could not be loaded');
    });

    function storedTicket(ticket: NewProblemTicket, dataKind: DataKind, id: string): StoredTicket {
        return { ...ticket, id, status: { state: 'open' }, version: 1, dataKind };
    }

    function toggleSampleData(): void {
        const toggle = fixture.nativeElement.querySelector('#sample-data-toggle') as HTMLInputElement;
        toggle.click();
        fixture.detectChanges();
    }

    function setText(selector: string, value: string): void {
        const control = fixture.nativeElement.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
        control.value = value;
        control.dispatchEvent(new Event('input'));
    }

    function submitForm(): void {
        fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
        fixture.detectChanges();
    }

    function makeNote(id: string, sourceOrigin: ImportedNote['proposal']['sourceOrigin'], sourceText: string): ImportedNote {
        return {
            id,
            proposal: {
                sourceText,
                sourceReference: { artifact: null, locator: null },
                sourceOrigin,
                verificationStatus: 'unreviewed',
                interpretation: `Interpretation: ${sourceText}`,
                openQuestions: [],
            },
            acceptedAt: '2026-10-05T12:00:00.000Z',
        };
    }

    function makeTicket(id: string, sourceNoteIds: string[] | undefined): ProblemTicket {
        return {
            id,
            title: `Title for ${id}`,
            report: `Report for ${id}`,
            problem: {
                condition: 'An explicitly described undesirable condition.',
                affected: 'Warehouse operator',
                impact: 'The operator cannot proceed.',
            },
            sourceNoteIds,
            scope: { level: 'workflow', label: 'Outbound scanning' },
            context: { people: [], places: [], things: [] },
            reportedBy: 'A. Reporter',
            reportedAt: '2026-10-05T12:00:00.000Z',
        };
    }
});
