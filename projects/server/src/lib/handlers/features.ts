import { randomUUID } from 'node:crypto';
import { access, appendFile, readFile, writeFile } from 'node:fs/promises';
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
    const idEnd = idMatch.index + idMatch[0].length;
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
    const idEnd = idMatch.index + idMatch[0].length;
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

async function addStartedFeatureToDevEnv(root: string, description: string, id: string): Promise<void> {
    const filename = join(root, 'DEVENVOPDEV.md');
    const contents = await readFile(filename, 'utf8');
    const lines = contents.split(/\r?\n/);
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

function legacyLineToFeature(line: string): PPTFeature {
    const entry = addFeatureStatus(addFeaturePriority(addFeatureId(line)));
    const idMatch = entry.match(featureIdPattern)!;
    const head = entry.slice(0, idMatch.index);
    const [, priority, status, tail] = entry.slice(idMatch.index + idMatch[0].length).match(
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
    moveToBacklog(id: string): void;
}

async function readFeatureStore(root: string): Promise<FeatureStore> {
    const wishlistFilename = join(root, '.wishlist');
    const backlogFilename = join(root, '.backlog');
    const wishlist = await readFeatures(wishlistFilename);
    const backlog = await readFeatures(backlogFilename);
    const backlogIds = new Set(backlog.map(feature => feature.id.toLowerCase()));
    const isInBacklog = (feature: PPTFeature): boolean => backlogIds.has(feature.id.toLowerCase());
    const splitContents = (features: PPTFeature[]) => ({
        wishlist: serializeFeatures(features.filter(feature => !isInBacklog(feature))),
        backlog: serializeFeatures(features.filter(isInBacklog)),
    });
    const writeContents = async (contents: { wishlist: string; backlog: string }): Promise<void> => {
        await writeFile(wishlistFilename, contents.wishlist, 'utf8');
        const backlogExists = await access(backlogFilename).then(() => true, () => false);
        if (contents.backlog || backlogExists) {
            await writeFile(backlogFilename, contents.backlog, 'utf8');
        }
    };
    const store: FeatureStore = {
        features: [...wishlist, ...backlog],
        save: features => writeContents(splitContents(features)),
        snapshot: () => {
            const contents = splitContents(store.features);
            return () => writeContents(contents);
        },
        moveToBacklog: id => {
            backlogIds.add(id.toLowerCase());
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

        const filename = join(root, '.wishlist');

        void readFeatureStore(root)
            .then(async store => {
                const features = store.features;
                const oneLineDescription = description.trim().replace(/\s+/g, ' ');
                const duplicateIndex = features.findIndex(feature =>
                    sharedFeatureTermCount(feature.description, oneLineDescription) > 3,
                );
                if (duplicateIndex >= 0) {
                    const duplicate = features[duplicateIndex];
                    const mergedDescription = duplicate.description.toLowerCase() === oneLineDescription.toLowerCase()
                        ? duplicate.description
                        : `${duplicate.description}; ${oneLineDescription}`;
                    if (mergedDescription !== duplicate.description) {
                        const restore = store.snapshot();
                        const updatedFeatures = [...features];
                        updatedFeatures[duplicateIndex] = { ...duplicate, description: mergedDescription };
                        await store.save(updatedFeatures);
                        try {
                            await updateStartedFeatureTask(root, duplicate.id.toLowerCase(), mergedDescription);
                        } catch (error) {
                            await restore();
                            throw error;
                        }
                        features[duplicateIndex] = updatedFeatures[duplicateIndex];
                    }

                    response.status(200).json({ data: features[duplicateIndex] });
                    return;
                }

                const feature = withStatus({
                    id: randomUUID(),
                    createdAt: formatTimestamp(new Date()),
                    priority: requestedPriority as FeaturePriority,
                    status: requestedStatus as PPTFeatureStatus,
                    description: oneLineDescription,
                }, requestedStatus as PPTFeatureStatus);
                await appendFile(filename, serializeFeatures([feature]), 'utf8');
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
        void readFeatures(join(root, '.backlog'))
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
                if (features[featureIndex].status !== 'Queued') {
                    response.status(409).json({ error: { message: `Feature '${id}' is not queued.` } });
                    return;
                }

                const queuedIndexes = features.reduce<number[]>((indexes, feature, index) => {
                    if (feature.status === 'Queued') {
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
                    await updateStartedFeatureTask(root, id.toLowerCase(), description);
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
                await addStartedFeatureToDevEnv(root, feature.description, id.toLowerCase());
                features[featureIndex] = feature;
                store.moveToBacklog(id);
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
