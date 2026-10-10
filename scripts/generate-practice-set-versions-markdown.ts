import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeMarkdown } from './practice-set-versions-markdown';

const root = process.cwd();
writeMarkdown(
    resolve(root, 'knowledge/practices/practice-set-versions.json'),
    resolve(root, 'knowledge/practices/practice-set-versions.generated.md'),
    { readFileSync, writeFileSync },
);
