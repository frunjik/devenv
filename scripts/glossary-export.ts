import { writeFileSync, readFileSync } from 'node:fs';
import { glossaryEntriesToMarkdown } from '../projects/shared/src/lib/glossary.types';

interface GlossaryExportFileSystem {
    readFileSync(path: string, encoding: 'utf8'): string;
    writeFileSync(path: string, data: string, encoding: 'utf8'): void;
}

export function writeGlossaryMarkdown(
    inputPath: string,
    outputPath: string,
    filesystem: GlossaryExportFileSystem,
): void {
    const data = JSON.parse(filesystem.readFileSync(inputPath, 'utf8')) as unknown;
    const markdown = glossaryEntriesToMarkdown(data);
    filesystem.writeFileSync(outputPath, markdown, 'utf8');
}

export const glossaryExportFileSystem: GlossaryExportFileSystem = { readFileSync, writeFileSync };
