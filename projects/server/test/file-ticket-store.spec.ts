import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { NewProblemTicket, User } from '@shared';
import { FileTicketStore } from '../src/lib/storage/file-ticket-store';
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

let directory: string;
let counter = 0;

beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'devenv-ticket-store-'));
});

afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
});

describeTicketStore('FileTicketStore', () => {
    let next = 0;
    return new FileTicketStore(join(directory, `contract-${++counter}`, 'tickets.json'), {
        newId: () => `T-${++next}`,
        now: () => '2026-10-06T12:00:00.000Z',
    });
});

describe('FileTicketStore persistence', () => {
    it('starts empty when the file does not exist yet', async () => {
        const store = new FileTicketStore(join(directory, 'missing.json'));

        expect(await store.list()).toEqual([]);
        expect(await store.history('nope')).toEqual([]);
    });

    it('keeps tickets, versions, and history across a restart', async () => {
        const file = join(directory, 'nested', 'tickets.json');
        const first = new FileTicketStore(file);
        const created = await first.create(newTicket, 'real');
        await first.change(created.id, { kind: 'assign', assigneeId: 'user-2' }, actor, 1);

        const second = new FileTicketStore(file);
        const reloaded = await second.get(created.id);
        const history = await second.history(created.id);

        expect(reloaded).toMatchObject({ version: 2, dataKind: 'real', status: { state: 'assigned', assigneeId: 'user-2' } });
        expect(history).toHaveLength(1);
        expect(history[0].actor).toEqual(actor);
    });

    it('does not reuse or lose tickets when several are created at once', async () => {
        const file = join(directory, 'tickets.json');
        const store = new FileTicketStore(file);

        const created = await Promise.all(Array.from({ length: 10 }, () => store.create(newTicket, 'sample')));
        const reloaded = await new FileTicketStore(file).list();

        expect(new Set(created.map(ticket => ticket.id)).size).toBe(10);
        expect(reloaded).toHaveLength(10);
    });

    it('does not rewrite the file for a refused or stale change, and leaves no temporary files', async () => {
        const file = join(directory, 'tickets.json');
        const store = new FileTicketStore(file);
        const created = await store.create(newTicket, 'sample');
        const before = await readFile(file, 'utf8');

        await store.change(created.id, { kind: 'close' }, actor, 1);
        await store.change(created.id, { kind: 'resolve' }, actor, 99);
        await store.change('nope', { kind: 'resolve' }, actor, 1);

        expect(await readFile(file, 'utf8')).toBe(before);
        expect(await readdir(directory)).toEqual(['tickets.json']);
    });

    it('refuses to start from a corrupt file and leaves it untouched', async () => {
        const file = join(directory, 'tickets.json');
        await writeFile(file, '{ not json');
        const store = new FileTicketStore(file);

        await expect(store.list()).rejects.toThrow();
        await expect(store.create(newTicket, 'sample')).rejects.toThrow();
        expect(await readFile(file, 'utf8')).toBe('{ not json');
    });

    it('reports a failed write, forgets the unsaved ticket, and keeps saving later changes', async () => {
        const file = join(directory, 'tickets.json');
        const store = new FileTicketStore(file);
        await store.list();
        await mkdir(file);

        await expect(store.create(newTicket, 'sample')).rejects.toThrow();
        await rm(file, { recursive: true });
        expect(await store.list()).toHaveLength(0);
        await store.create(newTicket, 'sample');

        expect(await new FileTicketStore(file).list()).toHaveLength(1);
    });

    it('uses its own ids and timestamps when none are injected', async () => {
        const store = new FileTicketStore(join(directory, 'tickets.json'));

        const created = await store.create(newTicket, 'sample');
        const changed = await store.change(created.id, { kind: 'assign', assigneeId: 'u' }, actor, 1);

        expect(created.id.length).toBeGreaterThan(0);
        expect(changed.ok && Number.isNaN(Date.parse(changed.event.at))).toBe(false);
    });
});