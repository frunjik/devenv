import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportedNote, ProblemTicket, StoredTicket, TicketStatus } from '@shared';
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

    describe('sorting and searching', () => {
        function ticket(
            id: string,
            overrides: Partial<ProblemTicket> & { frame?: Partial<ProblemTicket['problem']> } = {},
        ): ProblemTicket {
            const { frame, ...rest } = overrides;
            return {
                ...makeTicket(id, `Title ${id}`, ['note-1']),
                report: 'Neutral report',
                ...rest,
                problem: { condition: 'Neutral condition', affected: 'Neutral party', impact: 'Neutral impact', ...frame },
            };
        }

        function setTickets(tickets: ProblemTicket[]): void {
            fixture.componentRef.setInput('tickets', tickets);
            fixture.detectChanges();
        }

        function ids(): string[] {
            return Array.from(fixture.nativeElement.querySelectorAll('.ticket-id') as NodeListOf<HTMLElement>)
                .map(element => element.textContent?.trim() ?? '');
        }

        function search(text: string): void {
            const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
            input.value = text;
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();
        }

        function sortBy(property: string): void {
            const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
            select.value = property;
            select.dispatchEvent(new Event('change'));
            fixture.detectChanges();
        }

        function directionButton(): HTMLButtonElement {
            return fixture.nativeElement.querySelector('.sort-direction') as HTMLButtonElement;
        }

        it('shows no controls while there are no tickets', () => {
            expect(fixture.nativeElement.querySelector('input[type="search"]')).toBeNull();
            expect(fixture.nativeElement.querySelector('select')).toBeNull();
        });

        it('lists newest first by creation time by default', () => {
            setTickets([
                ticket('old', { reportedAt: '2026-01-01T00:00:00.000Z' }),
                ticket('new', { reportedAt: '2026-03-01T00:00:00.000Z' }),
                ticket('mid', { reportedAt: '2026-02-01T00:00:00.000Z' }),
            ]);

            expect(ids()).toEqual(['new', 'mid', 'old']);
            expect(directionButton().textContent).toContain('Newest first');
        });

        it('toggles the direction of the current property', () => {
            setTickets([
                ticket('old', { reportedAt: '2026-01-01T00:00:00.000Z' }),
                ticket('new', { reportedAt: '2026-03-01T00:00:00.000Z' }),
            ]);

            directionButton().click();
            fixture.detectChanges();

            expect(ids()).toEqual(['old', 'new']);
            expect(directionButton().textContent).toContain('Oldest first');
        });

        it('sorts by title ascending first, ignoring case, and can be reversed', () => {
            setTickets([
                ticket('b', { title: 'beta' }),
                ticket('c', { title: 'Gamma' }),
                ticket('a', { title: 'Alpha' }),
            ]);

            sortBy('title');
            expect(ids()).toEqual(['a', 'b', 'c']);
            expect(directionButton().textContent).toContain('A to Z');

            directionButton().click();
            fixture.detectChanges();
            expect(ids()).toEqual(['c', 'b', 'a']);
            expect(directionButton().textContent).toContain('Z to A');
        });

        it('sorts by scope level in widening order rather than alphabetically', () => {
            setTickets([
                ticket('cross', { scope: { level: 'cross-system', label: 'x' } }),
                ticket('op', { scope: { level: 'operation', label: 'x' } }),
                ticket('sys', { scope: { level: 'system', label: 'x' } }),
                ticket('flow', { scope: { level: 'workflow', label: 'x' } }),
            ]);

            sortBy('scope');
            expect(ids()).toEqual(['op', 'flow', 'sys', 'cross']);
        });

        it('sorts by reporter and keeps the original order for ties', () => {
            setTickets([
                ticket('z1', { reportedBy: 'Zed' }),
                ticket('a1', { reportedBy: 'Ann' }),
                ticket('z2', { reportedBy: 'Zed' }),
            ]);

            sortBy('reporter');
            expect(ids()).toEqual(['a1', 'z1', 'z2']);
        });

        it('puts tickets with missing values last in either direction', () => {
            setTickets([
                ticket('none', { reportedBy: '' }),
                ticket('ann', { reportedBy: 'Ann' }),
                ticket('bob', { reportedBy: 'Bob' }),
            ]);

            sortBy('reporter');
            expect(ids()).toEqual(['ann', 'bob', 'none']);

            directionButton().click();
            fixture.detectChanges();
            expect(ids()).toEqual(['bob', 'ann', 'none']);
        });

        it('puts tickets with a blank title last when sorting by title', () => {
            setTickets([
                ticket('blank', { title: '  ' }),
                ticket('named', { title: 'Alpha' }),
            ]);

            sortBy('title');

            expect(ids()).toEqual(['named', 'blank']);
        });

        it('puts tickets with an unreadable creation time last', () => {
            setTickets([
                ticket('bad', { reportedAt: 'not a date' }),
                ticket('good', { reportedAt: '2026-01-01T00:00:00.000Z' }),
            ]);

            expect(ids()).toEqual(['good', 'bad']);
        });

        it('restores the default direction of each property when the property changes', () => {
            setTickets([
                ticket('a', { title: 'Alpha', reportedAt: '2026-01-01T00:00:00.000Z' }),
                ticket('b', { title: 'Beta', reportedAt: '2026-02-01T00:00:00.000Z' }),
            ]);

            sortBy('title');
            directionButton().click();
            fixture.detectChanges();
            sortBy('created');

            expect(ids()).toEqual(['b', 'a']);
        });

        it('searches title, report, and problem-frame fields, ignoring case and accents', () => {
            setTickets([
                ticket('title', { title: 'Scanner CRASH' }),
                ticket('report', { report: 'Pallet label unreadable' }),
                ticket('condition', { frame: { condition: 'Réservation duplicated' } }),
                ticket('affected', { frame: { affected: 'Night shift' } }),
                ticket('impact', { frame: { impact: 'Late shipment' } }),
            ]);

            search('crash');
            expect(ids()).toEqual(['title']);
            search('LABEL');
            expect(ids()).toEqual(['report']);
            search('reservation');
            expect(ids()).toEqual(['condition']);
            search('night');
            expect(ids()).toEqual(['affected']);
            search('shipment');
            expect(ids()).toEqual(['impact']);
        });

        it('ignores surrounding whitespace and shows everything again when cleared', () => {
            setTickets([
                ticket('one', { title: 'Alpha' }),
                ticket('two', { title: 'Beta' }),
            ]);

            search('  alp ');
            expect(ids()).toEqual(['one']);
            search('');
            expect(ids().length).toBe(2);
        });

        it('does not search note text, reporter, or scope', () => {
            setTickets([ticket('one', { title: 'Alpha', reportedBy: 'Zorro', scope: { level: 'system', label: 'Warehouse' } })]);

            search('zorro');
            expect(ids()).toEqual([]);
            search('warehouse');
            expect(ids()).toEqual([]);
            search('scanner timed out');
            expect(ids()).toEqual([]);
        });

        it('shows a no-match message with the controls kept, without altering the tickets', () => {
            const tickets = [ticket('one', { title: 'Alpha' })];
            setTickets(tickets);

            search('nothing like this');

            expect(fixture.nativeElement.textContent).toContain('No matching tickets.');
            expect(fixture.nativeElement.textContent).not.toContain('No framed problem tickets yet.');
            expect(fixture.nativeElement.querySelector('input[type="search"]')).not.toBeNull();
            expect(tickets.length).toBe(1);
            search('');
            expect(ids()).toEqual(['one']);
        });

        it('combines search with sorting', () => {
            setTickets([
                ticket('b', { title: 'Scan beta' }),
                ticket('a', { title: 'Scan alpha' }),
                ticket('x', { title: 'Other' }),
            ]);

            sortBy('title');
            search('scan');

            expect(ids()).toEqual(['a', 'b']);
        });
    });

    describe('assigning', () => {
        function stored(id: string, status: TicketStatus): StoredTicket {
            return { ...makeTicket(id, `Title ${id}`, undefined), status, version: 3, dataKind: 'real' };
        }

        function assign(card: number, value: string): void {
            const form = fixture.nativeElement.querySelectorAll('.assign-form')[card] as HTMLFormElement;
            const input = form.querySelector('input') as HTMLInputElement;
            input.value = value;
            input.dispatchEvent(new Event('input'));
            form.dispatchEvent(new Event('submit'));
            fixture.detectChanges();
        }

        it('emits the ticket and the trimmed assignee when an open ticket is assigned', () => {
            const requests: { ticket: StoredTicket; assigneeId: string }[] = [];
            fixture.componentInstance.assignRequested.subscribe(request => requests.push(request));
            const ticket = stored('a', { state: 'open' });
            fixture.componentRef.setInput('tickets', [ticket]);
            fixture.detectChanges();

            assign(0, '  user-2 ');

            expect(requests).toEqual([{ ticket, assigneeId: 'user-2' }]);
            expect((fixture.nativeElement.querySelector('.assign-form input') as HTMLInputElement).value).toBe('');
        });

        it('does not emit for a blank assignee', () => {
            const requests: unknown[] = [];
            fixture.componentInstance.assignRequested.subscribe(request => requests.push(request));
            fixture.componentRef.setInput('tickets', [stored('a', { state: 'open' })]);
            fixture.detectChanges();

            assign(0, '   ');

            expect(requests).toEqual([]);
        });

        it('offers reassigning an assigned ticket', () => {
            fixture.componentRef.setInput('tickets', [stored('a', { state: 'assigned', assigneeId: 'user-2' })]);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.assign-form button').textContent).toContain('Reassign');
        });

        it('offers no assignment for resolved, closed, duplicate, or unstored tickets', () => {
            fixture.componentRef.setInput('tickets', [
                stored('r', { state: 'resolved', assigneeId: 'u' }),
                stored('c', { state: 'closed', assigneeId: 'u' }),
                stored('d', { state: 'duplicate', duplicateOfId: 'x' }),
                makeTicket('local', 'Local', undefined),
            ]);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.assign-form')).toBeNull();
        });
    });

    describe('state badge', () => {
        function stored(id: string, status: TicketStatus): StoredTicket {
            return { ...makeTicket(id, `Title ${id}`, undefined), status, version: 1, dataKind: 'real' };
        }

        function badges(): string[] {
            return Array.from(fixture.nativeElement.querySelectorAll('.ticket-state') as NodeListOf<HTMLElement>)
                .map(badge => badge.textContent!.replace(/\s+/g, ' ').trim());
        }

        it('shows the lifecycle state of stored tickets, with the assignee or original when there is one', () => {
            fixture.componentRef.setInput('tickets', [
                stored('a', { state: 'open' }),
                stored('b', { state: 'assigned', assigneeId: 'user-2' }),
                stored('c', { state: 'resolved', assigneeId: 'user-2' }),
                stored('d', { state: 'closed', assigneeId: 'user-2' }),
                stored('e', { state: 'duplicate', duplicateOfId: 'T-1' }),
            ]);
            fixture.detectChanges();

            expect(badges()).toEqual([
                'Open',
                'Assigned to user-2',
                'Resolved by user-2',
                'Closed',
                'Duplicate of T-1',
            ]);
        });

        it('marks the badge with its state so it can be styled', () => {
            fixture.componentRef.setInput('tickets', [stored('a', { state: 'assigned', assigneeId: 'u' })]);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.ticket-state').getAttribute('data-state'))
                .toBe('assigned');
        });

        it('shows no badge for tickets that have not been stored yet', () => {
            fixture.componentRef.setInput('tickets', [makeTicket('local', 'Local ticket', undefined)]);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.ticket-state')).toBeNull();
        });
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
