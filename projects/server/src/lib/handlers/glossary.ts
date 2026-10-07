import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import { validateGlossaryEntries } from '../../../../shared/src/lib/glossary.types';

export function createGlossaryHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(root, '.glossary.json'), 'utf8')
            .then(contents => response.json({ data: validateGlossaryEntries(JSON.parse(contents)) }))
            .catch(next);
    };
}
