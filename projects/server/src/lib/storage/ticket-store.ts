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

// The storage port: the server and its tests depend on this, never on a database engine.
export interface TicketStore {
    create(ticket: NewProblemTicket, dataKind: DataKind): Promise<StoredTicket>;
    list(): Promise<StoredTicket[]>;
    get(id: ProblemTicketId): Promise<StoredTicket | undefined>;
    change(
        id: ProblemTicketId,
        command: TicketCommand,
        actor: User,
        expectedVersion: number,
    ): Promise<TicketChangeOutcome>;
    edit(id: ProblemTicketId, content: TicketContent, actor: User, expectedVersion: number): Promise<TicketEditOutcome>;
    history(id: ProblemTicketId): Promise<TicketHistoryEvent[]>;
}
