import { randomUUID } from 'node:crypto';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';

export type FeaturePriority = 'High' | 'Medium' | 'Low';

const featurePriorities: readonly FeaturePriority[] = ['High', 'Medium', 'Low'];

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
    const identifiedEntry = entry.match(
        /^(.*\[[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\])(.*)$/i,
    );
    if (!identifiedEntry) {
        return entry;
    }

    const priorityMatch = identifiedEntry[2].match(/^\s+\[(High|Medium|Low)\](.*)$/i);
    if (!priorityMatch) {
        return `${identifiedEntry[1]} [Medium]${identifiedEntry[2]}`;
    }

    const priority = priorityMatch[1].toLowerCase() as Lowercase<FeaturePriority>;
    const formattedPriority = priority.charAt(0).toUpperCase() + priority.slice(1);
    return `${identifiedEntry[1]} [${formattedPriority}]${priorityMatch[2]}`;
}

function setFeaturePriority(entry: string, priority: FeaturePriority): string {
    const prioritizedEntry = addFeaturePriority(entry);
    const match = prioritizedEntry.match(
        /^(.*\[[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\]) \[(High|Medium|Low)\](.*)$/i,
    );
    if (!match) {
        throw new Error('Feature entry is missing its ID or priority.');
    }
    return `${match[1]} [${priority}]${match[3]}`;
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
    const identifiedEntries = entries.map(entry => addFeaturePriority(addFeatureId(entry)));
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

        const requestedPriority: unknown = request.body?.priority ?? 'Medium';
        if (typeof requestedPriority !== 'string'
            || !featurePriorities.includes(requestedPriority as FeaturePriority)) {
            response.status(400).json({ error: { message: 'Feature priority must be High, Medium, or Low.' } });
            return;
        }

        const oneLineDescription = description.trim().replace(/\s+/g, ' ');
        const id = randomUUID();
        const entry = `// [${formatTimestamp(new Date())}] [${id}] [${requestedPriority}] ${oneLineDescription}`;
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

                const [removedFeature] = entries.splice(featureIndex, 1);
                await writeFile(filename, entries.length ? `${entries.join('\n')}\n` : '', 'utf8');
                response.json({ data: removedFeature });
            })
            .catch(next);
    };
}
