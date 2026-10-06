import { ProblemTicket, StoredTicket, TicketStatus } from '@shared';

export type TicketStateTallyKey = TicketStatus['state'] | 'unsaved';

export type TicketStateTally = Partial<Record<TicketStateTallyKey, number>>;

export function tallyByState(tickets: readonly (ProblemTicket | StoredTicket)[]): TicketStateTally {
    const tally: TicketStateTally = {};
    for (const ticket of tickets) {
        const key: TicketStateTallyKey = 'status' in ticket ? ticket.status.state : 'unsaved';
        tally[key] = (tally[key] ?? 0) + 1;
    }
    return tally;
}
