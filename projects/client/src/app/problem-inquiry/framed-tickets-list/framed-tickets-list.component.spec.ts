import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportedNote, ProblemTicket, StoredTicket, TicketCommand, TicketContent, TicketHistoryEvent, TicketStatus } from '@shared';
import { FramedTicketsListComponent } from './framed-tickets-list.component';
import { METRIC_METHOD_STORAGE, MetricMethodStorage } from '../metric-method.service';

class FakeMetricMethodStorage implements MetricMethodStorage {
    readonly values = new Map<string, string>();

    getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string): void {
        this.values.set(key, value);
    }
}

describe('FramedTicketsListComponent', () => {
    let fixture: ComponentFixture<FramedTicketsListComponent>;
    let metricMethodStorage: FakeMetricMethodStorage;
    const notes = [
        makeNote('note-1', 'The scanner timed out before showing a result.'),
        makeNote('note-2', 'A retry may repeat the submission.'),
    ];

    beforeEach(async () => {
        metricMethodStorage = new FakeMetricMethodStorage();
        await TestBed.configureTestingModule({
            imports: [FramedTicketsListComponent],
            providers: [{ provide: METRIC_METHOD_STORAGE, useValue: metricMethodStorage }],
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

    describe('filtering by lifecycle state', () => {
        function stored(id: string, status: TicketStatus): StoredTicket {
            return { ...makeTicket(id, `Title ${id}`, undefined), status, version: 1, dataKind: 'real' };
        }

        function ids(): string[] {
            return Array.from(fixture.nativeElement.querySelectorAll('.ticket-id') as NodeListOf<HTMLElement>)
                .map(element => element.textContent?.trim() ?? '');
        }

        function filterByState(state: string): void {
            const select = fixture.nativeElement.querySelector('.state-filter select') as HTMLSelectElement;
            select.value = state;
            select.dispatchEvent(new Event('change'));
            fixture.detectChanges();
        }

        function search(text: string): void {
            const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
            input.value = text;
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();
        }

        it('shows every ticket, stored or not, under the default "All states" filter', () => {
            fixture.componentRef.setInput('tickets', [
                stored('open', { state: 'open' }),
                stored('assigned', { state: 'assigned', assigneeId: 'user-1' }),
                makeTicket('unstored', 'Not yet saved', undefined),
            ]);
            fixture.detectChanges();

            expect(ids()).toEqual(['open', 'assigned', 'unstored']);
        });

        it('narrows the list to tickets in the chosen state', () => {
            fixture.componentRef.setInput('tickets', [
                stored('open', { state: 'open' }),
                stored('assigned', { state: 'assigned', assigneeId: 'user-1' }),
                stored('resolved', { state: 'resolved', assigneeId: 'user-1' }),
                stored('closed', { state: 'closed' }),
                stored('duplicate', { state: 'duplicate', duplicateOfId: 'open' }),
            ]);
            fixture.detectChanges();

            filterByState('assigned');
            expect(ids()).toEqual(['assigned']);

            filterByState('resolved');
            expect(ids()).toEqual(['resolved']);

            filterByState('closed');
            expect(ids()).toEqual(['closed']);

            filterByState('duplicate');
            expect(ids()).toEqual(['duplicate']);
        });

        it('excludes a ticket that is not yet stored from every specific state', () => {
            fixture.componentRef.setInput('tickets', [
                stored('open', { state: 'open' }),
                makeTicket('unstored', 'Not yet saved', undefined),
            ]);
            fixture.detectChanges();

            filterByState('open');

            expect(ids()).toEqual(['open']);
        });

        it('combines the state filter with search', () => {
            fixture.componentRef.setInput('tickets', [
                { ...stored('open-a', { state: 'open' }), report: 'Barcode scanner froze.' },
                { ...stored('open-b', { state: 'open' }), report: 'Unrelated matter.' },
                { ...stored('closed-a', { state: 'closed' }), report: 'Barcode scanner froze.' },
            ]);
            fixture.detectChanges();

            filterByState('open');
            search('scanner');

            expect(ids()).toEqual(['open-a']);
        });

        it('shows a no-match message when the state filter leaves nothing, without altering the tickets', () => {
            const tickets = [stored('open', { state: 'open' })];
            fixture.componentRef.setInput('tickets', tickets);
            fixture.detectChanges();

            filterByState('closed');

            expect(fixture.nativeElement.textContent).toContain('No matching tickets.');
            expect(tickets.length).toBe(1);
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

    describe('metrics', () => {
        function estimated(id: string): ProblemTicket {
            return { ...makeTicket(id, `Title ${id}`, undefined), estimate: { impact: 4, urgency: 5, effort: 2 } };
        }

        function metrics(): string[] {
            return Array.from(fixture.nativeElement.querySelectorAll('.ticket-metric') as NodeListOf<HTMLElement>).map(
                element => element.textContent?.trim() ?? '',
            );
        }

        function chooseMethod(method: string): void {
            const select = fixture.nativeElement.querySelector('.metric-method select') as HTMLSelectElement;
            select.value = method;
            select.dispatchEvent(new Event('change'));
            fixture.detectChanges();
        }

        it('shows impact times urgency by default and says so when a ticket has no estimate', () => {
            fixture.componentRef.setInput('tickets', [estimated('a'), makeTicket('b', 'Title b', undefined)]);
            fixture.detectChanges();

            expect(metrics()).toEqual(['Impact × urgency: 20', 'Impact × urgency: no estimate']);
        });

        it('shows every ticket under another method when the switch changes', () => {
            fixture.componentRef.setInput('tickets', [estimated('a'), makeTicket('b', 'Title b', undefined)]);
            fixture.detectChanges();

            chooseMethod('wsjf');

            expect(metrics()).toEqual(['Weighted shortest job first: 4.5', 'Weighted shortest job first: no estimate']);
        });

        it('remembers the chosen metric method so it survives a reload', () => {
            fixture.componentRef.setInput('tickets', [estimated('a')]);
            fixture.detectChanges();

            chooseMethod('wsjf');

            expect(metricMethodStorage.getItem('metric-method')).toBe('wsjf');
        });

        it('restores a previously chosen metric method on reload', () => {
            metricMethodStorage.setItem('metric-method', 'wsjf');
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [FramedTicketsListComponent],
                providers: [{ provide: METRIC_METHOD_STORAGE, useValue: metricMethodStorage }],
            });
            fixture = TestBed.createComponent(FramedTicketsListComponent);
            fixture.componentRef.setInput('notes', notes);
            fixture.componentRef.setInput('tickets', [estimated('a')]);
            fixture.detectChanges();

            expect(metrics()).toEqual(['Weighted shortest job first: 4.5']);
        });
    });
    describe('editing', () => {
        function stored(id: string): StoredTicket {
            return { ...makeTicket(id, `Title ${id}`, undefined), status: { state: 'open' }, version: 3, dataKind: 'real' };
        }

        function field(name: string): HTMLInputElement {
            return fixture.nativeElement.querySelector(`.edit-form [name="${name}"]`) as HTMLInputElement;
        }

        function click(selector: string): void {
            (fixture.nativeElement.querySelector(selector) as HTMLElement).click();
            fixture.detectChanges();
        }

        function set(name: string, value: string): void {
            field(name).value = value;
        }

        function submit(): void {
            fixture.nativeElement.querySelector('.edit-form').dispatchEvent(new Event('submit'));
            fixture.detectChanges();
        }

        function request(): { ticket: StoredTicket; content: TicketContent }[] {
            const requests: { ticket: StoredTicket; content: TicketContent }[] = [];
            fixture.componentInstance.editRequested.subscribe(r => requests.push(r));
            return requests;
        }

        it('offers editing only on stored tickets, with the form hidden until asked for', () => {
            fixture.componentRef.setInput('tickets', [stored('a'), makeTicket('local', 'Local', undefined)]);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelectorAll('.edit-toggle').length).toBe(1);
            expect(fixture.nativeElement.querySelector('.edit-form')).toBeNull();
        });

        it('opens a form filled with the current content', () => {
            const ticket = { ...stored('a'), estimate: { impact: 4, urgency: 5, effort: 2 } };
            fixture.componentRef.setInput('tickets', [ticket]);
            fixture.detectChanges();

            click('.edit-toggle');

            expect(field('title').value).toBe('Title a');
            expect(field('report').value).toBe(ticket.report);
            expect(field('condition').value).toBe(ticket.problem.condition);
            expect(field('affected').value).toBe(ticket.problem.affected);
            expect(field('impact').value).toBe(ticket.problem.impact);
            expect(field('scopeLevel').value).toBe(ticket.scope.level);
            expect(field('scopeLabel').value).toBe(ticket.scope.label);
            expect([field('estimateImpact').value, field('estimateUrgency').value, field('estimateEffort').value])
                .toEqual(['4', '5', '2']);
        });

        it('emits the edited content and closes the form', () => {
            const requests = request();
            const ticket = stored('a');
            fixture.componentRef.setInput('tickets', [ticket]);
            fixture.detectChanges();
            click('.edit-toggle');
            set('title', 'New title');
            set('estimateImpact', '3');
            set('estimateUrgency', '2');
            set('estimateEffort', '1');

            submit();

            expect(requests).toEqual([{
                ticket,
                content: {
                    title: 'New title',
                    report: ticket.report,
                    problem: ticket.problem,
                    scope: ticket.scope,
                    estimate: { impact: 3, urgency: 2, effort: 1 },
                },
            }]);
            expect(fixture.nativeElement.querySelector('.edit-form')).toBeNull();
        });

        it('leaves the estimate out when none is rated', () => {
            const requests = request();
            fixture.componentRef.setInput('tickets', [stored('a')]);
            fixture.detectChanges();
            click('.edit-toggle');

            submit();

            expect(requests[0].content).not.toHaveProperty('estimate');
        });

        it('keeps the form open and says so when only some of the estimate is rated', () => {
            const requests = request();
            fixture.componentRef.setInput('tickets', [stored('a')]);
            fixture.detectChanges();
            click('.edit-toggle');
            set('estimateImpact', '3');

            submit();

            expect(requests).toEqual([]);
            expect(fixture.nativeElement.querySelector('.edit-form [role="alert"]').textContent)
                .toContain('Rate impact, urgency, and effort, or leave all three blank.');
        });

        it('keeps the form open for an estimate outside 1 to 5 or an unknown scope level', () => {
            const requests = request();
            fixture.componentRef.setInput('tickets', [stored('a')]);
            fixture.detectChanges();
            click('.edit-toggle');
            for (const name of ['estimateImpact', 'estimateUrgency', 'estimateEffort']) {
                const option = document.createElement('option');
                option.value = '9';
                field(name).append(option);
                set(name, '9');
            }

            submit();
            const scope = field('scopeLevel');
            const option = document.createElement('option');
            option.value = 'galaxy';
            scope.append(option);
            set('scopeLevel', 'galaxy');
            for (const name of ['estimateImpact', 'estimateUrgency', 'estimateEffort']) {
                set(name, '');
            }
            submit();

            expect(requests).toEqual([]);
            expect(fixture.nativeElement.querySelector('.edit-form [role="alert"]').textContent).toContain('scope level');
        });

        it('cancels without emitting and starts fresh next time', () => {
            const requests = request();
            fixture.componentRef.setInput('tickets', [stored('a')]);
            fixture.detectChanges();
            click('.edit-toggle');
            set('title', 'Discarded');

            click('.edit-cancel');
            click('.edit-toggle');

            expect(requests).toEqual([]);
            expect(field('title').value).toBe('Title a');
        });

        it('closes the form when the toggle is used again', () => {
            fixture.componentRef.setInput('tickets', [stored('a')]);
            fixture.detectChanges();

            click('.edit-toggle');
            click('.edit-toggle');

            expect(fixture.nativeElement.querySelector('.edit-form')).toBeNull();
        });
    });
    describe('history', () => {
        const ada = { id: 'user-1', name: 'Ada' };
        const at = '2026-10-06T10:00:00.000Z';
        const assignEvent: TicketHistoryEvent = {
            kind: 'assign', actor: ada, at, before: { state: 'open' }, after: { state: 'assigned', assigneeId: 'user-2' },
        };

        function stored(id: string): StoredTicket {
            return { ...makeTicket(id, `Title ${id}`, undefined), status: { state: 'open' }, version: 1, dataKind: 'real' };
        }

        function toggle(): void {
            (fixture.nativeElement.querySelector('.history-toggle') as HTMLElement).click();
            fixture.detectChanges();
        }

        function entries(): string[] {
            return Array.from(fixture.nativeElement.querySelectorAll('.history-entry') as NodeListOf<HTMLElement>)
                .map(entry => entry.textContent!.replace(/\s+/g, ' ').trim());
        }

        it('offers history only on stored tickets and asks for it when opened', () => {
            const requests: StoredTicket[] = [];
            fixture.componentInstance.historyRequested.subscribe(ticket => requests.push(ticket));
            const ticket = stored('a');
            fixture.componentRef.setInput('tickets', [ticket, makeTicket('local', 'Local', undefined)]);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelectorAll('.history-toggle').length).toBe(1);
            toggle();

            expect(requests).toEqual([ticket]);
            expect(fixture.nativeElement.querySelector('.history').textContent).toContain('Loading history');
        });

        it('says so when a ticket has no history', () => {
            fixture.componentRef.setInput('tickets', [stored('a')]);
            fixture.componentRef.setInput('histories', { a: [] });
            fixture.detectChanges();

            toggle();

            expect(fixture.nativeElement.querySelector('.history').textContent).toContain('No changes yet.');
        });

        it('lists state changes and edits with who and when', () => {
            const edit: TicketHistoryEvent = {
                kind: 'edit',
                actor: { id: 'user-2' },
                at,
                before: { title: 'Old', report: 'r', problem: { condition: 'c', affected: 'a', impact: 'i' }, scope: { level: 'system', label: 'l' } },
                after: {
                    title: 'New',
                    report: 'r2',
                    problem: { condition: 'c', affected: 'a', impact: 'changed' },
                    scope: { level: 'workflow', label: 'l' },
                    estimate: { impact: 1, urgency: 1, effort: 1 },
                },
            };
            fixture.componentRef.setInput('tickets', [stored('a')]);
            fixture.componentRef.setInput('histories', { a: [assignEvent, edit] });
            fixture.detectChanges();

            toggle();

            expect(entries()).toEqual([
                `Ada: Open → Assigned to user-2 ${at}`,
                `user-2: Edited title, report, problem frame, scope, estimate ${at}`,
            ]);
        });

        it('hides the history when the toggle is used again', () => {
            fixture.componentRef.setInput('tickets', [stored('a')]);
            fixture.componentRef.setInput('histories', { a: [assignEvent] });
            fixture.detectChanges();

            toggle();
            toggle();

            expect(fixture.nativeElement.querySelector('.history')).toBeNull();
        });
    });
    describe('state actions', () => {
        function stored(id: string, status: TicketStatus): StoredTicket {
            return { ...makeTicket(id, `Title ${id}`, undefined), status, version: 3, dataKind: 'real' };
        }

        function show(status: TicketStatus): StoredTicket {
            const ticket = stored('a', status);
            fixture.componentRef.setInput('tickets', [ticket]);
            fixture.detectChanges();
            return ticket;
        }

        function actions(): string[] {
            return Array.from(fixture.nativeElement.querySelectorAll('.state-action') as NodeListOf<HTMLElement>)
                .map(button => button.textContent!.trim());
        }

        function commands(): { ticket: StoredTicket; command: TicketCommand }[] {
            const requests: { ticket: StoredTicket; command: TicketCommand }[] = [];
            fixture.componentInstance.commandRequested.subscribe(request => requests.push(request));
            return requests;
        }

        it('offers the actions each state allows', () => {
            const expected: [TicketStatus, string[]][] = [
                [{ state: 'open' }, []],
                [{ state: 'assigned', assigneeId: 'u' }, ['Unassign', 'Resolve']],
                [{ state: 'resolved', assigneeId: 'u' }, ['Close', 'Reopen']],
                [{ state: 'closed', assigneeId: 'u' }, ['Reopen']],
                [{ state: 'duplicate', duplicateOfId: 'x' }, ['Reopen']],
            ];

            expect(expected.map(([status]) => { show(status); return actions(); })).toEqual(expected.map(([, names]) => names));
        });

        it('asks for each action with its command', () => {
            const requests = commands();
            const ticket = show({ state: 'assigned', assigneeId: 'u' });

            for (const name of ['Unassign', 'Resolve']) {
                const button = Array.from(fixture.nativeElement.querySelectorAll('.state-action') as NodeListOf<HTMLElement>)
                    .find(candidate => candidate.textContent!.trim() === name)!;
                button.click();
            }

            expect(requests).toEqual([
                { ticket, command: { kind: 'unassign' } },
                { ticket, command: { kind: 'resolve' } },
            ]);
        });

        it('asks for the remaining commands', () => {
            const requests = commands();
            const resolved = show({ state: 'resolved', assigneeId: 'u' });
            for (const button of Array.from(fixture.nativeElement.querySelectorAll('.state-action') as NodeListOf<HTMLElement>)) {
                button.click();
            }

            expect(requests).toEqual([
                { ticket: resolved, command: { kind: 'close' } },
                { ticket: resolved, command: { kind: 'reopen' } },
            ]);
        });

        function markDuplicate(original: string): void {
            const form = fixture.nativeElement.querySelector('.duplicate-form') as HTMLFormElement;
            (form.querySelector('input') as HTMLInputElement).value = original;
            form.dispatchEvent(new Event('submit'));
            fixture.detectChanges();
        }

        it('marks a ticket as a duplicate of the trimmed original id and clears the box', () => {
            const requests = commands();
            const ticket = show({ state: 'open' });

            markDuplicate('  T-9 ');

            expect(requests).toEqual([{ ticket, command: { kind: 'mark-duplicate', duplicateOfId: 'T-9' } }]);
            expect((fixture.nativeElement.querySelector('.duplicate-form input') as HTMLInputElement).value).toBe('');
        });

        it('does not mark a duplicate without an original id', () => {
            const requests = commands();
            show({ state: 'closed' });

            markDuplicate('   ');

            expect(requests).toEqual([]);
        });

        it('offers no duplicate form for a duplicate or an unstored ticket', () => {
            fixture.componentRef.setInput('tickets', [
                stored('d', { state: 'duplicate', duplicateOfId: 'x' }),
                makeTicket('local', 'Local', undefined),
            ]);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.duplicate-form')).toBeNull();
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
