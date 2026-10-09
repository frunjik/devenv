import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import type { WorkflowTodoList, WorkflowWorkPurpose } from '@shared';

const workPurposes: WorkflowWorkPurpose[] = ['Product work', 'Meta work'];

function isWorkflowWorkPurpose(value: string): value is WorkflowWorkPurpose {
    return workPurposes.some(purpose => purpose === value);
}

export function createWorkflowTodoHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(root, 'knowledge', 'workflows', 'workflow-todo-list.md'), 'utf8')
            .then(markdown => response.json({ data: parseWorkflowTodo(markdown) }))
            .catch(next);
    };
}

function parseWorkflowTodo(markdown: string): WorkflowTodoList {
    const lines = markdown.split(/\r?\n/);
    const header = lines.indexOf('| Workflow | Primary work purpose | Status | Resume reference | Related concern |');
    if (header < 0 || lines[header + 1] !== '| --- | --- | --- | --- | --- |') {
        throw new Error('The Workflow TODO List is missing its table header');
    }
    const workflows: WorkflowTodoList['workflows'] = [];
    for (const line of lines.slice(header + 2)) {
        if (!line.startsWith('|')) {
            break;
        }
        const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
        if (cells.length !== 5 || cells.some(cell => !cell)) {
            throw new Error('A workflow TODO row must contain five non-empty fields');
        }
        const [name, purpose, status, reference, relatedConcern] = cells;
        if (!isWorkflowWorkPurpose(purpose)) {
            throw new Error('A workflow TODO row must have a valid primary work purpose');
        }
        const link = /^\[([^\]]+)\]\(((?:\.\/|\.\.\/practices\/)[a-z0-9-]+(?:\.generated)?\.md#[a-z0-9-]+)\)$/.exec(reference);
        if (!link) {
            throw new Error('A workflow resume reference must link to a local knowledge Markdown checkpoint');
        }
        workflows.push({
            name,
            primaryWorkPurpose: purpose,
            status,
            resumeLabel: link[1],
            resumePath: link[2],
            relatedConcern,
        });
    }
    return { workflows };
}
