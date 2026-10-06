import { describe, expect, it } from '@jest/globals';
import { applyTicketCommand } from '../../shared/src/lib/ticket-lifecycle';
import type { NewProblemTicket, User } from '@shared';
import { InMemoryTicketStore } from '../src/lib/storage/in-memory-ticket-store';
import { describeTicketStore } from './ticket-store.contract';

const actor: User = { id: 'user-1', name: 'Ada' };

const newTicket: NewProblemTicket = {
    title: 'Pick list is wrong',
    report: 'Pickers get the wrong aisle.',
    problem: { condition: 'Wrong aisle', affected: 'Pickers', impact: 'Delays' },
    scope: { level: 'workflow', label: 'Picking' },
    context: { people: [], places: [], things: [] },
    reportedBy: 'Ada',
    reportedAt: '2026-10-06T10:00:00.000Z',
};

describeTicketStore('InMemoryTicketStore', () => {
    let counter = 0;
    return new InMemoryTicketStore({
        apply: applyTicketCommand,
        newId: () => `T-${++counter}`,
        now: () => '2026-10-06T12:00:00.000Z',
    });
});

describe('InMemoryTicketStore defaults', () => {
    it('creates its own ids and timestamps when none are injected', async () => {
        const store = new InMemoryTicketStore({ apply: applyTicketCommand });

        const first = await store.create(newTicket, 'real');
        const second = await store.create(newTicket, 'real');
        const changed = await store.change(first.id, { kind: 'assign', assigneeId: 'user-2' }, actor, 1);

        expect(first.id).not.toBe(second.id);
        expect(first.id.length).toBeGreaterThan(0);
        expect(changed.ok).toBe(true);
        expect(changed.ok && Number.isNaN(Date.parse(changed.event.at))).toBe(false);
    });
});
