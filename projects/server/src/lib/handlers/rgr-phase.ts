import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import type { RgrPhase } from '@shared';

const VALID_PHASES: readonly RgrPhase[] = ['red', 'green', 'refactor'];

function toRgrPhase(value: string): RgrPhase | null {
    return (VALID_PHASES as readonly string[]).includes(value) ? value as RgrPhase : null;
}

export function createRgrPhaseHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(root, '.rgr-phase'), 'utf8')
            .then(contents => {
                const lines = contents.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
                const lastLine = lines.at(-1);
                response.json({ data: lastLine ? toRgrPhase(lastLine) : null });
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
