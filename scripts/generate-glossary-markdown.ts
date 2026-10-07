import { resolve } from 'node:path';
import { glossaryExportFileSystem, writeGlossaryMarkdown } from './glossary-export';

const root = process.cwd();
writeGlossaryMarkdown(
    resolve(root, '.glossary.json'),
    resolve(root, '.glossary'),
    glossaryExportFileSystem,
);
