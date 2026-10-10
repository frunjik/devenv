import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeMarkdown } from './agent-essentials-markdown';

const root = process.cwd();
for (const name of ['agent-essentials', 'agent-essentials-testing']) {
    writeMarkdown(
        resolve(root, `knowledge/practices/${name}.json`),
        resolve(root, `knowledge/practices/${name}.candidate.md`),
        { readFileSync, writeFileSync },
    );
}
