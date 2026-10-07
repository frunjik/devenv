import { resolve } from 'node:path';
import { glossaryExportFileSystem, writeGlossaryJson } from './glossary-export';

const root = process.cwd();
writeGlossaryJson(
    resolve(root, '.glossary'),
    resolve(root, 'design', 'glossary-export.generated.json'),
    glossaryExportFileSystem,
);
