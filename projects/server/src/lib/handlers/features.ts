import { randomUUID } from 'node:crypto';
import { appendFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import type { PPTFeature } from '@ppt';

function isPPTFeature(value: unknown): value is PPTFeature {
    return typeof value === 'object'
        && value !== null
        && 'id' in value
        && typeof value.id === 'string'
        && 'description' in value
        && typeof value.description === 'string'
        && 'priority' in value
        && (value.priority === 'Low' || value.priority === 'Medium' || value.priority === 'High')
        && 'status' in value
        && typeof value.status === 'string';
}

async function readFeatures(root: string): Promise<PPTFeature[]> {
    let contents: string;
    try {
        contents = await readFile(join(root, '.features'), 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }

    return contents.split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map((line, index) => {
            let value: unknown;
            try {
                value = JSON.parse(line);
            } catch (error) {
                throw new Error(`Invalid feature JSON on line ${index + 1} of .features.`, { cause: error });
            }
            if (!isPPTFeature(value)) {
                throw new Error(`Invalid feature record on line ${index + 1} of .features.`);
            }
            return value;
        });
}

export function createFeaturesListHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFeatures(root)
            .then(features => response.json({ data: features }))
            .catch(next);
    };
}

export function createFeatureHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const description: unknown = request.body?.description;
        if (typeof description !== 'string' || !description.trim()) {
            response.status(400).json({ error: { message: 'Feature description is required.' } });
            return;
        }

        const feature: PPTFeature = {
            id: randomUUID(),
            createdAt: new Date().toISOString(),
            priority: 'Low',
            status: 'Wished',
            description: description.trim().replace(/\s+/g, ' '),
        };
        const filename = join(root, '.features');
        void readFile(filename, 'utf8')
            .catch(error => {
                if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                    return '';
                }
                throw error;
            })
            .then(contents => appendFile(
                filename,
                `${contents && !contents.endsWith('\n') ? '\n' : ''}${JSON.stringify(feature)}\n`,
                'utf8',
            ))
            .then(() => response.status(201).json({ data: feature }))
            .catch(next);
    };
}
