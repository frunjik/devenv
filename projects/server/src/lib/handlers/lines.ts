import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';

export function createLinesHandler(root: string, filenames: readonly string[]): RequestHandler {
    return (_request, response, next) => {
        const readFirst = async (): Promise<string> => {
            for (const filename of filenames.slice(0, -1)) {
                try {
                    return await readFile(join(root, filename), 'utf8');
                } catch (error) {
                    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                        throw error;
                    }
                }
            }
            return readFile(join(root, filenames[filenames.length - 1]), 'utf8');
        };
        void readFirst()
            .then(contents => {
                response.json({ data: contents.split(/\r?\n/).map(line => line.trim()).filter(Boolean) });
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
