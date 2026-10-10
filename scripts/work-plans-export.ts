import { readFileSync, writeFileSync } from 'node:fs';
import { validateWorkPlanEvaluationLinks, workPlanRegistryToMarkdown } from '../projects/shared/src/lib/work-plan.types';
import type { TextFileSystem } from '../projects/shared/src/lib/text-file-system.types';

export function writeWorkPlanMarkdown(
    inputPath: string,
    evaluationLedgerPath: string,
    outputPath: string,
    filesystem: TextFileSystem,
): void {
    const data: unknown = JSON.parse(filesystem.readFileSync(inputPath, 'utf8'));
    const ledger: unknown = JSON.parse(filesystem.readFileSync(evaluationLedgerPath, 'utf8'));
    validateWorkPlanEvaluationLinks(data, ledger);
    const markdown = workPlanRegistryToMarkdown(data);
    filesystem.writeFileSync(outputPath, markdown, 'utf8');
}

export const workPlanExportFileSystem: TextFileSystem = {
    readFileSync,
    writeFileSync,
};
