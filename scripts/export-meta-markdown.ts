import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeMarkdown } from './meta-export-markdown';

const root = process.cwd();
writeMarkdown(
    resolve(root, 'knowledge/knowledge-transfer/meta-export-example.json'),
    resolve(root, 'knowledge/knowledge-transfer/meta-export-example.generated.md'),
    { readFileSync, writeFileSync },
);
