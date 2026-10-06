import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DataKind, ImportedNote, NewProblemTicket, ProblemTicket, StoredTicket, TicketCommand, TicketChangeEvent, TicketContent, TicketEditEvent } from '@shared';
import { BackendService } from '../backend.service';
import { ProblemInquiryPageComponent } from './problem-inquiry-page.component';

describe('ProblemInquiryPageComponent', () => {
    let fixture: ComponentFixture<ProblemInquiryPageComponent>;
    let stored: StoredTicket[];
    let created: { ticket: NewProblemTicket; dataKind: DataKind }[];
    let createResult: (ticket: NewProblemTicket, dataKind: DataKind) => Observable<StoredTicket>;
    let listResult: () => Observable<StoredTicket[]>;
    let editResult: (id: string, content: TicketContent, version: number) => Observable<{ ticket: StoredTicket; event: TicketEditEvent }>;
    let changeResult: (id: string, command: TicketCommand, version: number) => Observable<{ ticket: StoredTicket; event: TicketChangeEvent }>;

    beforeEach(async () => {
        stored = [];
        created = [];
        listResult = () => of(stored);
        createResult = (ticket, dataKind) => of(storedTicket(ticket, dataKind, 'T-1'));
        changeResult = (id, command, version) => of({
            ticket: { ...stored.find(ticket => ticket.id === id)!, version: version + 1, status: { state: 'assigned', assigneeId: (command as { assigneeId: string }).assigneeId } },
            event: {} as TicketChangeEvent,
        });
        editResult = (id, content, version) => of({
            ticket: { ...stored.find(ticket => ticket.id === id)!, ...content, version: version + 1 },
            event: {} as TicketEditEvent,
        });
        const backend = {
            editTicket: jest.fn((id: string, content: TicketContent, version: number) => editResult(id, content, version)),
            changeTicket: jest.fn((id: string, command: TicketCommand, version: number) => changeResult(id, command, version)),
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

    describe('assigning', () => {
        beforeEach(() => {
            stored = [storedTicket(makeTicket('x', undefined), 'real', 'T-1'), storedTicket(makeTicket('y', undefined), 'real', 'T-2')];
            fixture = TestBed.createComponent(ProblemInquiryPageComponent);
            fixture.detectChanges();
        });

        function assign(card: number, value: string): void {
            const form = fixture.nativeElement.querySelectorAll('.assign-form')[card] as HTMLFormElement;
            const input = form.querySelector('input') as HTMLInputElement;
            input.value = value;
            input.dispatchEvent(new Event('input'));
            form.dispatchEvent(new Event('submit'));
            fixture.detectChanges();
        }

        function badges(): string[] {
            return Array.from(fixture.nativeElement.querySelectorAll('.ticket-state') as NodeListOf<HTMLElement>)
                .map(badge => badge.textContent!.trim());
        }

        it('assigns through the server and replaces only that ticket with the stored result', () => {
            assign(1, 'user-2');

            expect(badges()).toEqual(['Open', 'Assigned to user-2']);
            expect(fixture.nativeElement.querySelector('.storage-error')).toBeNull();
        });

        it('shows the latest ticket and says so when the ticket changed in the meantime', () => {
            const current = { ...stored[0], version: 5, status: { state: 'assigned', assigneeId: 'someone' } } as StoredTicket;
            changeResult = () => throwError(() => new HttpErrorResponse({ status: 409, error: { error: { current } } }));

            assign(0, 'user-2');

            expect(badges()).toEqual(['Assigned to someone', 'Open']);
            expect(fixture.nativeElement.querySelector('.storage-error').textContent).toContain('changed');
        });

        it('says so when the assignment is refused or fails', () => {
            changeResult = () => throwError(() => new HttpErrorResponse({ status: 422, error: { error: { message: 'No.' } } }));

            assign(0, 'user-2');

            expect(badges()).toEqual(['Open', 'Open']);
            expect(fixture.nativeElement.querySelector('.storage-error').textContent).toContain('could not be assigned');
        });
    });

    describe('editing', () => {
        beforeEach(() => {
            stored = [storedTicket(makeTicket('x', undefined), 'real', 'T-1'), storedTicket(makeTicket('y', undefined), 'real', 'T-2')];
            fixture = TestBed.createComponent(ProblemInquiryPageComponent);
            fixture.detectChanges();
        });

        function edit(card: number, title: string): void {
            (fixture.nativeElement.querySelectorAll('.edit-toggle')[card] as HTMLElement).click();
            fixture.detectChanges();
            (fixture.nativeElement.querySelector('.edit-form [name="title"]') as HTMLInputElement).value = title;
            fixture.nativeElement.querySelector('.edit-form').dispatchEvent(new Event('submit'));
            fixture.detectChanges();
        }

        function titles(): string[] {
            return Array.from(fixture.nativeElement.querySelectorAll('.ticket-card h3') as NodeListOf<HTMLElement>)
                .map(heading => heading.textContent!.trim());
        }

        it('saves through the server and replaces only that ticket with the stored result', () => {
            edit(1, 'Renamed');

            expect(titles()).toEqual([stored[0].title, 'Renamed']);
            expect(fixture.nativeElement.querySelector('.storage-error')).toBeNull();
        });

        it('shows the latest ticket and says so when the ticket changed in the meantime', () => {
            const current = { ...stored[0], version: 5, title: 'Changed by someone' } as StoredTicket;
            editResult = () => throwError(() => new HttpErrorResponse({ status: 409, error: { error: { current } } }));

            edit(0, 'Mine');

            expect(titles()).toEqual(['Changed by someone', stored[1].title]);
            expect(fixture.nativeElement.querySelector('.storage-error').textContent).toContain('changed');
        });

        it('says so when the edit is refused or fails', () => {
            editResult = () => throwError(() => new HttpErrorResponse({ status: 422, error: { error: { message: 'No.' } } }));

            edit(0, 'Mine');

            expect(titles()).toEqual([stored[0].title, stored[1].title]);
            expect(fixture.nativeElement.querySelector('.storage-error').textContent).toContain('could not be saved');
        });
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
