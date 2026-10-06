import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { NewProblemTicket, User } from '@shared';
import { FileTicketStore } from '../src/lib/storage/file-ticket-store';
import { describeTicketStore } from './ticket-store.contract';

const mockFiles = new Map<string, string>();

jest.mock('node:fs/promises', () => {
    const actual = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises');
    return {
        ...actual,
        mkdir: jest.fn(),
        readFile: jest.fn(async (filename: string, encoding?: string) => {
            const contents = mockFiles.get(filename);
            if (contents === undefined) {
                throw Object.assign(new Error('File not found'), { code: 'ENOENT' });
            }
            return encoding ? contents : Buffer.from(contents);
        }),
        rename: jest.fn(),
        writeFile: jest.fn(),
    };
});

const fileReader = jest.mocked(readFile);
const fileWriter = jest.mocked(writeFile);
const fileRenamer = jest.mocked(rename);
const directoryMaker = jest.mocked(mkdir);

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

const directory = process.cwd();
let counter = 0;

beforeEach(() => {
    mockFiles.clear();
    fileReader.mockClear();
    fileWriter.mockReset().mockImplementation(async (filename, contents) => {
        if (typeof contents !== 'string') {
            throw new Error('The ticket persistence boundary expects text contents');
        }
        mockFiles.set(String(filename), contents);
    });
    fileRenamer.mockReset().mockImplementation(async (from, to) => {
        const contents = mockFiles.get(String(from));
        if (contents === undefined) {
            throw Object.assign(new Error('Source file not found'), { code: 'ENOENT' });
        }
        mockFiles.set(String(to), contents);
        mockFiles.delete(String(from));
    });
    directoryMaker.mockReset().mockResolvedValue(undefined);
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
        expect(directoryMaker).toHaveBeenCalledWith(join(directory, 'nested'), { recursive: true });
        expect(fileReader).toHaveBeenCalledWith(file, 'utf8');
        expect(fileRenamer.mock.calls.map(([, destination]) => destination)).toEqual([file, file]);
        expect([...mockFiles.keys()]).toEqual([file]);
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
        const writesBefore = fileWriter.mock.calls.length;

        await store.change(created.id, { kind: 'close' }, actor, 1);
        await store.change(created.id, { kind: 'resolve' }, actor, 99);
        await store.change('nope', { kind: 'resolve' }, actor, 1);

        expect(await readFile(file, 'utf8')).toBe(before);
        expect([...mockFiles.keys()]).toEqual([file]);
        expect(fileWriter).toHaveBeenCalledTimes(writesBefore);
    });

    it('refuses to start from a corrupt file and leaves it untouched', async () => {
        const file = join(directory, 'tickets.json');
        mockFiles.set(file, '{ not json');
        const store = new FileTicketStore(file);

        await expect(store.list()).rejects.toThrow();
        await expect(store.create(newTicket, 'sample')).rejects.toThrow();
        expect(await readFile(file, 'utf8')).toBe('{ not json');
        expect(fileWriter).not.toHaveBeenCalled();
    });

    it('reports a failed write, forgets the unsaved ticket, and keeps saving later changes', async () => {
        const file = join(directory, 'tickets.json');
        const store = new FileTicketStore(file);
        await store.list();
        const writeError = Object.assign(new Error('Destination is a directory'), { code: 'EISDIR' });
        fileRenamer.mockRejectedValueOnce(writeError);

        await expect(store.create(newTicket, 'sample')).rejects.toBe(writeError);
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

    it('keeps the saved snapshot when replacing it fails', async () => {
        const file = join(directory, 'tickets.json');
        const store = new FileTicketStore(file);
        const created = await store.create(newTicket, 'real');
        const saved = mockFiles.get(file);
        const replacementError = Object.assign(new Error('Replacement denied'), { code: 'EACCES' });
        fileRenamer.mockRejectedValueOnce(replacementError);

        await expect(store.change(created.id, { kind: 'assign', assigneeId: 'user-2' }, actor, 1))
            .rejects.toBe(replacementError);

        expect(mockFiles.get(file)).toBe(saved);
        expect(await store.get(created.id)).toEqual(created);
        expect(await store.history(created.id)).toEqual([]);
    });

    it('reports a file-write failure without exposing the unsaved ticket', async () => {
        const file = join(directory, 'tickets.json');
        const store = new FileTicketStore(file);
        const writeError = Object.assign(new Error('Disk full'), { code: 'ENOSPC' });
        fileWriter.mockRejectedValueOnce(writeError);

        await expect(store.create(newTicket, 'real')).rejects.toBe(writeError);

        expect(fileRenamer).not.toHaveBeenCalled();
        expect(mockFiles.size).toBe(0);
        expect(await store.list()).toEqual([]);
        await store.create(newTicket, 'real');
        expect(await new FileTicketStore(file).list()).toHaveLength(1);
    });
});