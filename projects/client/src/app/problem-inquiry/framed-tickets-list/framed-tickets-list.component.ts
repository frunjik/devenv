import { Component, EventEmitter, Input, Output } from '@angular/core';
import { calculateMetric, METRIC_METHODS, MetricMethod } from '../ticket-metrics';
import { EstimateRating, ImportedNote, ProblemTicket, ScopeLevel, StoredTicket, TicketCommand, TicketContent, TicketHistoryEvent, TicketStatus } from '@shared';

@Component({
    selector: 'app-framed-tickets-list',
    standalone: true,
    templateUrl: './framed-tickets-list.component.html',
    styleUrl: './framed-tickets-list.component.scss',
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
