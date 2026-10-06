import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type {
    DataKind,
    NewProblemTicket,
    ProblemTicketId,
    StoredTicket,
    TicketChangeOutcome,
    TicketCommand,
    TicketContent,
    TicketEditOutcome,
    TicketHistoryEvent,
    User,
} from '@shared';
import { InMemoryTicketStore, type TicketStoreSnapshot } from './in-memory-ticket-store';
import type { TicketStore } from './ticket-store';

export interface FileTicketStoreOptions {
    newId?: () => ProblemTicketId;
    now?: () => string;
}

// Keeps all tickets in one JSON file. Writes are queued and atomic within this process only,
// so it is not safe for several server processes sharing the same file.
export class FileTicketStore implements TicketStore {
    private store?: Promise<InMemoryTicketStore>;
    private writes: Promise<void> = Promise.resolve();

    constructor(
        private readonly file: string,
        private readonly options: FileTicketStoreOptions = {},
    ) {}

    async create(ticket: NewProblemTicket, dataKind: DataKind): Promise<StoredTicket> {
        const store = await this.open();
        const created = await store.create(ticket, dataKind);
        await this.save(store);
        return created;
    }

    async list(): Promise<StoredTicket[]> {
        return (await this.open()).list();
    }

    async get(id: ProblemTicketId): Promise<StoredTicket | undefined> {
        return (await this.open()).get(id);
    }

    async change(
        id: ProblemTicketId,
        command: TicketCommand,
        actor: User,
        expectedVersion: number,
    ): Promise<TicketChangeOutcome> {
        const store = await this.open();
        const outcome = await store.change(id, command, actor, expectedVersion);
        if (outcome.ok) {
            await this.save(store);
        }
        return outcome;
    }

    async edit(
        id: ProblemTicketId,
        content: TicketContent,
        actor: User,
        expectedVersion: number,
    ): Promise<TicketEditOutcome> {
        const store = await this.open();
        const outcome = await store.edit(id, content, actor, expectedVersion);
        if (outcome.ok) {
            await this.save(store);
        }
        return outcome;
    }

    async history(id: ProblemTicketId): Promise<TicketHistoryEvent[]> {
        return (await this.open()).history(id);
    }

    private open(): Promise<InMemoryTicketStore> {
        this.store ??= this.load();
        return this.store;
    }

    private async load(): Promise<InMemoryTicketStore> {
        let snapshot: TicketStoreSnapshot | undefined;
        try {
            snapshot = JSON.parse(await readFile(this.file, 'utf8')) as TicketStoreSnapshot;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
        return new InMemoryTicketStore({ ...this.options, snapshot });
    }

    private save(store: InMemoryTicketStore): Promise<void> {
        const contents = JSON.stringify(store.snapshot(), null, 2);
        const write = this.writes.then(async () => {
            await mkdir(dirname(this.file), { recursive: true });
            const temporary = `${this.file}.${randomUUID()}.tmp`;
            await writeFile(temporary, contents);
            await rename(temporary, this.file);
        });
        this.writes = write.catch(() => undefined);
        // A failed save must not leave unsaved tickets visible, so the next access reloads from disk.
        return write.catch(error => {
            this.store = undefined;
            throw error;
        });
    }
}