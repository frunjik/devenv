import { Router, type Request, type Response } from 'express';
import type { DataKind, NewProblemTicket, TicketCommand, User } from '@shared';
import type { TicketStore } from '../storage/ticket-store';

const dataKinds: DataKind[] = ['sample', 'real'];

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function actorOf(response: Response): User {
    const principal = response.locals['principal'] as { id?: string; name?: unknown } | undefined;
    const actor: User = { id: principal?.id ?? 'anonymous' };
    if (typeof principal?.name === 'string') {
        actor.name = principal.name;
    }
    return actor;
}

function badRequest(response: Response, message: string): void {
    response.status(400).json({ error: { message } });
}

export function createTicketsRouter(store: TicketStore): Router {
    const router = Router();

    router.get('/tickets', async (_request, response, next) => {
        try {
            response.json({ data: await store.list() });
        } catch (error) {
            next(error);
        }
    });

    router.post('/tickets', async (request: Request, response, next) => {
        try {
            const { ticket, dataKind = 'sample' } = (request.body ?? {}) as Record<string, unknown>;
            if (!isObject(ticket)) {
                return badRequest(response, 'A ticket is required.');
            }
            if (!dataKinds.includes(dataKind as DataKind)) {
                return badRequest(response, 'The data kind must be sample or real.');
            }
            const created = await store.create(ticket as unknown as NewProblemTicket, dataKind as DataKind);
            response.status(201).json({ data: created });
        } catch (error) {
            next(error);
        }
    });

    router.post('/tickets/:id/changes', async (request: Request, response, next) => {
        try {
            const { command, expectedVersion } = (request.body ?? {}) as Record<string, unknown>;
            if (!isObject(command) || typeof command['kind'] !== 'string') {
                return badRequest(response, 'A command is required.');
            }
            if (typeof expectedVersion !== 'number') {
                return badRequest(response, 'The expected version is required.');
            }

            const outcome = await store.change(
                String(request.params['id']),
                command as unknown as TicketCommand,
                actorOf(response),
                expectedVersion,
            );
            if (outcome.ok) {
                return void response.json({ data: { ticket: outcome.ticket, event: outcome.event } });
            }
            if (outcome.kind === 'not-found') {
                return void response.status(404).json({ error: { message: 'Ticket not found.' } });
            }
            if (outcome.kind === 'stale') {
                return void response.status(409).json({
                    error: { message: 'The ticket changed since you loaded it.', current: outcome.current },
                });
            }
            response.status(422).json({ error: { message: outcome.reason } });
        } catch (error) {
            next(error);
        }
    });

    router.get('/tickets/:id/history', async (request, response, next) => {
        try {
            response.json({ data: await store.history(String(request.params['id'])) });
        } catch (error) {
            next(error);
        }
    });

    return router;
}
