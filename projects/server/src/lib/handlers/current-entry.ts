import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';

export function createCurrentEntryHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(root, '.current'), 'utf8')
            .then(contents => {
                const entries = contents.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
                response.json({ data: entries.at(-1) ?? null });
            })
            .catch((error: NodeJS.ErrnoException) => {
                if (error.code === 'ENOENT') {
                    response.json({ data: null });
                    return;
                }
                next(error);
            });
    };
}
