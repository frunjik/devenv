import { readFileSync, writeFileSync } from 'node:fs';
import { workflowTodoListToMarkdown } from '../projects/shared/src/lib/workflow-todo.types';
import type { TextFileSystem } from '../projects/shared/src/lib/text-file-system.types';

export function writeWorkflowTodoMarkdown(
    inputPath: string,
    outputPath: string,
    filesystem: TextFileSystem,
): void {
    const data: unknown = JSON.parse(filesystem.readFileSync(inputPath, 'utf8'));
    const markdown = workflowTodoListToMarkdown(data);
    filesystem.writeFileSync(outputPath, markdown, 'utf8');
}

export const workflowTodoExportFileSystem: TextFileSystem = {
    readFileSync,
    writeFileSync,
};
