import type {
    ProblemTicketId,
    TicketCommand,
    TicketCommandResult,
    TicketStatus,
    User,
} from '@shared';

function nextStatus(
    ticketId: ProblemTicketId,
    status: TicketStatus,
    command: TicketCommand,
): TicketStatus | string {
    const refuse = `Cannot ${command.kind} a ticket that is ${status.state}.`;

    switch (command.kind) {
        case 'assign':
            if (!command.assigneeId.trim()) {
                return 'An assignee is required.';
            }
            return status.state === 'open' || status.state === 'assigned'
                ? { state: 'assigned', assigneeId: command.assigneeId }
                : refuse;
        case 'unassign':
            return status.state === 'assigned' ? { state: 'open' } : refuse;
        case 'resolve':
            return status.state === 'assigned'
                ? { state: 'resolved', assigneeId: status.assigneeId }
                : refuse;
        case 'close':
            return status.state === 'resolved'
                ? { state: 'closed', assigneeId: status.assigneeId }
                : refuse;
        case 'reopen':
            return status.state === 'resolved' || status.state === 'closed' || status.state === 'duplicate'
                ? { state: 'open' }
                : refuse;
        case 'mark-duplicate':
            if (!command.duplicateOfId.trim()) {
                return 'A duplicate must reference the original ticket.';
            }
            return command.duplicateOfId === ticketId
                ? 'A ticket cannot be a duplicate of itself.'
                : { state: 'duplicate', duplicateOfId: command.duplicateOfId };
    }
}

export function applyTicketCommand(
    ticketId: ProblemTicketId,
    status: TicketStatus,
    command: TicketCommand,
    actor: User,
    at: string,
): TicketCommandResult {
    const next = nextStatus(ticketId, status, command);

    if (typeof next === 'string') {
        return { ok: false, reason: next };
    }

    return { ok: true, status: next, event: { kind: command.kind, actor, at, before: status, after: next } };
}
