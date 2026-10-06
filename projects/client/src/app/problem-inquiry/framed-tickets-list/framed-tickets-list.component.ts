import { Component, EventEmitter, Input, Output } from '@angular/core';
import { calculateMetric, METRIC_METHODS, MetricMethod } from '../ticket-metrics';
import { EstimateRating, ImportedNote, ProblemTicket, ScopeLevel, StoredTicket, TicketCommand, TicketContent, TicketHistoryEvent, TicketStatus } from '@shared';

@Component({
    selector: 'app-framed-tickets-list',
    standalone: true,
    template: `
        <section class="framed-tickets" aria-labelledby="framed-tickets-heading">
            <h2 id="framed-tickets-heading">Framed problem tickets</h2>

            @if (tickets.length === 0) {
                <p class="empty-state">No framed problem tickets yet.</p>
            } @else {
                <div class="ticket-controls">
                    <label>
                        Search tickets
                        <input type="search" [value]="query" (input)="query = $any($event.target).value">
                    </label>
                    <label>
                        Sort by
                        <select [value]="sortProperty" (change)="changeSortProperty($any($event.target).value)">
                            @for (option of sortOptions; track option.value) {
                                <option [value]="option.value" [selected]="option.value === sortProperty">{{ option.label }}</option>
                            }
                        </select>
                    </label>
                    <label class="metric-method">
                        Metric
                        <select [value]="metricMethod" (change)="metricMethod = $any($event.target).value">
                            @for (method of metricMethods; track method.id) {
                                <option [value]="method.id" [selected]="method.id === metricMethod">{{ method.label }}</option>
                            }
                        </select>
                    </label>
                    <button type="button" class="sort-direction" (click)="toggleDirection()">{{ directionLabel }}</button>
                </div>
            }

            @if (tickets.length > 0 && displayedTickets.length === 0) {
                <p class="empty-state">No matching tickets.</p>
            } @else if (tickets.length > 0) {
                <ul class="ticket-list">
                    @for (ticket of displayedTickets; track ticket.id) {
                        <li>
                            <article class="ticket-card" [attr.aria-label]="'Problem ticket ' + ticket.id">
                                <header>
                                    <p class="ticket-id">{{ ticket.id }}</p>
                                    @if (statusOf(ticket); as status) {
                                        <p class="ticket-state" [attr.data-state]="status.state">{{ stateLabel(status) }}</p>
                                    }
                                    <h3>{{ ticket.title }}</h3>
                                    <p class="ticket-metric">{{ metricLabel }}: {{ metricOf(ticket) ?? 'no estimate' }}</p>
                                </header>

                                @if (canAssign(ticket)) {
                                    <form class="assign-form" (submit)="requestAssign($event, ticket, assignee)">
                                        <label>
                                            Assignee
                                            <input #assignee type="text" autocomplete="off">
                                        </label>
                                        <button type="submit">{{ isAssigned(ticket) ? 'Reassign' : 'Assign' }}</button>
                                    </form>
                                }

                                @if (isStored(ticket)) {
                                    <button type="button" class="history-toggle" (click)="toggleHistory(ticket)">
                                        {{ historyId === ticket.id ? 'Hide history' : 'History' }}
                                    </button>
                                    @if (historyId === ticket.id) {
                                        <section class="history" aria-label="Ticket history">
                                            @if (histories[ticket.id]; as events) {
                                                <ol>
                                                    @for (event of events; track $index) {
                                                        <li class="history-entry">
                                                            {{ actorName(event) }}: {{ describeEvent(event) }}
                                                            <time [attr.datetime]="event.at">{{ event.at }}</time>
                                                        </li>
                                                    } @empty {
                                                        <li>No changes yet.</li>
                                                    }
                                                </ol>
                                            } @else {
                                                <p>Loading history…</p>
                                            }
                                        </section>
                                    }
                                }
                                @if (isStored(ticket)) {
                                    <button type="button" class="edit-toggle" (click)="toggleEdit(ticket.id)">
                                        {{ editingId === ticket.id ? 'Close editor' : 'Edit' }}
                                    </button>
                                    @if (editingId === ticket.id) {
                                        <form class="edit-form" (submit)="requestEdit($event, ticket)">
                                            <label>Title <input name="title" type="text" [value]="ticket.title"></label>
                                            <label>Report <textarea name="report" [value]="ticket.report"></textarea></label>
                                            <label>Undesirable condition <textarea name="condition" [value]="ticket.problem.condition"></textarea></label>
                                            <label>Who or what is affected <input name="affected" type="text" [value]="ticket.problem.affected"></label>
                                            <label>Why it matters <textarea name="impact" [value]="ticket.problem.impact"></textarea></label>
                                            <label>
                                                Scope level
                                                <select name="scopeLevel">
                                                    @for (level of scopeLevels; track level) {
                                                        <option [value]="level" [selected]="level === ticket.scope.level">{{ level }}</option>
                                                    }
                                                </select>
                                            </label>
                                            <label>Scope description <input name="scopeLabel" type="text" [value]="ticket.scope.label"></label>
                                            @for (rating of ratingFields; track rating.name) {
                                                <label>
                                                    {{ rating.label }} (1 to 5)
                                                    <select [name]="rating.name">
                                                        <option value="" [selected]="!ticket.estimate">Not rated</option>
                                                        @for (value of ratingValues; track value) {
                                                            <option [value]="value" [selected]="ticket.estimate?.[rating.key] === value">{{ value }}</option>
                                                        }
                                                    </select>
                                                </label>
                                            }
                                            @if (editError) {
                                                <p role="alert">{{ editError }}</p>
                                            }
                                            <button type="submit">Save changes</button>
                                            <button type="button" class="edit-cancel" (click)="editingId = undefined">Cancel</button>
                                        </form>
                                    }
                                }
                                @if (isStored(ticket)) {
                                    <div class="state-actions">
                                        @for (action of actionsFor(ticket); track action.kind) {
                                            <button type="button" class="state-action" (click)="requestCommand(ticket, { kind: action.kind })">{{ action.label }}</button>
                                        }
                                    </div>
                                    @if (ticket.status.state !== 'duplicate') {
                                        <form class="duplicate-form" (submit)="requestDuplicate($event, ticket, original)">
                                            <label>
                                                Duplicate of
                                                <input #original type="text" autocomplete="off" placeholder="Original ticket id">
                                            </label>
                                            <button type="submit">Mark duplicate</button>
                                        </form>
                                    }
                                }
                                <p><strong>Report</strong>: {{ ticket.report }}</p>

                                <section aria-label="Problem frame">
                                    <h4>Problem frame</h4>
                                    <dl>
                                        <dt>Condition</dt>
                                        <dd>{{ ticket.problem.condition }}</dd>
                                        <dt>Affected</dt>
                                        <dd>{{ ticket.problem.affected }}</dd>
                                        <dt>Impact</dt>
                                        <dd>{{ ticket.problem.impact }}</dd>
                                    </dl>
                                </section>

                                <section aria-label="Scope and work context">
                                    <h4>Scope and work context</h4>
                                    <p>{{ ticket.scope.level }}: {{ ticket.scope.label }}</p>
                                    <dl class="context-list">
                                        <dt>People</dt>
                                        <dd>
                                            <ul>
                                                @for (person of ticket.context.people; track $index) {
                                                    <li>{{ person }}</li>
                                                } @empty {
                                                    <li>No people recorded.</li>
                                                }
                                            </ul>
                                        </dd>
                                        <dt>Places</dt>
                                        <dd>
                                            <ul>
                                                @for (place of ticket.context.places; track $index) {
                                                    <li>{{ place }}</li>
                                                } @empty {
                                                    <li>No places recorded.</li>
                                                }
                                            </ul>
                                        </dd>
                                        <dt>Things</dt>
                                        <dd>
                                            <ul>
                                                @for (thing of ticket.context.things; track $index) {
                                                    <li>{{ thing }}</li>
                                                } @empty {
                                                    <li>No things recorded.</li>
                                                }
                                            </ul>
                                        </dd>
                                    </dl>
                                </section>

                                <section aria-label="Accepted note references">
                                    <h4>Accepted note references</h4>
                                    @if (ticket.sourceNoteIds?.length) {
                                        <ul class="source-notes">
                                            @for (noteId of ticket.sourceNoteIds ?? []; track noteId) {
                                                <li>
                                                    <strong>{{ noteId }}</strong>
                                                    @if (findNote(noteId); as note) {
                                                        <p>{{ note.proposal.sourceText }}</p>
                                                        <p>{{ note.proposal.interpretation }}</p>
                                                    } @else {
                                                        <p>Note is not currently available.</p>
                                                    }
                                                </li>
                                            }
                                        </ul>
                                    } @else {
                                        <p class="no-note-references">No accepted note references recorded.</p>
                                    }
                                </section>

                                <footer>
                                    <p>Reported by {{ ticket.reportedBy }}</p>
                                    <p>Created <time [attr.datetime]="ticket.reportedAt">{{ ticket.reportedAt }}</time></p>
                                </footer>
                            </article>
                        </li>
                    }
                </ul>
            }
        </section>
    `,
    styles: `
        .framed-tickets {
            max-width: 64rem;
            margin-block: 2rem;
        }

        .ticket-controls {
            display: flex;
            flex-wrap: wrap;
            align-items: end;
            gap: 0.5rem 1rem;
            margin-block-end: 1rem;
        }

        .ticket-controls label {
            display: grid;
            gap: 0.2rem;
            min-width: 0;
        }

        .ticket-controls input,
        .ticket-controls select {
            max-width: 100%;
            box-sizing: border-box;
        }

        .ticket-list,
        .source-notes {
            display: grid;
            gap: 1rem;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .ticket-card {
            display: grid;
            gap: 1rem;
            padding: 1.25rem;
            border: 1px solid #cbd5e1;
            border-radius: 0.65rem;
            background: #fff;
        }

        .ticket-card header,
        .ticket-card footer {
            display: flex;
            flex-wrap: wrap;
            align-items: baseline;
            justify-content: space-between;
            gap: 0.5rem 1rem;
        }

        h3,
        h4,
        p {
            margin-block: 0;
        }

        .ticket-id {
            color: #475569;
            font-weight: 700;
        }

        .state-actions {
            display: flex;
            gap: 0.5rem;
            margin-block: 0.5rem;
        }

        .duplicate-form,
        .assign-form {
            display: flex;
            flex-wrap: wrap;
            align-items: end;
            gap: 0.5rem;
            margin-block: 0.5rem;
        }

        .assign-form label {
            display: grid;
            gap: 0.2rem;
            font-weight: 600;
        }

        .edit-form {
            display: grid;
            gap: 0.5rem;
            margin-block: 0.5rem;
        }

        .edit-form label {
            display: grid;
            gap: 0.2rem;
            font-weight: 600;
        }

        .history ol {
            margin-block: 0.5rem;
            padding-inline-start: 1.25rem;
        }

        .history time {
            color: #475569;
            font-size: 0.85rem;
        }

        .ticket-metric {
            margin: 0.2rem 0;
            color: #475569;
            font-size: 0.9rem;
        }

        .ticket-state {
            display: inline-block;
            margin: 0;
            border: 1px solid #94a3b8;
            border-radius: 999px;
            padding: 0.05rem 0.6rem;
            color: #334155;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .ticket-state[data-state='assigned'] {
            border-color: #2563eb;
            color: #1d4ed8;
        }

        .ticket-state[data-state='resolved'],
        .ticket-state[data-state='closed'] {
            border-color: #15803d;
            color: #166534;
        }

        dl {
            display: grid;
            grid-template-columns: minmax(7rem, auto) 1fr;
            gap: 0.4rem 1rem;
            margin: 0;
        }

        dt {
            font-weight: 700;
        }

        dd {
            min-width: 0;
            margin: 0;
        }

        .context-list ul {
            margin: 0;
            padding-inline-start: 1.25rem;
        }

        .source-notes {
            margin-block-start: 0.5rem;
        }

        .source-notes li {
            padding: 0.75rem;
            border-inline-start: 3px solid #94a3b8;
            background: #f8fafc;
            overflow-wrap: anywhere;
        }

        @media (max-width: 40rem) {
            .ticket-card {
                padding: 1rem;
            }

            dl {
                grid-template-columns: 1fr;
                gap: 0.15rem;
            }

            dd + dt {
                margin-block-start: 0.5rem;
            }
        }
    `,
})
export class FramedTicketsListComponent {
    @Input() tickets: readonly (ProblemTicket | StoredTicket)[] = [];
    @Input() notes: readonly ImportedNote[] = [];
    readonly metricMethods = METRIC_METHODS;
    readonly scopeLevels: readonly ScopeLevel[] = ['operation', 'workflow', 'system', 'cross-system'];
    readonly ratingValues: readonly EstimateRating[] = [1, 2, 3, 4, 5];
    readonly ratingFields = [
        { name: 'estimateImpact', key: 'impact', label: 'Impact' },
        { name: 'estimateUrgency', key: 'urgency', label: 'Urgency' },
        { name: 'estimateEffort', key: 'effort', label: 'Effort' },
    ] as const;
    historyId?: string;
    editingId?: string;
    editError = '';
    metricMethod: MetricMethod = 'impact-urgency';

    @Input() histories: Readonly<Record<string, readonly TicketHistoryEvent[]>> = {};
    @Output() readonly commandRequested = new EventEmitter<{ ticket: StoredTicket; command: TicketCommand }>();
    @Output() readonly historyRequested = new EventEmitter<StoredTicket>();
    @Output() readonly editRequested = new EventEmitter<{ ticket: StoredTicket; content: TicketContent }>();
    @Output() readonly assignRequested = new EventEmitter<{ ticket: StoredTicket; assigneeId: string }>();

    readonly sortOptions: readonly { value: SortProperty; label: string }[] = [
        { value: 'created', label: 'Creation time' },
        { value: 'title', label: 'Title' },
        { value: 'scope', label: 'Scope level' },
        { value: 'reporter', label: 'Reporter' },
    ];

    query = '';
    sortProperty: SortProperty = 'created';
    ascending = false;

    get displayedTickets(): readonly ProblemTicket[] {
        const needle = normalize(this.query.trim());
        const matching = needle
            ? this.tickets.filter(ticket => searchableText(ticket).includes(needle))
            : [...this.tickets];
        return matching.sort((a, b) => this.compare(a, b));
    }

    get directionLabel(): string {
        const labels = DIRECTION_LABELS[this.sortProperty];
        return this.ascending ? labels.ascending : labels.descending;
    }

    changeSortProperty(property: SortProperty): void {
        this.sortProperty = property;
        this.ascending = property !== 'created';
    }

    toggleDirection(): void {
        this.ascending = !this.ascending;
    }

    get metricLabel(): string {
        return this.metricMethods.filter(method => method.id === this.metricMethod)[0].label;
    }

    metricOf(ticket: ProblemTicket | StoredTicket): number | undefined {
        return calculateMetric(this.metricMethod, ticket.estimate);
    }

    toggleHistory(ticket: StoredTicket): void {
        this.historyId = this.historyId === ticket.id ? undefined : ticket.id;
        if (this.historyId) {
            this.historyRequested.emit(ticket);
        }
    }

    actorName(event: TicketHistoryEvent): string {
        return event.actor.name ?? event.actor.id;
    }

    describeEvent(event: TicketHistoryEvent): string {
        if (event.kind !== 'edit') {
            return `${this.stateLabel(event.before)} → ${this.stateLabel(event.after)}`;
        }
        const { before, after } = event;
        const changed = [
            before.title !== after.title && 'title',
            before.report !== after.report && 'report',
            JSON.stringify(before.problem) !== JSON.stringify(after.problem) && 'problem frame',
            JSON.stringify(before.scope) !== JSON.stringify(after.scope) && 'scope',
            JSON.stringify(before.estimate) !== JSON.stringify(after.estimate) && 'estimate',
        ].filter(Boolean);
        return `Edited ${changed.join(', ')}`;
    }

    actionsFor(ticket: StoredTicket): { kind: 'unassign' | 'resolve' | 'close' | 'reopen'; label: string }[] {
        switch (ticket.status.state) {
            case 'assigned':
                return [{ kind: 'unassign', label: 'Unassign' }, { kind: 'resolve', label: 'Resolve' }];
            case 'resolved':
                return [{ kind: 'close', label: 'Close' }, { kind: 'reopen', label: 'Reopen' }];
            case 'closed':
            case 'duplicate':
                return [{ kind: 'reopen', label: 'Reopen' }];
            default:
                return [];
        }
    }

    requestCommand(ticket: StoredTicket, command: TicketCommand): void {
        this.commandRequested.emit({ ticket, command });
    }

    requestDuplicate(event: Event, ticket: StoredTicket, input: HTMLInputElement): void {
        event.preventDefault();
        const duplicateOfId = input.value.trim();
        if (duplicateOfId) {
            this.requestCommand(ticket, { kind: 'mark-duplicate', duplicateOfId });
            input.value = '';
        }
    }

    isStored(ticket: ProblemTicket | StoredTicket): ticket is StoredTicket {
        return this.statusOf(ticket) !== undefined;
    }

    toggleEdit(id: string): void {
        this.editingId = this.editingId === id ? undefined : id;
        this.editError = '';
    }

    requestEdit(event: Event, ticket: StoredTicket): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        const text = (name: string) => String(data.get(name));
        const scopeLevel = this.scopeLevels.find(level => level === text('scopeLevel'));
        if (!scopeLevel) {
            this.editError = 'Select a valid scope level.';
            return;
        }

        const rated = this.ratingFields.map(field => text(field.name));
        const [impact, urgency, effort] = rated.map(value => this.ratingValues.find(rating => String(rating) === value));
        const hasEstimate = rated.some(value => value !== '');
        if (hasEstimate && !(impact && urgency && effort)) {
            this.editError = 'Rate impact, urgency, and effort, or leave all three blank.';
            return;
        }

        const content: TicketContent = {
            title: text('title'),
            report: text('report'),
            problem: { condition: text('condition'), affected: text('affected'), impact: text('impact') },
            scope: { level: scopeLevel, label: text('scopeLabel') },
        };
        if (impact && urgency && effort) {
            content.estimate = { impact, urgency, effort };
        }
        this.editingId = undefined;
        this.editError = '';
        this.editRequested.emit({ ticket, content });
    }

    canAssign(ticket: ProblemTicket | StoredTicket): ticket is StoredTicket {
        const status = this.statusOf(ticket);
        return status?.state === 'open' || status?.state === 'assigned';
    }

    isAssigned(ticket: ProblemTicket | StoredTicket): boolean {
        return this.statusOf(ticket)?.state === 'assigned';
    }

    requestAssign(event: Event, ticket: ProblemTicket | StoredTicket, input: HTMLInputElement): void {
        event.preventDefault();
        const assigneeId = input.value.trim();
        if (assigneeId && this.canAssign(ticket)) {
            this.assignRequested.emit({ ticket, assigneeId });
            input.value = '';
        }
    }

    statusOf(ticket: ProblemTicket | StoredTicket): TicketStatus | undefined {
        return 'status' in ticket ? ticket.status : undefined;
    }

    stateLabel(status: TicketStatus): string {
        switch (status.state) {
            case 'open': return 'Open';
            case 'assigned': return `Assigned to ${status.assigneeId}`;
            case 'resolved': return `Resolved by ${status.assigneeId}`;
            case 'closed': return 'Closed';
            case 'duplicate': return `Duplicate of ${status.duplicateOfId}`;
        }
    }

    findNote(noteId: string): ImportedNote | undefined {
        return this.notes.find(note => note.id === noteId);
    }

    private compare(a: ProblemTicket, b: ProblemTicket): number {
        const left = sortKey(a, this.sortProperty);
        const right = sortKey(b, this.sortProperty);
        if (left === undefined || right === undefined) {
            return Number(left === undefined) - Number(right === undefined);
        }
        const order = typeof left === 'number' && typeof right === 'number'
            ? left - right
            : String(left).localeCompare(String(right));
        return this.ascending ? order : -order;
    }
}

type SortProperty = 'created' | 'title' | 'scope' | 'reporter';

const SCOPE_ORDER: readonly ScopeLevel[] = ['operation', 'workflow', 'system', 'cross-system'];

const DIRECTION_LABELS: Record<SortProperty, { ascending: string; descending: string }> = {
    created: { ascending: 'Oldest first', descending: 'Newest first' },
    title: { ascending: 'A to Z', descending: 'Z to A' },
    scope: { ascending: 'Narrowest first', descending: 'Widest first' },
    reporter: { ascending: 'A to Z', descending: 'Z to A' },
};

function normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function searchableText(ticket: ProblemTicket): string {
    return normalize([
        ticket.title,
        ticket.report,
        ticket.problem.condition,
        ticket.problem.affected,
        ticket.problem.impact,
    ].join('\n'));
}

// Returns undefined for a missing value so such tickets sort last in either direction.
function sortKey(ticket: ProblemTicket, property: SortProperty): string | number | undefined {
    switch (property) {
        case 'created': {
            const time = Date.parse(ticket.reportedAt);
            return Number.isNaN(time) ? undefined : time;
        }
        case 'title':
            return ticket.title.trim() ? ticket.title : undefined;
        case 'scope':
            return SCOPE_ORDER.indexOf(ticket.scope.level);
        case 'reporter':
            return ticket.reportedBy.trim() ? ticket.reportedBy : undefined;
    }
}
