import { readFileSync, writeFileSync } from 'node:fs';
import { workPlanRegistryToMarkdown } from '../projects/shared/src/lib/work-plan.types';

interface WorkPlanExportFileSystem {
    readFileSync(path: string, encoding: 'utf8'): string;
    writeFileSync(path: string, data: string, encoding: 'utf8'): void;
}

export function writeWorkPlanMarkdown(
    inputPath: string,
    outputPath: string,
    filesystem: WorkPlanExportFileSystem,
): void {
    const data: unknown = JSON.parse(filesystem.readFileSync(inputPath, 'utf8'));
    const markdown = workPlanRegistryToMarkdown(data);
    filesystem.writeFileSync(outputPath, markdown, 'utf8');
}

export const workPlanExportFileSystem: WorkPlanExportFileSystem = {
    readFileSync,
    writeFileSync,
};
