import { appendFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';

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

export function createFeatureHandler(root: string): RequestHandler {
    return (request, response, next) => {
        const description: unknown = request.body?.description;
        if (typeof description !== 'string' || !description.trim()) {
            response.status(400).json({ error: { message: 'Feature description is required.' } });
            return;
        }

        const oneLineDescription = description.trim().replace(/\s+/g, ' ');
        const entry = `// [${formatTimestamp(new Date())}] ${oneLineDescription}`;
        const filename = join(root, '.features');

        void readFile(filename, 'utf8')
            .catch((error: NodeJS.ErrnoException) => {
                if (error.code === 'ENOENT') {
                    return '';
                }
                throw error;
            })
            .then(contents => appendFile(filename, `${contents && !contents.endsWith('\n') ? '\n' : ''}${entry}\n`, 'utf8'))
            .then(() => response.status(201).json({ data: entry }))
            .catch(next);
    };
}

export function createFeaturesListHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(root, '.features'), 'utf8')
            .then(contents => {
                const entries = contents.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
                response.json({ data: entries });
            })
            .catch((error: NodeJS.ErrnoException) => {
                if (error.code === 'ENOENT') {
                    response.json({ data: [] });
                    return;
                }
                next(error);
            });
    };
}
