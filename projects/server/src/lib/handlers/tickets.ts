import { Router, type Request, type Response } from 'express';
import type { DataKind, NewProblemTicket, TicketCommand, TicketContent, TicketChangeOutcome, TicketEditOutcome, User } from '@shared';
import type { TicketStore } from '../storage/ticket-store';

const dataKinds: DataKind[] = ['sample', 'real'];
const scopeLevels = ['operation', 'workflow', 'system', 'cross-system'];

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isRating(value: unknown): boolean {
    return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5;
}

function isValidEstimate(value: unknown): boolean {
    return isObject(value) && ['impact', 'urgency', 'effort'].every(key => isRating(value[key]));
}

function isText(value: unknown): boolean {
    return typeof value === 'string';
}

function isValidDependsOn(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isText);
}

function isValidContent(value: unknown): boolean {
    if (!isObject(value) || !isText(value['title']) || !isText(value['report'])) {
        return false;
    }
    const { problem, scope, estimate } = value;
    return isObject(problem)
        && ['condition', 'affected', 'impact'].every(key => isText(problem[key]))
        && isObject(scope)
        && scopeLevels.includes(scope['level'] as string)
        && isText(scope['label'])
        && (estimate === undefined || isValidEstimate(estimate));
}

function respond(response: Response, outcome: TicketChangeOutcome | TicketEditOutcome): void {
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

// A ticket must only depend on tickets the store already knows about.
async function missingDependencies(store: TicketStore, ids: string[]): Promise<string[]> {
    const found = await Promise.all(ids.map(id => store.get(id)));
    return ids.filter((_id, index) => found[index] === undefined);
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
            if (ticket['estimate'] !== undefined && !isValidEstimate(ticket['estimate'])) {
                return badRequest(response, 'An estimate needs impact, urgency, and effort, each from 1 to 5.');
            }
            if (ticket['dependsOnTicketIds'] !== undefined) {
                if (!isValidDependsOn(ticket['dependsOnTicketIds'])) {
                    return badRequest(response, 'dependsOnTicketIds must be a list of ticket ids.');
                }
                const missing = await missingDependencies(store, ticket['dependsOnTicketIds']);
                if (missing.length > 0) {
                    return badRequest(response, `A ticket cannot depend on a ticket that does not exist: ${missing.join(', ')}.`);
                }
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
            respond(response, outcome);
        } catch (error) {
            next(error);
        }
    });

    router.post('/tickets/:id/edits', async (request: Request, response, next) => {
        try {
            const { content, expectedVersion } = (request.body ?? {}) as Record<string, unknown>;
            if (!isValidContent(content)) {
                return badRequest(
                    response,
                    'Content needs a title, report, problem frame, scope, and optionally a valid estimate.',
                );
            }
            if (typeof expectedVersion !== 'number') {
                return badRequest(response, 'The expected version is required.');
            }

            respond(
                response,
                await store.edit(String(request.params['id']), content as unknown as TicketContent, actorOf(response), expectedVersion),
            );
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
