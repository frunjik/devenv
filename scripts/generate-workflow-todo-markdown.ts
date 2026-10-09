import { resolve } from 'node:path';
import { workflowTodoExportFileSystem, writeWorkflowTodoMarkdown } from './workflow-todo-export';

const root = process.cwd();
writeWorkflowTodoMarkdown(
    resolve(root, 'knowledge/workflows/workflow-todo-list.json'),
    resolve(root, 'knowledge/workflows/workflow-todo-list.md'),
    workflowTodoExportFileSystem,
);
