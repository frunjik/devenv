import type {
    DataKind,
    NewProblemTicket,
    ProblemTicketId,
    StoredTicket,
    TicketChangeEvent,
    TicketChangeOutcome,
    TicketCommand,
    TicketCommandResult,
    TicketStatus,
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
    history(id: ProblemTicketId): Promise<TicketChangeEvent[]>;
}

export type ApplyTicketCommand = (
    ticketId: ProblemTicketId,
    status: TicketStatus,
    command: TicketCommand,
    actor: User,
    at: string,
) => TicketCommandResult;
