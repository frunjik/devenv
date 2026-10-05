import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportedNote, ProblemTicket } from '@shared';
import { FramedTicketsListComponent } from './framed-tickets-list.component';

describe('FramedTicketsListComponent', () => {
    let fixture: ComponentFixture<FramedTicketsListComponent>;
    const notes = [
        makeNote('note-1', 'The scanner timed out before showing a result.'),
        makeNote('note-2', 'A retry may repeat the submission.'),
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FramedTicketsListComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FramedTicketsListComponent);
        fixture.componentRef.setInput('notes', notes);
        fixture.detectChanges();
    });

    it('shows an empty state when no tickets have been framed', () => {
        expect(fixture.nativeElement.textContent).toContain('No framed problem tickets yet.');
    });

    it('shows separate ticket frames and each linked note for reusable provenance', () => {
        fixture.componentRef.setInput('tickets', [
            makeTicket('ticket-1', 'Unclear scan outcome', ['note-1', 'note-2']),
            makeTicket('ticket-2', 'Repeated scan submission', ['note-1']),
        ]);
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent as string;
        expect(fixture.nativeElement.querySelectorAll('.ticket-card').length).toBe(2);
        expect(content).toContain('Unclear scan outcome');
        expect(content).toContain('Repeated scan submission');
        expect(content).toContain('The scanner timed out before showing a result.');
        expect(content).toContain('A retry may repeat the submission.');
        expect(content).toContain('note-1');
        expect(content).toContain('note-2');
        expect(content).toContain('The retry may duplicate an action.');
        expect(content).toContain('Warehouse operator');
        expect(content).toContain('The operator cannot confirm the outcome.');
        expect(content).toContain('Outbound scanning');
        expect(content).toContain('dispatch area');
        expect(content).toContain('A. Reporter');
        expect(content).toContain('2026-10-05T12:00:00.000Z');
    });

    it('identifies a linked note that is not in the current accepted-note list', () => {
        fixture.componentRef.setInput('tickets', [
            makeTicket('ticket-3', 'Ticket with unavailable note', ['note-unknown']),
        ]);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('note-unknown');
        expect(fixture.nativeElement.textContent).toContain('Note is not currently available.');
    });

    it('clearly handles tickets without recorded note references', () => {
        fixture.componentRef.setInput('tickets', [
            makeTicket('ticket-4', 'Legacy ticket', undefined),
            makeTicket('ticket-5', 'Unlinked ticket', []),
        ]);
        fixture.detectChanges();

        const messages = fixture.nativeElement.querySelectorAll('.no-note-references');
        expect(messages.length).toBe(2);
        expect(fixture.nativeElement.textContent).toContain('No accepted note references recorded.');
    });

    it('shows empty work-context categories without inventing entries', () => {
        fixture.componentRef.setInput('tickets', [
            makeTicket('ticket-6', 'Ticket with sparse context', ['note-1'], true),
        ]);
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent as string;
        expect(content).toContain('No people recorded.');
        expect(content).toContain('No places recorded.');
        expect(content).toContain('No things recorded.');
    });

    function makeTicket(
        id: string,
        title: string,
        sourceNoteIds: string[] | undefined,
        emptyContext = false,
    ): ProblemTicket {
        return {
            id,
            title,
            report: 'A scanner retry may repeat a submission.',
            problem: {
                condition: 'The retry may duplicate an action.',
                affected: 'Warehouse operator',
                impact: 'The operator cannot confirm the outcome.',
            },
            sourceNoteIds,
            scope: {
                level: 'workflow',
                label: 'Outbound scanning',
            },
            context: {
                people: emptyContext ? [] : ['warehouse operator'],
                places: emptyContext ? [] : ['dispatch area'],
                things: emptyContext ? [] : ['handheld scanner'],
            },
            reportedBy: 'A. Reporter',
            reportedAt: '2026-10-05T12:00:00.000Z',
        };
    }

    function makeNote(id: string, sourceText: string): ImportedNote {
        return {
            id,
            proposal: {
                sourceText,
                sourceReference: { artifact: null, locator: null },
                sourceOrigin: 'unknown',
                verificationStatus: 'unreviewed',
                interpretation: 'A provisional interpretation.',
                openQuestions: [],
            },
            acceptedAt: '2026-10-05T12:00:00.000Z',
        };
    }
});
