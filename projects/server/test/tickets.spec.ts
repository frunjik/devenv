import { describe, expect, it } from '@jest/globals';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
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

        const created = await request(app).post('/tickets').send({ ticket: newTicket, dataKind: 'real' });
        const listed = await request(app).get('/tickets');

        expect(created.status).toBe(201);
        expect(created.body.data).toMatchObject({ id: 'T-1', status: { state: 'open' }, version: 1, dataKind: 'real' });
        expect(listed.body.data).toEqual([created.body.data]);
    });

    it('defaults the data kind to sample', async () => {
        const created = await request(appWithStore()).post('/tickets').send({ ticket: newTicket });

        expect(created.body.data.dataKind).toBe('sample');
    });

    it('rejects a create request without a ticket or with an unknown data kind', async () => {
        const app = appWithStore();

        const missing = await request(app).post('/tickets').send({});
        const badKind = await request(app).post('/tickets').send({ ticket: newTicket, dataKind: 'fake' });

        expect(missing.status).toBe(400);
        expect(badKind.status).toBe(400);
    });

    it('changes a ticket and records the server-known actor in the history', async () => {
        const app = appWithStore();
        await request(app).post('/tickets').send({ ticket: newTicket });

        const changed = await request(app)
            .post('/tickets/T-1/changes')
            .send({ command: { kind: 'assign', assigneeId: 'user-2' }, expectedVersion: 1 });
        const history = await request(app).get('/tickets/T-1/history');

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
        await request(app).post('/tickets').send({ ticket: newTicket });

        await request(app).post('/tickets/T-1/changes')
            .send({ command: { kind: 'assign', assigneeId: 'user-2' }, expectedVersion: 1 });
        const history = await request(app).get('/tickets/T-1/history');

        expect(history.body.data[0].actor).toEqual({ id: 'user-9', name: 'Grace' });
    });

    it('answers 404, 409 and 422 for unknown, stale and refused changes', async () => {
        const app = appWithStore();
        await request(app).post('/tickets').send({ ticket: newTicket });
        await request(app).post('/tickets/T-1/changes')
            .send({ command: { kind: 'assign', assigneeId: 'user-2' }, expectedVersion: 1 });

        const unknown = await request(app).post('/tickets/nope/changes')
            .send({ command: { kind: 'resolve' }, expectedVersion: 1 });
        const stale = await request(app).post('/tickets/T-1/changes')
            .send({ command: { kind: 'resolve' }, expectedVersion: 1 });
        const refused = await request(app).post('/tickets/T-1/changes')
            .send({ command: { kind: 'close' }, expectedVersion: 2 });

        expect(unknown.status).toBe(404);
        expect(stale.status).toBe(409);
        expect(stale.body.error.current.version).toBe(2);
        expect(refused.status).toBe(422);
        expect(refused.body.error.message).toContain('Cannot close');
    });

    it('rejects a malformed change request', async () => {
        const app = appWithStore();

        const noCommand = await request(app).post('/tickets/T-1/changes').send({ expectedVersion: 1 });
        const noVersion = await request(app).post('/tickets/T-1/changes').send({ command: { kind: 'resolve' } });

        expect(noCommand.status).toBe(400);
        expect(noVersion.status).toBe(400);
    });

    it('uses its own in-memory store when none is supplied', async () => {
        const app = createApp('./');

        const listed = await request(app).get('/tickets');

        expect(listed.status).toBe(200);
        expect(listed.body.data).toEqual([]);
    });

    it('falls back to an anonymous actor when no authentication is configured', async () => {
        const original = process.env['NODE_ENV'];
        process.env['NODE_ENV'] = 'production';
        try {
            const app = appWithStore();
            await request(app).post('/tickets').send({ ticket: newTicket });
            await request(app).post('/tickets/T-1/changes')
                .send({ command: { kind: 'assign', assigneeId: 'user-2' }, expectedVersion: 1 });
            const history = await request(app).get('/tickets/T-1/history');

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

        const create = await request(app).post('/tickets');
        const change = await request(app).post('/tickets/T-1/changes');

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
            history: () => Promise.reject(failure),
        };
        const app = createApp('./', { ticketStore: failing });
        app.use(((_error, _request, response, _next) => {
            response.status(500).json({ error: { message: 'failed' } });
        }) as ErrorRequestHandler);

        const responses = await Promise.all([
            request(app).get('/tickets'),
            request(app).post('/tickets').send({ ticket: newTicket }),
            request(app).post('/tickets/T-1/changes').send({ command: { kind: 'resolve' }, expectedVersion: 1 }),
            request(app).get('/tickets/T-1/history'),
        ]);

        expect(responses.map(response => response.status)).toEqual([500, 500, 500, 500]);
    });
});
