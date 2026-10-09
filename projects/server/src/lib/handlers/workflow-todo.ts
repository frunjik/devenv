import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import { validateWorkflowTodoList } from '../../../../shared/src/lib/workflow-todo.types';

export function createWorkflowTodoHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(root, 'knowledge', 'workflows', 'workflow-todo-list.json'), 'utf8')
            .then(json => response.json({ data: validateWorkflowTodoList(JSON.parse(json)) }))
            .catch(next);
    };
}
