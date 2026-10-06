import { describe, expect, it } from '@jest/globals';
import type { TicketStatus, TicketChangeEvent, User } from '@shared';
import { applyTicketCommand } from '../src/lib/domain/ticket-lifecycle';

const actor: User = { id: 'user-1', name: 'Ada' };
const anonymous: User = { id: 'user-2' };
const at = '2026-10-06T10:00:00.000Z';
const open: TicketStatus = { state: 'open' };
const assigned: TicketStatus = { state: 'assigned', assigneeId: 'user-3' };

function succeeded(result: ReturnType<typeof applyTicketCommand>): { status: TicketStatus; event: TicketChangeEvent } {
    if (!result.ok) {
        throw new Error(`Expected success but got: ${result.reason}`);
    }
    return result;
}

describe('ticket lifecycle', () => {
    it('assigns an open ticket and records the change event', () => {
        const { status, event } = succeeded(applyTicketCommand('t-1', open,
            { kind: 'assign', assigneeId: 'user-3' }, actor, at));

        expect(status).toEqual({ state: 'assigned', assigneeId: 'user-3' });
        expect(event).toEqual({ kind: 'assign', actor, at, before: open, after: status });
    });

    it('reassigns an assigned ticket', () => {
        const { status } = succeeded(applyTicketCommand('t-1', assigned,
            { kind: 'assign', assigneeId: 'user-4' }, actor, at));

        expect(status).toEqual({ state: 'assigned', assigneeId: 'user-4' });
    });

    it('rejects assignment without an assignee', () => {
        const result = applyTicketCommand('t-1', open, { kind: 'assign', assigneeId: '  ' }, actor, at);

        expect(result).toEqual({ ok: false, reason: 'An assignee is required.' });
    });

    it('returns an unassigned ticket to open', () => {
        const { status } = succeeded(applyTicketCommand('t-1', assigned, { kind: 'unassign' }, actor, at));

        expect(status).toEqual(open);
    });

    it('moves forward from assigned to resolved to closed, keeping the assignee', () => {
        const resolved = succeeded(applyTicketCommand('t-1', assigned, { kind: 'resolve' }, actor, at)).status;
        const closed = succeeded(applyTicketCommand('t-1', resolved, { kind: 'close' }, anonymous, at));

        expect(resolved).toEqual({ state: 'resolved', assigneeId: 'user-3' });
        expect(closed.status).toEqual({ state: 'closed', assigneeId: 'user-3' });
        expect(closed.event.actor).toEqual(anonymous);
    });

    it('reopens a resolved or closed ticket as open', () => {
        const resolved: TicketStatus = { state: 'resolved', assigneeId: 'user-3' };
        const closed: TicketStatus = { state: 'closed' };

        expect(succeeded(applyTicketCommand('t-1', resolved, { kind: 'reopen' }, actor, at)).status).toEqual(open);
        expect(succeeded(applyTicketCommand('t-1', closed, { kind: 'reopen' }, actor, at)).status).toEqual(open);
    });

    it('marks a ticket in any state as a duplicate of another ticket', () => {
        const states: TicketStatus[] = [open, assigned, { state: 'resolved' }, { state: 'closed' }];

        for (const state of states) {
            const { status } = succeeded(applyTicketCommand('t-1', state,
                { kind: 'mark-duplicate', duplicateOfId: 't-2' }, actor, at));
            expect(status).toEqual({ state: 'duplicate', duplicateOfId: 't-2' });
        }
    });

    it('requires a different ticket to be named as the original', () => {
        expect(applyTicketCommand('t-1', open, { kind: 'mark-duplicate', duplicateOfId: ' ' }, actor, at))
            .toEqual({ ok: false, reason: 'A duplicate must reference the original ticket.' });
        expect(applyTicketCommand('t-1', open, { kind: 'mark-duplicate', duplicateOfId: 't-1' }, actor, at))
            .toEqual({ ok: false, reason: 'A ticket cannot be a duplicate of itself.' });
    });

    it('reopens a duplicate as open', () => {
        const duplicate: TicketStatus = { state: 'duplicate', duplicateOfId: 't-2' };

        expect(succeeded(applyTicketCommand('t-1', duplicate, { kind: 'reopen' }, actor, at)).status).toEqual(open);
    });

    it('rejects transitions the forward flow does not allow', () => {
        const closed: TicketStatus = { state: 'closed' };
        const duplicate: TicketStatus = { state: 'duplicate', duplicateOfId: 't-2' };

        expect(applyTicketCommand('t-1', open, { kind: 'resolve' }, actor, at))
            .toEqual({ ok: false, reason: 'Cannot resolve a ticket that is open.' });
        expect(applyTicketCommand('t-1', open, { kind: 'close' }, actor, at))
            .toEqual({ ok: false, reason: 'Cannot close a ticket that is open.' });
        expect(applyTicketCommand('t-1', open, { kind: 'unassign' }, actor, at))
            .toEqual({ ok: false, reason: 'Cannot unassign a ticket that is open.' });
        expect(applyTicketCommand('t-1', open, { kind: 'reopen' }, actor, at))
            .toEqual({ ok: false, reason: 'Cannot reopen a ticket that is open.' });
        expect(applyTicketCommand('t-1', closed, { kind: 'assign', assigneeId: 'user-3' }, actor, at))
            .toEqual({ ok: false, reason: 'Cannot assign a ticket that is closed.' });
        expect(applyTicketCommand('t-1', duplicate, { kind: 'resolve' }, actor, at))
            .toEqual({ ok: false, reason: 'Cannot resolve a ticket that is duplicate.' });
    });
});
