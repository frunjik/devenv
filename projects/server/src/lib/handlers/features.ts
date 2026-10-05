import { createHash, randomUUID } from 'node:crypto';
import { access, appendFile, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import type { FeaturePriority, PPTFeature, PPTFeatureStatus } from '@ppt';

export type { FeaturePriority, PPTFeatureStatus } from '@ppt';

const featurePriorities: readonly FeaturePriority[] = ['High', 'Medium', 'Low'];
const featureStatuses: readonly PPTFeatureStatus[] = [
    'Questions',
    'Wished',
    'Backlog',
    'Queued',
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
    queued: 'Queued',
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
    const idEnd = idMatch.index! + idMatch[0].length;
    const suffix = entry.slice(idEnd);
    const priorityMatch = suffix.match(/^\s+\[(High|Medium|Low)\](.*)$/i);
    if (!priorityMatch) {
        return `${entry.slice(0, idEnd)} [Medium]${suffix}`;
    }

    const priority = canonicalPriorities[priorityMatch[1].toLowerCase()];
    return `${entry.slice(0, idEnd)} [${priority}]${priorityMatch[2]}`;
}

function addFeatureStatus(entry: string): string {
    const idMatch = entry.match(featureIdPattern)!;
    const idEnd = idMatch.index! + idMatch[0].length;
    const suffix = entry.slice(idEnd);
    const priorityMatch = suffix.match(/^\s+\[(High|Medium|Low)\](.*)$/i)!;
    const remaining = priorityMatch[2];
    const statusMatch = remaining.match(/^\s+\[(Questions|Wished|Backlog|Queued|Committed|InProgress|In progress|Delivered|Done|Aborted|Denied|Archived)\](.*)$/i);
    if (!statusMatch) {
        return `${entry.slice(0, idEnd)} [${canonicalPriorities[priorityMatch[1].toLowerCase()]}] [Backlog]${remaining}`;
    }

    const status = canonicalStatuses[statusMatch[1].toLowerCase()];
    return `${entry.slice(0, idEnd)} [${canonicalPriorities[priorityMatch[1].toLowerCase()]}]`
        + ` [${status}]${statusMatch[2]}`;
}

function isFeatureTaskLine(line: string, id: string): boolean {
    const lowerLine = line.toLowerCase();
    return lowerLine.includes(`"id":"${id}"`) || lowerLine.includes(`<!-- feature-id:${id} -->`);
}

async function addStartedFeatureToDevEnv(root: string, feature: PPTFeature): Promise<void> {
    const filename = join(root, 'DEVENVOPDEV.md');
    const contents = await readFile(filename, 'utf8');
    const lines = contents.split(/\r?\n/);
    const id = feature.id.toLowerCase();
    const featureLine = JSON.stringify(orderedFeature(feature));

    for (let index = lines.length - 1; index >= 0; index--) {
        if (isFeatureTaskLine(lines[index], id)) {
            lines.splice(index, 1);
        }
    }

    const headingIndex = lines.findIndex(line =>
        /^\s*The features you are writing are, take them one by one:\s*$/i.test(line),
    );
    if (headingIndex >= 0) {
        let lastInProgressIndex = -1;
        for (let index = headingIndex + 1; index < lines.length; index++) {
            if (/^\s*(-\s+\[In progress\]\s|\{)/.test(lines[index])) {
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

async function updateStartedFeatureTask(
    root: string,
    feature: PPTFeature,
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

    const id = feature.id.toLowerCase();
    const lines = contents.split(/\r?\n/);
    const taskIndex = lines.findIndex(line => isFeatureTaskLine(line, id));
    if (taskIndex < 0) {
        return null;
    }
    const lineEnding = contents.includes('\r\n') ? '\r\n' : '\n';
    const updated = lines.map((line, index) =>
        index === taskIndex ? JSON.stringify(orderedFeature(feature)) : line,
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

    const lines = contents.split(/\r?\n/);
    const remainingLines = lines.filter(line => !isFeatureTaskLine(line, id));
    if (remainingLines.length === lines.length) {
        return null;
    }

    const lineEnding = contents.includes('\r\n') ? '\r\n' : '\n';
    await writeFile(filename, remainingLines.join(lineEnding), 'utf8');
    return { filename, contents };
}

function legacyLineToFeature(line: string): PPTFeature {
    const entry = addFeatureStatus(addFeaturePriority(addFeatureId(line)));
    const idMatch = entry.match(featureIdPattern)!;
    const head = entry.slice(0, idMatch.index!);
    const [, priority, status, tail] = entry.slice(idMatch.index! + idMatch[0].length).match(
        /^\s+\[(High|Medium|Low)\]\s+\[(Questions|Wished|Backlog|Queued|Committed|InProgress|In progress|Delivered|Done|Aborted|Denied|Archived)\]\s*(.*)$/,
    )!;
    const createdAt = head.match(/^\/\/ \[([^\]]+)\] $/)?.[1];
    const leadingText = createdAt ? '' : head.replace(/^\/\/\s*/, '').trim();
    const [, trailingText, deliveredDate] = tail.match(/^(.*?)(?: \[Delivered: (\d{4}-\d{2}-\d{2})\])?$/)!;
    return {
        id: idMatch[0].slice(1, -1),
        ...(createdAt ? { createdAt } : {}),
        priority: priority as FeaturePriority,
        status: canonicalStatuses[status.toLowerCase()],
        description: [leadingText, trailingText].filter(Boolean).join(' '),
        ...(deliveredDate ? { deliveredDate } : {}),
    };
}

function orderedFeature(feature: PPTFeature): PPTFeature {
    return {
        id: feature.id,
        ...(feature.createdAt ? { createdAt: feature.createdAt } : {}),
        priority: feature.priority,
        status: feature.status,
        description: feature.description,
        ...(feature.deliveredDate ? { deliveredDate: feature.deliveredDate } : {}),
    };
}

function serializeFeatures(features: PPTFeature[]): string {
    return features.map(feature => `${JSON.stringify(orderedFeature(feature))}\n`).join('');
}

function withStatus(feature: PPTFeature, status: PPTFeatureStatus): PPTFeature {
    const { deliveredDate, ...rest } = feature;
    return {
        ...rest,
        status,
        ...(status === 'Done' ? { deliveredDate: deliveredDate ?? formatTimestamp(new Date()).slice(0, 10) } : {}),
    };
}

function isQueuedStatus(status: PPTFeatureStatus): boolean {
    return status === 'Queued' || status === 'Committed';
}

function findFeatureIndex(features: PPTFeature[], id: string): number {
    return features.findIndex(feature => feature.id.toLowerCase() === id.toLowerCase());
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

async function readFeatures(filename: string): Promise<PPTFeature[]> {
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
    const features = lines.map(line => parsePPTFeatureLine(line) ?? legacyLineToFeature(line));
    const normalizedContents = serializeFeatures(features);
    if (contents !== normalizedContents) {
        await writeFile(filename, normalizedContents, 'utf8');
    }
    return features;
}

interface FeatureStore {
    features: PPTFeature[];
    save(features: PPTFeature[]): Promise<void>;
    snapshot(): () => Promise<void>;
}

const legacyFeatureStores = ['.wishlist', '.backlog', '.delivered'];

async function readFeatureStore(root: string): Promise<FeatureStore> {
    const filename = join(root, '.features');
    const features = await readFeatures(filename);
    const knownIds = new Set(features.map(feature => feature.id.toLowerCase()));
    for (const legacyName of legacyFeatureStores) {
        const legacyFilename = join(root, legacyName);
        const legacyFeaturesList = await readFeatures(legacyFilename);
        for (const feature of legacyFeaturesList) {
            if (!knownIds.has(feature.id.toLowerCase())) {
                knownIds.add(feature.id.toLowerCase());
                features.push(feature);
            }
        }
        if (legacyFeaturesList.length > 0 || await access(legacyFilename).then(() => true, () => false)) {
            await writeFile(filename, serializeFeatures(features), 'utf8');
            await rm(legacyFilename, { force: true });
        }
    }
    const write = (contents: string): Promise<void> => writeFile(filename, contents, 'utf8');
    const store: FeatureStore = {
        features,
        save: updated => write(serializeFeatures(updated)),
        snapshot: () => {
            const contents = serializeFeatures(store.features);
            return () => write(contents);
        },
    };
    return store;
}
const featureIdFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statusMessage = 'Feature status must be Questions, Wished, Backlog, Queued, Committed, InProgress, Delivered, Done, Aborted, Denied, or Archived.';

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

        const requestedStatus: unknown = request.body?.status ?? 'Wished';
        if (typeof requestedStatus !== 'string'
            || !featureStatuses.includes(requestedStatus as PPTFeatureStatus)) {
            response.status(400).json({ error: { message: statusMessage } });
            return;
        }

        void readFeatureStore(root)
            .then(async store => {
                const oneLineDescription = description.trim().replace(/\s+/g, ' ');
                const feature = withStatus({
                    id: randomUUID(),
                    createdAt: formatTimestamp(new Date()),
                    priority: requestedPriority as FeaturePriority,
                    status: requestedStatus as PPTFeatureStatus,
                    description: oneLineDescription,
                }, requestedStatus as PPTFeatureStatus);
                await store.save([...store.features, feature]);
                response.status(201).json({ data: feature });
            })
            .catch(next);
    };
}

export function createFeaturesListHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFeatureStore(root)
            .then(store => response.json({ data: store.features }))
            .catch(next);
    };
}

export function createBacklogListHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFeatureStore(root)
            .then(store => response.json({ data: store.features.filter(feature => isQueuedStatus(feature.status)) }))
            .catch(next);
    };
}

async function readArchivedFeatures(root: string): Promise<PPTFeature[]> {
    const filename = join(root, '.archived');
    let contents: string;
    try {
        contents = await readFile(filename, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }

    const features = contents.split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && line.toLowerCase() !== 'archived')
        .map(line => {
            const parsed = parsePPTFeatureLine(line);
            if (parsed) {
                return withStatus(parsed, 'Archived');
            }
            const hash = createHash('sha1').update(line).digest('hex');
            const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
            return withStatus({ ...legacyLineToFeature(line), id }, 'Archived');
        });
    const normalizedContents = serializeFeatures(features);
    if (contents !== normalizedContents) {
        await writeFile(filename, normalizedContents, 'utf8');
    }
    return features;
}
export async function deliverDoneFeatures(root: string): Promise<PPTFeature[]> {
    const currentFilename = join(root, '.current');
    let contents: string;
    try {
        contents = await readFile(currentFilename, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }

    const lines = contents.split(/\r?\n/);
    const delivered: PPTFeature[] = [];
    const remaining = lines.filter(line => {
        const feature = parsePPTFeatureLine(line.trim());
        if (feature?.status === 'Done') {
            delivered.push(withStatus(feature, 'Done'));
            return false;
        }
        return true;
    });
    if (delivered.length === 0) {
        return [];
    }

    const store = await readFeatureStore(root);
    const deliveredIds = new Set(delivered.map(feature => feature.id.toLowerCase()));
    await store.save([
        ...store.features.filter(feature => !deliveredIds.has(feature.id.toLowerCase())),
        ...delivered,
    ]);
    await writeFile(currentFilename, remaining.join(contents.includes('\r\n') ? '\r\n' : '\n'), 'utf8');
    for (const id of deliveredIds) {
        await removeStartedFeatureTask(root, id);
    }
    return delivered;
}

export function createArchivedListHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readArchivedFeatures(root)
            .then(features => response.json({ data: features }))
            .catch(next);
    };
}

export function createFeaturePriorityHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        const requestedPriority: unknown = request.body?.priority;
        if (typeof id !== 'string' || !featureIdFormat.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }
        if (typeof requestedPriority !== 'string'
            || !featurePriorities.includes(requestedPriority as FeaturePriority)) {
            response.status(400).json({ error: { message: 'Feature priority must be High, Medium, or Low.' } });
            return;
        }

        void readFeatureStore(root)
            .then(async store => {
                const features = store.features;
                const featureIndex = findFeatureIndex(features, id);
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                features[featureIndex] = { ...features[featureIndex], priority: requestedPriority as FeaturePriority };
                await store.save(features);
                response.json({ data: features[featureIndex] });
            })
            .catch(next);
    };
}

export function createFeatureOrderHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        const direction: unknown = request.body?.direction;
        if (typeof id !== 'string' || !featureIdFormat.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }
        if (direction !== 'up' && direction !== 'down') {
            response.status(400).json({ error: { message: 'Feature order direction must be up or down.' } });
            return;
        }

        void readFeatureStore(root)
            .then(async store => {
                const features = store.features;
                const featureIndex = findFeatureIndex(features, id);
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }
                if (!isQueuedStatus(features[featureIndex].status)) {
                    response.status(409).json({ error: { message: `Feature '${id}' is not queued.` } });
                    return;
                }

                const queuedIndexes = features.reduce<number[]>((indexes, feature, index) => {
                    if (isQueuedStatus(feature.status)) {
                        indexes.push(index);
                    }
                    return indexes;
                }, []);
                const position = queuedIndexes.indexOf(featureIndex);
                const targetPosition = position + (direction === 'up' ? -1 : 1);
                if (targetPosition >= 0 && targetPosition < queuedIndexes.length) {
                    const targetIndex = queuedIndexes[targetPosition];
                    [features[featureIndex], features[targetIndex]] = [features[targetIndex], features[featureIndex]];
                    await store.save(features);
                }

                response.json({ data: features });
            })
            .catch(next);
    };
}

export function createFeatureStatusHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        const requestedStatus: unknown = request.body?.status;
        if (typeof id !== 'string' || !featureIdFormat.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }
        if (typeof requestedStatus !== 'string'
            || !featureStatuses.includes(requestedStatus as PPTFeatureStatus)) {
            response.status(400).json({ error: { message: statusMessage } });
            return;
        }

        void readFeatureStore(root)
            .then(async store => {
                const features = store.features;
                const featureIndex = findFeatureIndex(features, id);
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const restore = store.snapshot();
                features[featureIndex] = withStatus(features[featureIndex], requestedStatus as PPTFeatureStatus);
                await store.save(features);
                if (requestedStatus !== 'Queued') {
                    try {
                        await removeStartedFeatureTask(root, id.toLowerCase());
                    } catch (error) {
                        await restore();
                        throw error;
                    }
                }
                response.json({ data: features[featureIndex] });
            })
            .catch(next);
    };
}

export function createFeatureDescriptionHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        const requestedDescription: unknown = request.body?.description;
        if (typeof id !== 'string' || !featureIdFormat.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }
        if (typeof requestedDescription !== 'string' || !requestedDescription.trim()) {
            response.status(400).json({ error: { message: 'Feature description is required.' } });
            return;
        }

        const description = requestedDescription.trim().replace(/\s+/g, ' ');
        void readFeatureStore(root)
            .then(async store => {
                const features = store.features;
                const featureIndex = findFeatureIndex(features, id);
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const restore = store.snapshot();
                const updatedFeature = { ...features[featureIndex], description };
                const updatedFeatures = [...features];
                updatedFeatures[featureIndex] = updatedFeature;
                await store.save(updatedFeatures);
                try {
                    await updateStartedFeatureTask(root, updatedFeature);
                } catch (error) {
                    await restore();
                    throw error;
                }
                response.json({ data: updatedFeature });
            })
            .catch(next);
    };
}

export function createFeatureStartHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        if (typeof id !== 'string' || !featureIdFormat.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }

        void readFeatureStore(root)
            .then(async store => {
                const features = store.features;
                const featureIndex = findFeatureIndex(features, id);
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const feature = withStatus(features[featureIndex], 'Queued');
                await addStartedFeatureToDevEnv(root, feature);
                features[featureIndex] = feature;
                await store.save(features);
                response.json({ data: feature });
            })
            .catch(next);
    };
}

export function createFeatureRemovalHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        if (typeof id !== 'string' || !featureIdFormat.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }

        void readFeatureStore(root)
            .then(async store => {
                const features = store.features;
                const featureIndex = findFeatureIndex(features, id);
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const restore = store.snapshot();
                const [removedFeature] = features.splice(featureIndex, 1);
                try {
                    await store.save(features);
                    await removeStartedFeatureTask(root, id.toLowerCase());
                } catch (error) {
                    await restore();
                    throw error;
                }
                response.json({ data: removedFeature });
            })
            .catch(next);
    };
}

export function createFeatureArchiveHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const id = request.params['id'];
        if (typeof id !== 'string' || !featureIdFormat.test(id)) {
            response.status(400).json({ error: { message: 'A valid feature ID is required.' } });
            return;
        }

        void readFeatureStore(root)
            .then(async store => {
                const features = store.features;
                const featureIndex = findFeatureIndex(features, id);
                if (featureIndex < 0) {
                    response.status(404).json({ error: { message: `Feature '${id}' was not found.` } });
                    return;
                }

                const archivedFeature = withStatus(features[featureIndex], 'Archived');
                await appendFile(join(root, '.archived'), serializeFeatures([archivedFeature]), 'utf8');
                features.splice(featureIndex, 1);
                await store.save(features);
                response.json({ data: archivedFeature });
            })
            .catch(next);
    };
}

export function createArchiveDoneHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFeatureStore(root)
            .then(async store => {
                const done = store.features.filter(feature => feature.status === 'Done');
                if (done.length > 0) {
                    const archived = done.map(feature => withStatus(feature, 'Archived'));
                    await appendFile(join(root, '.archived'), serializeFeatures(archived), 'utf8');
                    await store.save(store.features.filter(feature => feature.status !== 'Done'));
                    response.json({ data: archived });
                    return;
                }
                response.json({ data: [] });
            })
            .catch(next);
    };
}