import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportedNote, ProblemTicket } from '@shared';
import { TicketFramingComponent } from './ticket-framing.component';

describe('TicketFramingComponent', () => {
    let fixture: ComponentFixture<TicketFramingComponent>;
    const notes: ImportedNote[] = [
        makeNote('note-1', 'A scanner retry can repeat a submission.'),
        makeNote('note-2', 'The outcome may be unclear after a timeout.'),
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TicketFramingComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TicketFramingComponent);
        fixture.componentRef.setInput('notes', notes);
        fixture.detectChanges();
    });

    it('emits an explicitly framed ticket linked to each selected accepted note', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        selectNotes(['note-1', 'note-2']);
        enterTicketFields();

        submitForm();

        expect(tickets).toEqual([{
            id: 'ticket-1',
            title: 'Unclear scan retry outcome',
            report: 'A scanner retry can repeat a submission.',
            problem: {
                condition: 'A retry may submit the same action more than once.',
                affected: 'Warehouse operator',
                impact: 'The operator cannot tell whether the original action completed.',
            },
            sourceNoteIds: ['note-1', 'note-2'],
            scope: {
                level: 'workflow',
                label: 'Outbound scanning',
            },
            context: {
                people: ['warehouse operator', 'floor lead'],
                places: ['dispatch area'],
                things: ['handheld scanner', 'shipment'],
            },
            reportedBy: 'A. Reporter',
            reportedAt: new Date('2026-10-05T12:00').toISOString(),
        }]);
        expect(fixture.nativeElement.textContent).not.toContain('Complete all required fields.');
    });

    it('does not emit a ticket when a required field is missing', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        selectNotes(['note-1']);
        enterTicketFields();
        setValue('#ticket-title', '   ');

        submitForm();

        expect(tickets).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('Complete all required fields.');
    });

    it('does not emit a ticket when no accepted note is selected', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        enterTicketFields();

        submitForm();

        expect(tickets).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('Select one or more available accepted notes.');
    });

    it('does not link a note that is not an accepted-note option', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        const select = fixture.nativeElement.querySelector('#source-note-ids') as HTMLSelectElement;
        const unacceptedOption = document.createElement('option');
        unacceptedOption.value = 'note-unknown';
        unacceptedOption.selected = true;
        select.append(unacceptedOption);
        enterTicketFields();

        submitForm();

        expect(tickets).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('Select one or more available accepted notes.');
    });

    it('does not emit a ticket with an invalid scope level', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        selectNotes(['note-1']);
        enterTicketFields();
        const scopeLevel = fixture.nativeElement.querySelector('#scope-level') as HTMLSelectElement;
        const workflowOption = scopeLevel.querySelector('option[value="workflow"]') as HTMLOptionElement;
        workflowOption.value = 'invalid';
        scopeLevel.value = 'invalid';

        submitForm();

        expect(tickets).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('Select a valid scope level.');
    });

    it('does not emit a ticket with an invalid creation time', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        selectNotes(['note-1']);
        enterTicketFields();
        const reportedAt = fixture.nativeElement.querySelector('#reported-at') as HTMLInputElement;
        reportedAt.type = 'text';
        setValue('#reported-at', 'not a date');

        submitForm();

        expect(tickets).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('Enter a valid creation time.');
    });

    it('adds an estimate when impact, urgency, and effort are all rated', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        selectNotes(['note-1']);
        enterTicketFields();
        setValue('#estimate-impact', '4');
        setValue('#estimate-urgency', '5');
        setValue('#estimate-effort', '2');

        submitForm();

        expect(tickets[0].estimate).toEqual({ impact: 4, urgency: 5, effort: 2 });
    });

    it('leaves the estimate out when no rating is chosen', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        selectNotes(['note-1']);
        enterTicketFields();

        submitForm();

        expect(tickets[0]).not.toHaveProperty('estimate');
    });

    it('does not emit a ticket with only some of the estimate rated', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        selectNotes(['note-1']);
        enterTicketFields();
        setValue('#estimate-impact', '4');

        submitForm();

        expect(tickets).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('Rate impact, urgency, and effort, or leave all three blank.');
    });

    it('does not emit a ticket with an estimate outside 1 to 5', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        selectNotes(['note-1']);
        enterTicketFields();
        for (const id of ['impact', 'urgency', 'effort']) {
            const select = fixture.nativeElement.querySelector(`#estimate-${id}`) as HTMLSelectElement;
            const option = document.createElement('option');
            option.value = '9';
            select.append(option);
            select.value = '9';
        }

        submitForm();

        expect(tickets).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('Rate impact, urgency, and effort, or leave all three blank.');
    });
    it('prompts for an accepted note when there are no notes to select', () => {
        fixture.componentRef.setInput('notes', []);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Accept a note before framing a ticket.');
        expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    });

    it('assigns a new in-memory ticket identity for each explicit submission', () => {
        const tickets: ProblemTicket[] = [];
        fixture.componentInstance.ticketCreated.subscribe(ticket => tickets.push(ticket));
        selectNotes(['note-1']);
        enterTicketFields();

        submitForm();
        submitForm();

        expect(tickets.map(ticket => ticket.id)).toEqual(['ticket-1', 'ticket-2']);
    });

    function enterTicketFields(): void {
        setValue('#ticket-title', 'Unclear scan retry outcome');
        setValue('#ticket-report', 'A scanner retry can repeat a submission.');
        setValue('#problem-condition', 'A retry may submit the same action more than once.');
        setValue('#problem-affected', 'Warehouse operator');
        setValue('#problem-impact', 'The operator cannot tell whether the original action completed.');
        setValue('#scope-level', 'workflow');
        setValue('#scope-label', 'Outbound scanning');
        setValue('#context-people', 'warehouse operator\n\n floor lead \n ');
        setValue('#context-places', 'dispatch area');
        setValue('#context-things', 'handheld scanner\nshipment');
        setValue('#reported-by', 'A. Reporter');
        setValue('#reported-at', '2026-10-05T12:00');
    }

    function selectNotes(ids: string[]): void {
        const select = fixture.nativeElement.querySelector('#source-note-ids') as HTMLSelectElement;
        for (const option of Array.from(select.options)) {
            option.selected = ids.includes(option.value);
        }
    }

    function setValue(selector: string, value: string): void {
        const control = fixture.nativeElement.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
        control.value = value;
        control.dispatchEvent(new Event('input'));
    }

    function submitForm(): void {
        fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
        fixture.detectChanges();
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
