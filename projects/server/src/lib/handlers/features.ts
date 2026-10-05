import { randomUUID } from 'node:crypto';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import type { FeaturePriority, PPTFeature, PPTFeatureStatus } from '@ppt';

export type { FeaturePriority, PPTFeatureStatus } from '@ppt';

const featurePriorities: readonly FeaturePriority[] = ['High', 'Medium', 'Low'];
const featureStatuses: readonly PPTFeatureStatus[] = [
    'Questions',
    'Wished',
    'Backlog',
    'Committed',
    'InProgress',
    'Delivered',
    'Done',
    'Aborted',
    'Denied',
    'Archived',
];
const canonicalPriorities: Record<string, FeaturePriority> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};
const canonicalStatuses: Record<string, PPTFeatureStatus> = {
    questions: 'Questions',
    wished: 'Wished',
    backlog: 'Backlog',
    committed: 'Committed',
    inprogress: 'InProgress',
    'in progress': 'InProgress',
    delivered: 'Delivered',
    done: 'Done',
    aborted: 'Aborted',
    denied: 'Denied',
    archived: 'Archived',
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
    const statusMatch = remaining.match(/^\s+\[(Questions|Wished|Backlog|Committed|InProgress|In progress|Delivered|Done|Aborted|Denied|Archived)\](.*)$/i);
    if (!statusMatch) {
        return `${entry.slice(0, idEnd)} [${canonicalPriorities[priorityMatch[1].toLowerCase()]}] [Backlog]${remaining}`;
    }

    const status = canonicalStatuses[statusMatch[1].toLowerCase()];
    return `${entry.slice(0, idEnd)} [${canonicalPriorities[priorityMatch[1].toLowerCase()]}]`
        + ` [${status}]${statusMatch[2]}`;
}

function setFeatureStatus(entry: string, status: PPTFeatureStatus): string {
    const normalizedEntry = addFeatureStatus(addFeaturePriority(entry));
    const idMatch = normalizedEntry.match(featureIdPattern)!;
    const idEnd = idMatch.index + idMatch[0].length;
    const suffix = normalizedEntry.slice(idEnd);
    const priorityMatch = suffix.match(/^\s+\[(High|Medium|Low)\](.*)$/i)!;
    const statusMatch = priorityMatch[2]
        .match(/^\s+\[(Questions|Wished|Backlog|Committed|InProgress|In progress|Delivered|Done|Aborted|Denied|Archived)\](.*)$/i)!;
    const deliveredDateMatch = statusMatch[2].match(/\s+\[Delivered: (\d{4}-\d{2}-\d{2})\]$/);
    const description = statusMatch[2].replace(/\s+\[Delivered: \d{4}-\d{2}-\d{2}\]$/, '');
    const deliveredDate = status === 'Done'
        ? deliveredDateMatch?.[1] ?? formatTimestamp(new Date()).slice(0, 10)
        : undefined;
    return `${normalizedEntry.slice(0, idEnd)} [${canonicalPriorities[priorityMatch[1].toLowerCase()]}]`
        + ` [${status}]${description}${deliveredDate ? ` [Delivered: ${deliveredDate}]` : ''}`;
}

async function addStartedFeatureToDevEnv(root: string, entry: string, id: string): Promise<void> {
    const filename = join(root, 'DEVENVOPDEV.md');
    const contents = await readFile(filename, 'utf8');
    const lines = contents.split(/\r?\n/);
    const description = entry.replace(
        /^.*\] \[(?:High|Medium|Low)\] \[InProgress\] /,
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
        /^(\/\/ (?:\[[^\]]+\] )?\[[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\] \[(?:High|Medium|Low)\] \[(?:Questions|Wished|Backlog|Committed|InProgress|In progress|Delivered|Done|Aborted|Denied|Archived)\] )(.*?)(\s+\[Delivered: \d{4}-\d{2}-\d{2}\])?$/i,
    );
    return `${match![1]}${description}${match![3] ?? ''}`;
}

function featureDescription(entry: string): string {
    return entry.match(
        /\[(?:High|Medium|Low)\]\s+\[(?:Questions|Wished|Backlog|Committed|InProgress|In progress|Delivered|Done|Aborted|Denied|Archived)\]\s*(.*)$/i,
    )![1].replace(/\s+\[Delivered: \d{4}-\d{2}-\d{2}\]$/, '');
}

function sharedFeatureTermCount(first: string, second: string): number {
    const firstTerms = new Set(first.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    const secondTerms = new Set(second.toLowerCase().match(/[a-z0-9]+/g) ?? []);
    return [...firstTerms].filter(term => secondTerms.has(term)).length;
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

function entryToPPTFeature(entry: string): PPTFeature {
    const idMatch = entry.match(featureIdPattern)!;
    const head = entry.slice(0, idMatch.index);
    const [, priority, status, tail] = entry.slice(idMatch.index + idMatch[0].length).match(
        /^\s+\[(High|Medium|Low)\]\s+\[(Questions|Wished|Backlog|Committed|InProgress|In progress|Delivered|Done|Aborted|Denied|Archived)\]\s*(.*)$/,
    )!;
    const createdAt = head.match(/^\/\/ \[([^\]]+)\] $/)?.[1];
    const leadingText = createdAt ? '' : head.replace(/^\/\/\s*/, '').trim();
    const [, trailingText, deliveredDate] = tail.match(/^(.*?)(?: \[Delivered: (\d{4}-\d{2}-\d{2})\])?$/)!;
    return {
        id: idMatch[0].slice(1, -1),
        ...(createdAt ? { createdAt } : {}),
        priority: priority as FeaturePriority,
        status: status as PPTFeatureStatus,
        description: [leadingText, trailingText].filter(Boolean).join(' '),
        ...(deliveredDate ? { deliveredDate } : {}),
    };
}

function storedFeatureToEntry(feature: PPTFeature): string {
    return `// ${feature.createdAt ? `[${feature.createdAt}] ` : ''}[${feature.id}] [${feature.priority}]`
        + ` [${feature.status}] ${feature.description}`
        + `${feature.deliveredDate ? ` [Delivered: ${feature.deliveredDate}]` : ''}`;
}

function serializeEntries(entries: string[]): string {
    return entries.map(entry => `${JSON.stringify(entryToPPTFeature(entry))}\n`).join('');
}

function parsePPTFeatureLine(line: string): PPTFeature | undefined {
    try {
        const parsed: unknown = JSON.parse(line);
        const candidate = parsed as Partial<PPTFeature> | null;
        return typeof candidate?.id === 'string'
            && typeof candidate.description === 'string'
            && featurePriorities.includes(candidate.priority as FeaturePriority)
            && featureStatuses.includes(candidate.status as PPTFeatureStatus)
            ? candidate as PPTFeature
            : undefined;
    } catch {
        return undefined;
    }
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

    const lines = contents.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const identifiedEntries = lines.map(line => {
        const stored = parsePPTFeatureLine(line);
        return stored
            ? storedFeatureToEntry(stored)
            : addFeatureStatus(addFeaturePriority(addFeatureId(line)));
    });
    const normalizedContents = serializeEntries(identifiedEntries);
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
            || !featureStatuses.includes(requestedStatus as PPTFeatureStatus)) {
            response.status(400).json({ error: { message: 'Feature status must be Questions, Wished, Backlog, Committed, InProgress, Delivered, Done, Aborted, Denied, or Archived.' } });
            return;
        }

        const filename = join(root, '.wishlist');

        void readFeatureEntries(filename)
            .then(async entries => {
                const oneLineDescription = description.trim().replace(/\s+/g, ' ');
                const duplicateIndex = entries.findIndex(entry =>
                    sharedFeatureTermCount(featureDescription(entry), oneLineDescription) > 3,
                );
                if (duplicateIndex >= 0) {
                    const duplicate = entries[duplicateIndex];
                    const duplicateId = duplicate.match(featureIdPattern)![0].slice(1, -1);

                    const existingDescription = featureDescription(duplicate);
                    const mergedDescription = existingDescription.toLowerCase() === oneLineDescription.toLowerCase()
                        ? existingDescription
                        : `${existingDescription}; ${oneLineDescription}`;
                    if (mergedDescription !== existingDescription) {
                        const previousContents = serializeEntries(entries);
                        const updatedEntries = [...entries];
                        updatedEntries[duplicateIndex] = setFeatureDescription(duplicate, mergedDescription);
                        await writeFile(filename, serializeEntries(updatedEntries), 'utf8');
                        try {
                            await updateStartedFeatureTask(root, duplicateId.toLowerCase(), mergedDescription);
                        } catch (error) {
                            await writeFile(filename, previousContents, 'utf8');
                            throw error;
                        }
                        entries[duplicateIndex] = updatedEntries[duplicateIndex];
                    }

                    response.status(200).json({ data: entryToPPTFeature(entries[duplicateIndex]) });
                    return;
                }

                const id = randomUUID();
                const deliveredDate = requestedStatus === 'Done'
                    ? ` [Delivered: ${formatTimestamp(new Date()).slice(0, 10)}]`
                    : '';
                const entry =
                    `// [${formatTimestamp(new Date())}] [${id}] [${requestedPriority}] [${requestedStatus}] ${oneLineDescription}${deliveredDate}`;
                await appendFile(filename, serializeEntries([entry]), 'utf8');
                response.status(201).json({ data: entryToPPTFeature(entry) });
            })
            .catch(next);
    };
}

export function createFeaturesListHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFeatureEntries(join(root, '.wishlist'))
            .then(entries => response.json({ data: entries.map(entryToPPTFeature) }))
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

        const filename = join(root, '.wishlist');
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
                await writeFile(filename, serializeEntries(entries), 'utf8');
                response.json({ data: entryToPPTFeature(entries[featureIndex]) });
            })
            .catch(next);
    };
}

export function createFeatureOrderHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        const direction: unknown = request.body?.direction;
        if (typeof id !== 'string'
            || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }
        if (direction !== 'up' && direction !== 'down') {
            response.status(400).json({ error: { message: 'Feature order direction must be up or down.' } });
            return;
        }

        const filename = join(root, '.wishlist');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }
                if (!/\[InProgress\]/i.test(entries[featureIndex])) {
                    response.status(409).json({ error: { message: `Feature '${id}' is not in progress.` } });
                    return;
                }

                const inProgressIndexes = entries.reduce<number[]>((indexes, entry, index) => {
                    if (/\[InProgress\]/i.test(entry)) {
                        indexes.push(index);
                    }
                    return indexes;
                }, []);
                const position = inProgressIndexes.indexOf(featureIndex);
                const targetPosition = position + (direction === 'up' ? -1 : 1);
                if (targetPosition >= 0 && targetPosition < inProgressIndexes.length) {
                    const targetIndex = inProgressIndexes[targetPosition];
                    [entries[featureIndex], entries[targetIndex]] = [entries[targetIndex], entries[featureIndex]];
                    await writeFile(filename, serializeEntries(entries), 'utf8');
                }

                response.json({ data: entries.map(entryToPPTFeature) });
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
            || !featureStatuses.includes(requestedStatus as PPTFeatureStatus)) {
            response.status(400).json({ error: { message: 'Feature status must be Questions, Wished, Backlog, Committed, InProgress, Delivered, Done, Aborted, Denied, or Archived.' } });
            return;
        }

        const filename = join(root, '.wishlist');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const previousContents = serializeEntries(entries);
                entries[featureIndex] = setFeatureStatus(entries[featureIndex], requestedStatus as PPTFeatureStatus);
                await writeFile(filename, serializeEntries(entries), 'utf8');
                if (requestedStatus !== 'InProgress') {
                    try {
                        await removeStartedFeatureTask(root, id.toLowerCase());
                    } catch (error) {
                        await writeFile(filename, previousContents, 'utf8');
                        throw error;
                    }
                }
                response.json({ data: entryToPPTFeature(entries[featureIndex]) });
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
        const filename = join(root, '.wishlist');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const previousContents = serializeEntries(entries);
                const updatedEntry = setFeatureDescription(entries[featureIndex], description);
                const updatedEntries = [...entries];
                updatedEntries[featureIndex] = updatedEntry;
                await writeFile(filename, serializeEntries(updatedEntries), 'utf8');
                try {
                    await updateStartedFeatureTask(root, id.toLowerCase(), description);
                } catch (error) {
                    await writeFile(filename, previousContents, 'utf8');
                    throw error;
                }
                response.json({ data: entryToPPTFeature(updatedEntry) });
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

        const filename = join(root, '.wishlist');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const entry = setFeatureStatus(entries[featureIndex], 'InProgress');
                await addStartedFeatureToDevEnv(root, entry, id.toLowerCase());
                entries[featureIndex] = entry;
                await writeFile(filename, serializeEntries(entries), 'utf8');
                response.json({ data: entryToPPTFeature(entry) });
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

        const filename = join(root, '.wishlist');
        void readFeatureEntries(filename)
            .then(async entries => {
                const featureIndex = entries.findIndex(entry =>
                    entry.match(featureIdPattern)?.[0].slice(1, -1).toLowerCase() === id.toLowerCase(),
                );
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const previousContents = serializeEntries(entries);
                const [removedFeature] = entries.splice(featureIndex, 1);
                try {
                    await writeFile(filename, entries.length ? serializeEntries(entries) : '', 'utf8');
                    await removeStartedFeatureTask(root, id.toLowerCase());
                } catch (error) {
                    await writeFile(filename, previousContents, 'utf8');
                    throw error;
                }
                response.json({ data: entryToPPTFeature(removedFeature) });
            })
            .catch(next);
    };
}
