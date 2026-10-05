import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';

export function createCurrentTaskHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(root, 'DEVENVOPDEV.md'), 'utf8')
            .then(contents => {
                const lines = contents.split(/\r?\n/).map(line => line.trim());
                const headingIndex = lines.findIndex(line =>
                    /^The features you are writing are, take them one by one:$/i.test(line),
                );
                const entry = headingIndex < 0
                    ? null
                    : lines.slice(headingIndex + 1).find(Boolean) ?? null;
                response.json({ data: entry });
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
