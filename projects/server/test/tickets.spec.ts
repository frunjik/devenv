import { describe, expect, it } from '@jest/globals';
import type { ErrorRequestHandler } from 'express';
import { requestApp } from './support/request-app';
import type { NewProblemTicket } from '@shared';
import { createApp } from '../src/public-api';
import { InMemoryTicketStore } from '../src/lib/storage/in-memory-ticket-store';

const newTicket: NewProblemTicket = {
    title: 'Pick list is wrong',
    report: 'Pickers get the wrong aisle.',
    problem: { condition: 'Wrong aisle', affected: 'Pickers', impact: 'Delays' },
    scope: { level: 'workflow', label: 'Picking' },
    context: { people: [], places: [], things: [] },
    reportedBy: 'Ada',
    reportedAt: '2026-10-06T10:00:00.000Z',
};

function appWithStore() {
    let counter = 0;
    const ticketStore = new InMemoryTicketStore({ newId: () => `T-${++counter}` });
    return createApp('./', { ticketStore });
}

describe('ticket routes', () => {
    it('creates a ticket as open, version 1, and lists it', async () => {
        const app = appWithStore();

        const created = await requestApp(app).post('/tickets').send({ ticket: newTicket, dataKind: 'real' });
        const listed = await requestApp(app).get('/tickets');

        expect(created.status).toBe(201);
        expect(created.body.data).toMatchObject({ id: 'T-1', status: { state: 'open' }, version: 1, dataKind: 'real' });
        expect(listed.body.data).toEqual([created.body.data]);
    });

    it('defaults the data kind to sample', async () => {
        const created = await requestApp(appWithStore()).post('/tickets').send({ ticket: newTicket });

        expect(created.body.data.dataKind).toBe('sample');
    });

    it('rejects a create request without a ticket or with an unknown data kind', async () => {
        const app = appWithStore();

        const missing = await requestApp(app).post('/tickets').send({});
        const badKind = await requestApp(app).post('/tickets').send({ ticket: newTicket, dataKind: 'fake' });

        expect(missing.status).toBe(400);
        expect(badKind.status).toBe(400);
    });

    it('stores a valid estimate and rejects one that is incomplete or out of range', async () => {
        const app = appWithStore();
        const estimate = { impact: 4, urgency: 5, effort: 2 };

        const valid = await requestApp(app).post('/tickets').send({ ticket: { ...newTicket, estimate } });
        const incomplete = await requestApp(app).post('/tickets').send({ ticket: { ...newTicket, estimate: { impact: 4 } } });
        const outOfRange = await requestApp(app)
            .post('/tickets')
            .send({ ticket: { ...newTicket, estimate: { ...estimate, effort: 6 } } });
        const fractional = await requestApp(app)
            .post('/tickets')
            .send({ ticket: { ...newTicket, estimate: { ...estimate, effort: 2.5 } } });
        const notAnObject = await requestApp(app).post('/tickets').send({ ticket: { ...newTicket, estimate: 3 } });

        expect(valid.status).toBe(201);
        expect(valid.body.data.estimate).toEqual(estimate);
        expect([incomplete.status, outOfRange.status, fractional.status, notAnObject.status]).toEqual([400, 400, 400, 400]);
    });

    it('creates a ticket that depends on existing tickets, and rejects one that depends on an unknown id', async () => {
        const app = appWithStore();
        const original = await requestApp(app).post('/tickets').send({ ticket: newTicket });

        const valid = await requestApp(app)
            .post('/tickets')
            .send({ ticket: { ...newTicket, dependsOnTicketIds: [original.body.data.id] } });
        const unknown = await requestApp(app)
            .post('/tickets')
            .send({ ticket: { ...newTicket, dependsOnTicketIds: ['missing'] } });
        const notAnArray = await requestApp(app)
            .post('/tickets')
            .send({ ticket: { ...newTicket, dependsOnTicketIds: 'T-1' } });

        expect(valid.status).toBe(201);
        expect(valid.body.data.dependsOnTicketIds).toEqual([original.body.data.id]);
        expect(unknown.status).toBe(400);
        expect(unknown.body.error.message).toContain('missing');
        expect(notAnArray.status).toBe(400);
    });

    it('changes a ticket and records the server-known actor in the history', async () => {
        const app = appWithStore();
        await requestApp(app).post('/tickets').send({ ticket: newTicket });

        const changed = await requestApp(app)
            .post('/tickets/T-1/changes')
            .send({ command: { kind: 'assign', assigneeId: 'user-2' }, expectedVersion: 1 });
        const history = await requestApp(app).get('/tickets/T-1/history');

        expect(changed.status).toBe(200);
        expect(changed.body.data.ticket).toMatchObject({ version: 2, status: { state: 'assigned', assigneeId: 'user-2' } });
        expect(history.body.data).toHaveLength(1);
        expect(history.body.data[0].actor).toEqual({ id: 'anonymous' });
    });

    it('uses the authenticated principal as the actor', async () => {
        const ticketStore = new InMemoryTicketStore({ newId: () => 'T-1' });
        const app = createApp('./', {
            ticketStore,
            authenticationService: { authenticate: async () => ({ id: 'user-9', name: 'Grace' }) },
        });
        await requestApp(app).post('/tickets').send({ ticket: newTicket });

        await requestApp(app).post('/tickets/T-1/changes')
            .send({ command: { kind: 'assign', assigneeId: 'user-2' }, expectedVersion: 1 });
        const history = await requestApp(app).get('/tickets/T-1/history');

        expect(history.body.data[0].actor).toEqual({ id: 'user-9', name: 'Grace' });
    });

    it('answers 404, 409 and 422 for unknown, stale and refused changes', async () => {
        const app = appWithStore();
        await requestApp(app).post('/tickets').send({ ticket: newTicket });
        await requestApp(app).post('/tickets/T-1/changes')
            .send({ command: { kind: 'assign', assigneeId: 'user-2' }, expectedVersion: 1 });

        const unknown = await requestApp(app).post('/tickets/nope/changes')
            .send({ command: { kind: 'resolve' }, expectedVersion: 1 });
        const stale = await requestApp(app).post('/tickets/T-1/changes')
            .send({ command: { kind: 'resolve' }, expectedVersion: 1 });
        const refused = await requestApp(app).post('/tickets/T-1/changes')
            .send({ command: { kind: 'close' }, expectedVersion: 2 });

        expect(unknown.status).toBe(404);
        expect(stale.status).toBe(409);
        expect(stale.body.error.current.version).toBe(2);
        expect(refused.status).toBe(422);
        expect(refused.body.error.message).toContain('Cannot close');
    });

    it('rejects a malformed change request', async () => {
        const app = appWithStore();

        const noCommand = await requestApp(app).post('/tickets/T-1/changes').send({ expectedVersion: 1 });
        const noVersion = await requestApp(app).post('/tickets/T-1/changes').send({ command: { kind: 'resolve' } });

        expect(noCommand.status).toBe(400);
        expect(noVersion.status).toBe(400);
    });

    describe('editing content', () => {
        const edited = {
            title: 'Pick list sends pickers to the wrong aisle',
            report: newTicket.report,
            problem: newTicket.problem,
            scope: newTicket.scope,
            estimate: { impact: 4, urgency: 5, effort: 2 },
        };

        it('edits the content, bumps the version, and shows the edit in the history', async () => {
            const app = appWithStore();
            await requestApp(app).post('/tickets').send({ ticket: newTicket });

            const response = await requestApp(app).post('/tickets/T-1/edits').send({ content: edited, expectedVersion: 1 });
            const history = await requestApp(app).get('/tickets/T-1/history');

            expect(response.status).toBe(200);
            expect(response.body.data.ticket).toMatchObject({ ...edited, version: 2 });
            expect(history.body.data).toHaveLength(1);
            expect(history.body.data[0]).toMatchObject({
                kind: 'edit',
                actor: { id: 'anonymous' },
                before: { title: newTicket.title },
                after: { title: edited.title },
            });
        });

        it('answers 404, 409 and 422 for unknown, stale and refused edits', async () => {
            const app = appWithStore();
            await requestApp(app).post('/tickets').send({ ticket: newTicket });
            await requestApp(app).post('/tickets/T-1/edits').send({ content: edited, expectedVersion: 1 });

            const unknown = await requestApp(app).post('/tickets/nope/edits').send({ content: edited, expectedVersion: 1 });
            const stale = await requestApp(app).post('/tickets/T-1/edits').send({ content: edited, expectedVersion: 1 });
            const refused = await requestApp(app)
                .post('/tickets/T-1/edits')
                .send({ content: { ...edited, title: ' ' }, expectedVersion: 2 });

            expect(unknown.status).toBe(404);
            expect(stale.status).toBe(409);
            expect(stale.body.error.current.version).toBe(2);
            expect(refused.status).toBe(422);
            expect(refused.body.error.message).toContain('cannot be blank');
        });

        it('rejects malformed edits', async () => {
            const app = appWithStore();
            const send = (body: unknown) => requestApp(app).post('/tickets/T-1/edits').send(body as object);

            const responses = await Promise.all([
                send({ expectedVersion: 1 }),
                send({ content: edited }),
                send({ content: { ...edited, title: 5 }, expectedVersion: 1 }),
                send({ content: { ...edited, report: undefined }, expectedVersion: 1 }),
                send({ content: { ...edited, problem: { condition: 'x' } }, expectedVersion: 1 }),
                send({ content: { ...edited, scope: { level: 'galaxy', label: 'x' } }, expectedVersion: 1 }),
                send({ content: { ...edited, scope: { level: 'system' } }, expectedVersion: 1 }),
                send({ content: { ...edited, estimate: { impact: 9, urgency: 1, effort: 1 } }, expectedVersion: 1 }),
                requestApp(app).post('/tickets/T-1/edits'),
            ]);

            expect(responses.map(response => response.status)).toEqual([400, 400, 400, 400, 400, 400, 400, 400, 400]);
        });
    });
    it('uses its own in-memory store when none is supplied', async () => {
        const app = createApp('./');

        const listed = await requestApp(app).get('/tickets');

        expect(listed.status).toBe(200);
        expect(listed.body.data).toEqual([]);
    });

    it('falls back to an anonymous actor when no authentication is configured', async () => {
        const original = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';
        try {
            const app = appWithStore();
            await requestApp(app).post('/tickets').send({ ticket: newTicket });
            await requestApp(app).post('/tickets/T-1/changes')
                .send({ command: { kind: 'assign', assigneeId: 'user-2' }, expectedVersion: 1 });
            const history = await requestApp(app).get('/tickets/T-1/history');

            expect(history.body.data[0].actor).toEqual({ id: 'anonymous' });
        } finally {
            if (original === undefined) {
                delete process.env['NODE_ENV'];
            } else {
                process.env['NODE_ENV'] = original;
            }
        }
    });

    it('treats a request without a body as malformed', async () => {
        const app = appWithStore();

        const create = await requestApp(app).post('/tickets');
        const change = await requestApp(app).post('/tickets/T-1/changes');

        expect(create.status).toBe(400);
        expect(change.status).toBe(400);
    });

    it('passes store failures to the error handler', async () => {
        const failure = new Error('database down');
        const failing = {
            create: () => Promise.reject(failure),
            list: () => Promise.reject(failure),
            get: () => Promise.reject(failure),
            change: () => Promise.reject(failure),
            edit: () => Promise.reject(failure),
            history: () => Promise.reject(failure),
        };
        const app = createApp('./', { ticketStore: failing });
        app.use(((_error, _request, response, _next) => {
            response.status(500).json({ error: { message: 'failed' } });
        }) as ErrorRequestHandler);

        const responses = await Promise.all([
            requestApp(app).get('/tickets'),
            requestApp(app).post('/tickets').send({ ticket: newTicket }),
            requestApp(app).post('/tickets/T-1/changes').send({ command: { kind: 'resolve' }, expectedVersion: 1 }),
            requestApp(app).post('/tickets/T-1/edits').send({ content: newTicket, expectedVersion: 1 }),
            requestApp(app).get('/tickets/T-1/history'),
        ]);

        expect(responses.map(response => response.status)).toEqual([500, 500, 500, 500, 500]);
    });
});
