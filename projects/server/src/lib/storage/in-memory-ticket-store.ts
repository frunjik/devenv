import { randomUUID } from 'node:crypto';
import type {
    DataKind,
    NewProblemTicket,
    ProblemTicketId,
    StoredTicket,
    TicketChangeOutcome,
    TicketCommand,
    TicketContent,
    TicketEditOutcome,
    TicketHistoryEvent,
    User,
} from '@shared';
import { applyTicketEdit } from '../domain/ticket-edit';
import { applyTicketCommand } from '../domain/ticket-lifecycle';
import type { TicketStore } from './ticket-store';

export interface InMemoryTicketStoreOptions {
    newId?: () => ProblemTicketId;
    now?: () => string;
    snapshot?: TicketStoreSnapshot;
}

export interface TicketStoreSnapshot {
    tickets: StoredTicket[];
    events: Record<ProblemTicketId, TicketHistoryEvent[]>;
}

export class InMemoryTicketStore implements TicketStore {
    private readonly tickets = new Map<ProblemTicketId, StoredTicket>();
    private readonly events = new Map<ProblemTicketId, TicketHistoryEvent[]>();
    private readonly newId: () => ProblemTicketId;
    private readonly now: () => string;

    constructor({ newId = randomUUID, now = () => new Date().toISOString(), snapshot }: InMemoryTicketStoreOptions = {}) {
        for (const ticket of snapshot?.tickets ?? []) {
            this.tickets.set(ticket.id, ticket);
        }
        for (const [id, events] of Object.entries(snapshot?.events ?? {})) {
            this.events.set(id, events);
        }
        this.newId = newId;
        this.now = now;
    }

    snapshot(): TicketStoreSnapshot {
        return structuredClone({
            tickets: [...this.tickets.values()],
            events: Object.fromEntries(this.events),
        });
    }

    async create(ticket: NewProblemTicket, dataKind: DataKind): Promise<StoredTicket> {
        const stored: StoredTicket = {
            ...structuredClone(ticket),
            id: this.newId(),
            status: { state: 'open' },
            version: 1,
            dataKind,
        };
        this.tickets.set(stored.id, stored);
        return structuredClone(stored);
    }

    async list(): Promise<StoredTicket[]> {
        return structuredClone([...this.tickets.values()]);
    }

    async get(id: ProblemTicketId): Promise<StoredTicket | undefined> {
        return structuredClone(this.tickets.get(id));
    }

    async change(
        id: ProblemTicketId,
        command: TicketCommand,
        actor: User,
        expectedVersion: number,
    ): Promise<TicketChangeOutcome> {
        const current = this.tickets.get(id);
        if (!current) {
            return { ok: false, kind: 'not-found' };
        }
        if (current.version !== expectedVersion) {
            return { ok: false, kind: 'stale', current: structuredClone(current) };
        }

        const result = applyTicketCommand(id, current.status, command, actor, this.now());
        if (!result.ok) {
            return { ok: false, kind: 'refused', reason: result.reason };
        }

        const updated: StoredTicket = { ...current, status: result.status, version: current.version + 1 };
        this.tickets.set(id, updated);
        this.events.set(id, [...(this.events.get(id) ?? []), result.event]);
        return { ok: true, ticket: structuredClone(updated), event: structuredClone(result.event) };
    }

    async edit(
        id: ProblemTicketId,
        content: TicketContent,
        actor: User,
        expectedVersion: number,
    ): Promise<TicketEditOutcome> {
        const current = this.tickets.get(id);
        if (!current) {
            return { ok: false, kind: 'not-found' };
        }
        if (current.version !== expectedVersion) {
            return { ok: false, kind: 'stale', current: structuredClone(current) };
        }

        const { title, report, problem, scope, estimate } = current;
        const result = applyTicketEdit(
            structuredClone({ title, report, problem, scope, estimate }),
            structuredClone(content),
            actor,
            this.now(),
        );
        if (!result.ok) {
            return { ok: false, kind: 'refused', reason: result.reason };
        }

        const { estimate: _replaced, ...rest } = current;
        const updated: StoredTicket = { ...rest, ...result.event.after, version: current.version + 1 };
        this.tickets.set(id, updated);
        this.events.set(id, [...(this.events.get(id) ?? []), result.event]);
        return { ok: true, ticket: structuredClone(updated), event: structuredClone(result.event) };
    }

    async history(id: ProblemTicketId): Promise<TicketHistoryEvent[]> {
        return structuredClone(this.events.get(id) ?? []);
    }
}
