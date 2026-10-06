import { describe, expect, it } from '@jest/globals';
import type { NewProblemTicket, User } from '@shared';
import type { TicketStore } from '../src/lib/storage/ticket-store';

const ada: User = { id: 'user-1', name: 'Ada' };
const grace: User = { id: 'user-2' };

const newTicket: NewProblemTicket = {
    title: 'Pick list is wrong',
    report: 'Pickers get the wrong aisle.',
    problem: { condition: 'Wrong aisle', affected: 'Pickers', impact: 'Delays' },
    scope: { level: 'workflow', label: 'Picking' },
    context: { people: ['Picker'], places: ['Aisle 4'], things: [] },
    reportedBy: 'Ada',
    reportedAt: '2026-10-06T10:00:00.000Z',
};

// Any TicketStore implementation (in-memory now, a database later) must pass these.
export function describeTicketStore(name: string, createStore: () => TicketStore): void {
    describe(`${name} (TicketStore contract)`, () => {
        it('creates an open, version 1 ticket with a server-made id and the given data kind', async () => {
            const store = createStore();

            const ticket = await store.create(newTicket, 'sample');

            expect(ticket).toMatchObject({ ...newTicket, status: { state: 'open' }, version: 1, dataKind: 'sample' });
            expect(ticket.id).toBeTruthy();
            expect(await store.get(ticket.id)).toEqual(ticket);
        });

        it('lists every stored ticket and returns undefined for an unknown id', async () => {
            const store = createStore();
            const first = await store.create(newTicket, 'sample');
            const second = await store.create(newTicket, 'real');

            expect((await store.list()).map(ticket => ticket.id)).toEqual([first.id, second.id]);
            expect(await store.get('missing')).toBeUndefined();
        });

        it('applies a command, raises the version, and records the change event', async () => {
            const store = createStore();
            const ticket = await store.create(newTicket, 'real');

            const outcome = await store.change(ticket.id, { kind: 'assign', assigneeId: grace.id }, ada, 1);

            expect(outcome.ok).toBe(true);
            if (!outcome.ok) {
                return;
            }
            expect(outcome.ticket).toMatchObject({ status: { state: 'assigned', assigneeId: grace.id }, version: 2 });
            expect(outcome.event).toMatchObject({ kind: 'assign', actor: ada, before: { state: 'open' } });
            expect(await store.get(ticket.id)).toEqual(outcome.ticket);
            expect(await store.history(ticket.id)).toEqual([outcome.event]);
        });

        it('keeps the history of several changes in order', async () => {
            const store = createStore();
            const ticket = await store.create(newTicket, 'real');

            await store.change(ticket.id, { kind: 'assign', assigneeId: grace.id }, ada, 1);
            await store.change(ticket.id, { kind: 'unassign' }, grace, 2);

            expect((await store.history(ticket.id)).map(event => event.kind)).toEqual(['assign', 'unassign']);
        });

        it('rejects a stale change and returns the current ticket', async () => {
            const store = createStore();
            const ticket = await store.create(newTicket, 'real');
            await store.change(ticket.id, { kind: 'assign', assigneeId: grace.id }, ada, 1);

            const outcome = await store.change(ticket.id, { kind: 'unassign' }, grace, 1);

            expect(outcome).toMatchObject({ ok: false, kind: 'stale', current: { version: 2 } });
            expect((await store.history(ticket.id)).length).toBe(1);
        });

        it('refuses a command the lifecycle does not allow and changes nothing', async () => {
            const store = createStore();
            const ticket = await store.create(newTicket, 'real');

            const outcome = await store.change(ticket.id, { kind: 'resolve' }, ada, 1);

            expect(outcome).toMatchObject({ ok: false, kind: 'refused' });
            expect((await store.get(ticket.id))?.version).toBe(1);
            expect(await store.history(ticket.id)).toEqual([]);
        });

        it('reports a change to an unknown ticket as not found, and an empty history', async () => {
            const store = createStore();

            expect(await store.change('missing', { kind: 'resolve' }, ada, 1)).toEqual({ ok: false, kind: 'not-found' });
            expect(await store.history('missing')).toEqual([]);
        });

        it('does not let callers change stored data through returned objects', async () => {
            const store = createStore();
            const ticket = await store.create(newTicket, 'real');

            ticket.title = 'Tampered';
            ticket.status = { state: 'closed' };

            const stored = await store.get(ticket.id);
            expect(stored?.title).toBe(newTicket.title);
            expect(stored?.status).toEqual({ state: 'open' });
        });
    });
}
