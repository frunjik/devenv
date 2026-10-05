import { randomUUID } from 'node:crypto';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import type { FeaturePriority, FeatureStatus } from '@shared';

export type { FeaturePriority, FeatureStatus } from '@shared';

const featurePriorities: readonly FeaturePriority[] = ['High', 'Medium', 'Low'];
const featureStatuses: readonly FeatureStatus[] = ['Questions', 'Backlog', 'In progress', 'Done', 'Aborted', 'Denied'];
const canonicalPriorities: Record<string, FeaturePriority> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};
const canonicalStatuses: Record<string, FeatureStatus> = {
    questions: 'Questions',
    backlog: 'Backlog',
    'in progress': 'In progress',
    done: 'Done',
    aborted: 'Aborted',
    denied: 'Denied',
};

function formatTimestamp(date: Date): string {
    const offsetMinutes = -date.getTimezoneOffset();
    const offsetSign = ['+', '-'][Number(offsetMinutes < 0)];
    const absoluteOffset = Math.abs(offsetMinutes);
    const timezoneOffset = `${offsetSign}${String(Math.floor(absoluteOffset / 60)).padStart(2, '0')}`
        + `:${String(absoluteOffset % 60).padStart(2, '0')}`;
    const twoDigits = (value: number) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`
        + ` ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())} ${timezoneOffset}`;
}

const featureIdPattern = /\[[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\]/i;

function addFeatureId(entry: string): string {
    if (featureIdPattern.test(entry)) {
        return entry;
    }

    const datedEntry = entry.match(/^(\/\/ \[[^\]]+\])(.*)$/);
    if (datedEntry) {
        return `${datedEntry[1]} [${randomUUID()}]${datedEntry[2]}`;
    }

    return `// [${randomUUID()}] ${entry.replace(/^\/\/\s*/, '')}`;
}

function addFeaturePriority(entry: string): string {
    const idMatch = entry.match(featureIdPattern)!;
    const idEnd = idMatch.index + idMatch[0].length;
    const suffix = entry.slice(idEnd);
    const priorityMatch = suffix.match(/^\s+\[(High|Medium|Low)\](.*)$/i);
    if (!priorityMatch) {
        return `${entry.slice(0, idEnd)} [Medium]${suffix}`;
    }

    const priority = canonicalPriorities[priorityMatch[1].toLowerCase()];
    return `${entry.slice(0, idEnd)} [${priority}]${priorityMatch[2]}`;
}

function setFeaturePriority(entry: string, priority: FeaturePriority): string {
    const prioritizedEntry = addFeaturePriority(entry);
    const idMatch = prioritizedEntry.match(featureIdPattern)!;
    const idEnd = idMatch.index + idMatch[0].length;
    const suffix = prioritizedEntry.slice(idEnd);
    const priorityMatch = suffix.match(/^\s+\[(High|Medium|Low)\](.*)$/i)!;
    return `${prioritizedEntry.slice(0, idEnd)} [${priority}]${priorityMatch[2]}`;
}

function addFeatureStatus(entry: string): string {
    const idMatch = entry.match(featureIdPattern)!;
    const idEnd = idMatch.index + idMatch[0].length;
    const suffix = entry.slice(idEnd);
    const priorityMatch = suffix.match(/^\s+\[(High|Medium|Low)\](.*)$/i)!;
    const remaining = priorityMatch[2];
    const statusMatch = remaining.match(/^\s+\[(Questions|Backlog|In progress|Done|Aborted|Denied)\](.*)$/i);
    if (!statusMatch) {
        return `${entry.slice(0, idEnd)} [${canonicalPriorities[priorityMatch[1].toLowerCase()]}] [Backlog]${remaining}`;
    }

    const status = canonicalStatuses[statusMatch[1].toLowerCase()];
    return `${entry.slice(0, idEnd)} [${canonicalPriorities[priorityMatch[1].toLowerCase()]}]`
        + ` [${status}]${statusMatch[2]}`;
}

function setFeatureStatus(entry: string, status: FeatureStatus): string {
    const normalizedEntry = addFeatureStatus(addFeaturePriority(entry));
    const idMatch = normalizedEntry.match(featureIdPattern)!;
    const idEnd = idMatch.index + idMatch[0].length;
    const suffix = normalizedEntry.slice(idEnd);
    const priorityMatch = suffix.match(/^\s+\[(High|Medium|Low)\](.*)$/i)!;
    const statusMatch = priorityMatch[2].match(/^\s+\[(Questions|Backlog|In progress|Done|Aborted|Denied)\](.*)$/i)!;
    return `${normalizedEntry.slice(0, idEnd)} [${canonicalPriorities[priorityMatch[1].toLowerCase()]}]`
        + ` [${status}]${statusMatch[2]}`;
}

async function addStartedFeatureToDevEnv(root: string, entry: string, id: string): Promise<void> {
    const filename = join(root, 'DEVENVOPDEV.md');
    const contents = await readFile(filename, 'utf8');
    const lines = contents.split(/\r?\n/);
    const description = entry.replace(
        /^.*\] \[(?:High|Medium|Low)\] \[In progress\] /,
        '',
    );
    const featureLine = `- [In progress] ${description} <!-- feature-id:${id} -->`;
    const marker = `<!-- feature-id:${id} -->`;

    for (let index = lines.length - 1; index >= 0; index--) {
        if (lines[index].includes(marker)) {
            lines.splice(index, 1);
        }
    }

    const headingIndex = lines.findIndex(line =>
        /^\s*The features you are writing are, take them one by one:\s*$/i.test(line),
    );
    if (headingIndex >= 0) {
        let lastInProgressIndex = -1;
        for (let index = headingIndex + 1; index < lines.length; index++) {
            if (/^\s*-\s+\[In progress\]\s/.test(lines[index])) {
                lastInProgressIndex = index;
            }
        }
        lines.splice(lastInProgressIndex >= 0 ? lastInProgressIndex + 1 : headingIndex + 1, 0, featureLine);
    } else {
        if (lines.every(line => !line)) {
            lines.length = 0;
        } else if (lines[lines.length - 1] !== '') {
            lines.push('');
        }
        lines.push('The features you are writing are, take them one by one:', featureLine);
    }

    const lineEnding = contents.includes('\r\n') ? '\r\n' : '\n';
    await writeFile(filename, lines.join(lineEnding), 'utf8');
}

function setFeatureDescription(entry: string, description: string): string {
    const match = entry.match(
        /^(\/\/ (?:\[[^\]]+\] )?\[[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\] \[(?:High|Medium|Low)\] \[(?:Questions|Backlog|In progress|Done|Aborted|Denied)\] ).*$/i,
    );
    return `${match![1]}${description}`;
}

async function updateStartedFeatureTask(
    root: string,
    id: string,
    description: string,
): Promise<{ filename: string; contents: string; updated: string } | null> {
    const filename = join(root, 'DEVENVOPDEV.md');
    let contents: string;
    try {
        contents = await readFile(filename, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return null;
        }
        throw error;
    }

    const marker = `<!-- feature-id:${id} -->`;
    const lines = contents.split(/\r?\n/);
    const taskIndex = lines.findIndex(line => line.includes(marker));
    if (taskIndex < 0) {
        return null;
    }
    const lineEnding = contents.includes('\r\n') ? '\r\n' : '\n';
    const updated = lines.map((line, index) =>
        index === taskIndex ? `- [In progress] ${description} ${marker}` : line,
    ).join(lineEnding);
    await writeFile(filename, updated, 'utf8');
    return { filename, contents, updated };
}

async function removeStartedFeatureTask(
    root: string,
    id: string,
): Promise<{ filename: string; contents: string } | null> {
    const filename = join(root, 'DEVENVOPDEV.md');
    let contents: string;
    try {
        contents = await readFile(filename, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return null;
        }
        throw error;
    }

    const marker = `<!-- feature-id:${id} -->`;
    const lines = contents.split(/\r?\n/);
    const remainingLines = lines.filter(line => !line.includes(marker));
    if (remainingLines.length === lines.length) {
        return null;
    }

    const lineEnding = contents.includes('\r\n') ? '\r\n' : '\n';
    await writeFile(filename, remainingLines.join(lineEnding), 'utf8');
    return { filename, contents };
}

async function readFeatureEntries(filename: string): Promise<string[]> {
    let contents: string;
    try {
        contents = await readFile(filename, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }

    const entries = contents.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const identifiedEntries = entries.map(entry => addFeatureStatus(addFeaturePriority(addFeatureId(entry))));
    const normalizedContents = identifiedEntries.length ? `${identifiedEntries.join('\n')}\n` : '';
    if (contents !== normalizedContents) {
        await writeFile(filename, normalizedContents, 'utf8');
    }
    return identifiedEntries;
}

export function createFeatureHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const description: unknown = request.body?.description;
        if (typeof description !== 'string' || !description.trim()) {
            response.status(400).json({ error: { message: 'Feature description is required.' } });
            return;
        }

        const requestedPriority: unknown = request.body?.priority ?? 'Low';
        if (typeof requestedPriority !== 'string'
            || !featurePriorities.includes(requestedPriority as FeaturePriority)) {
            response.status(400).json({ error: { message: 'Feature priority must be High, Medium, or Low.' } });
            return;
        }

        const requestedStatus: unknown = request.body?.status ?? 'Backlog';
        if (typeof requestedStatus !== 'string'
            || !featureStatuses.includes(requestedStatus as FeatureStatus)) {
            response.status(400).json({ error: { message: 'Feature status must be Questions, Backlog, In progress, Done, Aborted, or Denied.' } });
            return;
        }

        const oneLineDescription = description.trim().replace(/\s+/g, ' ');
        const id = randomUUID();
        const entry =
            `// [${formatTimestamp(new Date())}] [${id}] [${requestedPriority}] [${requestedStatus}] ${oneLineDescription}`;
        const filename = join(root, '.features');

        void readFeatureEntries(filename)
            .then(() => appendFile(filename, `${entry}\n`, 'utf8'))
            .then(() => response.status(201).json({ data: entry }))
            .catch(next);
    };
}

export function createFeaturesListHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFeatureEntries(join(root, '.features'))
            .then(entries => response.json({ data: entries }))
            .catch(next);
    };
}

export function createFeaturePriorityHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        const requestedPriority: unknown = request.body?.priority;
        if (typeof id !== 'string'
            || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }
        if (typeof requestedPriority !== 'string'
            || !featurePriorities.includes(requestedPriority as FeaturePriority)) {
            response.status(400).json({ error: { message: 'Feature priority must be High, Medium, or Low.' } });
            return;
        }

        const filename = join(root, '.features');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                entries[featureIndex] = setFeaturePriority(entries[featureIndex], requestedPriority as FeaturePriority);
                await writeFile(filename, `${entries.join('\n')}\n`, 'utf8');
                response.json({ data: entries[featureIndex] });
            })
            .catch(next);
    };
}

export function createFeatureStatusHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        const requestedStatus: unknown = request.body?.status;
        if (typeof id !== 'string'
            || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }
        if (typeof requestedStatus !== 'string'
            || !featureStatuses.includes(requestedStatus as FeatureStatus)) {
            response.status(400).json({ error: { message: 'Feature status must be Questions, Backlog, In progress, Done, Aborted, or Denied.' } });
            return;
        }

        const filename = join(root, '.features');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const previousContents = `${entries.join('\n')}\n`;
                entries[featureIndex] = setFeatureStatus(entries[featureIndex], requestedStatus as FeatureStatus);
                await writeFile(filename, `${entries.join('\n')}\n`, 'utf8');
                if (requestedStatus !== 'In progress') {
                    try {
                        await removeStartedFeatureTask(root, id.toLowerCase());
                    } catch (error) {
                        await writeFile(filename, previousContents, 'utf8');
                        throw error;
                    }
                }
                response.json({ data: entries[featureIndex] });
            })
            .catch(next);
    };
}

export function createFeatureDescriptionHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        const requestedDescription: unknown = request.body?.description;
        if (typeof id !== 'string'
            || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }
        if (typeof requestedDescription !== 'string' || !requestedDescription.trim()) {
            response.status(400).json({ error: { message: 'Feature description is required.' } });
            return;
        }

        const description = requestedDescription.trim().replace(/\s+/g, ' ');
        const filename = join(root, '.features');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const previousContents = `${entries.join('\n')}\n`;
                const updatedEntry = setFeatureDescription(entries[featureIndex], description);
                const updatedEntries = [...entries];
                updatedEntries[featureIndex] = updatedEntry;
                await writeFile(filename, `${updatedEntries.join('\n')}\n`, 'utf8');
                try {
                    await updateStartedFeatureTask(root, id.toLowerCase(), description);
                } catch (error) {
                    await writeFile(filename, previousContents, 'utf8');
                    throw error;
                }
                response.json({ data: updatedEntry });
            })
            .catch(next);
    };
}

export function createFeatureStartHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        if (typeof id !== 'string'
            || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }

        const filename = join(root, '.features');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const entry = setFeatureStatus(entries[featureIndex], 'In progress');
                await addStartedFeatureToDevEnv(root, entry, id.toLowerCase());
                entries[featureIndex] = entry;
                await writeFile(filename, `${entries.join('\n')}\n`, 'utf8');
                response.json({ data: entry });
            })
            .catch(next);
    };
}

export function createFeatureRemovalHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        if (typeof id !== 'string'
            || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }

        const filename = join(root, '.features');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const previousContents = `${entries.join('\n')}\n`;
                const [removedFeature] = entries.splice(featureIndex, 1);
                try {
                    await writeFile(filename, entries.length ? `${entries.join('\n')}\n` : '', 'utf8');
                    await removeStartedFeatureTask(root, id.toLowerCase());
                } catch (error) {
                    await writeFile(filename, previousContents, 'utf8');
                    throw error;
                }
                response.json({ data: removedFeature });
            })
            .catch(next);
    };
}
