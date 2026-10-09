import { readFileSync, writeFileSync } from 'node:fs';
import { workflowTodoListToMarkdown } from '../projects/shared/src/lib/workflow-todo.types';

interface WorkflowTodoExportFileSystem {
    readFileSync(path: string, encoding: 'utf8'): string;
    writeFileSync(path: string, data: string, encoding: 'utf8'): void;
}

export function writeWorkflowTodoMarkdown(
    inputPath: string,
    outputPath: string,
    filesystem: WorkflowTodoExportFileSystem,
): void {
    const data: unknown = JSON.parse(filesystem.readFileSync(inputPath, 'utf8'));
    const markdown = workflowTodoListToMarkdown(data);
    filesystem.writeFileSync(outputPath, markdown, 'utf8');
}

export const workflowTodoExportFileSystem: WorkflowTodoExportFileSystem = {
    readFileSync,
    writeFileSync,
};
