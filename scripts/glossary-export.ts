import { writeFileSync, readFileSync } from 'node:fs';
import { parseGlossaryLines } from '../projects/shared/src/lib/glossary.types';

interface GlossaryExportFileSystem {
    readFileSync(path: string, encoding: 'utf8'): string;
    writeFileSync(path: string, data: string, encoding: 'utf8'): void;
}

export function writeGlossaryJson(
    inputPath: string,
    outputPath: string,
    filesystem: GlossaryExportFileSystem,
): void {
    const source = filesystem.readFileSync(inputPath, 'utf8');
    const entries = parseGlossaryLines(source.split(/\r?\n/));
    filesystem.writeFileSync(outputPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

export const glossaryExportFileSystem: GlossaryExportFileSystem = { readFileSync, writeFileSync };
