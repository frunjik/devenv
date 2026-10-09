import { describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { createWorkflowTodoHandler } from '../src/lib/handlers/workflow-todo';

jest.mock('node:fs/promises', () => ({
    ...jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises'),
    readFile: jest.fn(),
}));

const fileReader = jest.mocked(readFile);
const workflowTodoExample = {
    schemaVersion: 2,
    title: 'Workflow TODO List',
    introduction: 'A minimal example of registered work.',
    activeWorkflow: 'Diagram Editor',
    workflows: [
        {
            name: 'Diagram Editor',
            evaluationIds: [],
            primaryWorkPurpose: 'Product work',
            status: 'Active',
            resumeLabel: 'Checkpoint',
            resumePath: './diagram-editor-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        },
        {
            name: 'Workflow TODO View',
            evaluationIds: [],
            primaryWorkPurpose: 'Meta work',
            status: 'Paused',
            resumeLabel: 'Checkpoint',
            resumePath: './todo-view-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        },
    ],
    registrationNote: 'Only registered workflows are tracked.',
    workPurposeGuidance: {
        principle: 'Classify each workflow by its primary intended outcome.',
        purposes: [
            { label: 'Product work', description: 'Changes a user capability.', example: 'Diagram Editor' },
            { label: 'Meta work', description: 'Improves system practices.', example: 'Workflow TODO View' },
        ],
        mixedEffects: 'Record the dominant outcome.',
        distinction: 'Purpose is separate from lifecycle status.',
    },
    switchingGuidance: ['Save decisions and the next step.'],
    statusGuidance: 'Use Pending, Active, Paused, Blocked, or Completed.',
};

describe('workflow TODO API source', () => {
    it('loads and validates a minimal example with both work-purpose values', async () => {
        fileReader.mockResolvedValue(JSON.stringify(workflowTodoExample));
        const responseBody = await new Promise<unknown>((resolve, reject) => {
            let response: Response;
            response = {
                json: (body: unknown) => {
                    resolve(body);
                    return response;
                },
            } as Response;
            const next: NextFunction = error => reject(error);
            createWorkflowTodoHandler('example-root')({} as Request, response, next);
        });
        const data = (responseBody as { data: typeof workflowTodoExample }).data;

        expect(fileReader).toHaveBeenCalledWith(
            join('example-root', 'knowledge', 'workflows', 'workflow-todo-list.json'),
            'utf8',
        );
        expect(data).toEqual(workflowTodoExample);
        expect(data.workflows.map(({ name, primaryWorkPurpose }) => [name, primaryWorkPurpose])).toEqual([
            ['Diagram Editor', 'Product work'],
            ['Workflow TODO View', 'Meta work'],
        ]);
    });
});
