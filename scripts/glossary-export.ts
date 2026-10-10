import { writeFileSync, readFileSync } from 'node:fs';
import { glossaryEntriesToMarkdown } from '../projects/shared/src/lib/glossary.types';
import type { TextFileSystem } from '../projects/shared/src/lib/text-file-system.types';

export function writeGlossaryMarkdown(
    inputPath: string,
    outputPath: string,
    filesystem: TextFileSystem,
): void {
    const data = JSON.parse(filesystem.readFileSync(inputPath, 'utf8')) as unknown;
    const markdown = glossaryEntriesToMarkdown(data);
    filesystem.writeFileSync(outputPath, markdown, 'utf8');
}

export const glossaryExportFileSystem: TextFileSystem = { readFileSync, writeFileSync };
