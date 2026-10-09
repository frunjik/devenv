import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { createWorkflowTodoHandler } from '../src/lib/handlers/workflow-todo';

jest.mock('node:fs/promises', () => ({
    ...jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises'),
    readFile: jest.fn(),
}));

const fileReader = jest.mocked(readFile);
const workflowTodo = {
    schemaVersion: 2,
    title: 'Workflow TODO List',
    introduction: 'Repository-wide navigation for resumable work.',
    activeWorkflow: 'Minimal Typed Diagram Editor',
    workflows: [{
        name: 'Minimal Typed Diagram Editor',
        evaluationIds: ['diagram-selection-and-movement'],
        primaryWorkPurpose: 'Product work',
        status: 'Active',
        resumeLabel: 'Checkpoint',
        resumePath: './diagram-editor-workflow.md#checkpoint',
        relatedConcern: 'Not assigned',
    }],
    registrationNote: 'Only registered workflows are tracked.',
    workPurposeGuidance: {
        principle: 'Classify by primary intended outcome.',
        purposes: [
            { label: 'Product work', description: 'Builds capabilities.', example: 'Diagram Editor' },
            { label: 'Meta work', description: 'Evaluates DevEnv.', example: 'TODO View' },
        ],
        mixedEffects: 'Use the dominant outcome.',
        distinction: 'Purpose differs from status.',
    },
    switchingGuidance: ['Save the next step.'],
    statusGuidance: 'Use descriptive status values.',
};

describe('createWorkflowTodoHandler', () => {
    let response: Response;
    let next: NextFunction;
    let nextMock: jest.Mock;
    const json = jest.fn();

    beforeEach(() => {
        fileReader.mockReset();
        json.mockReset();
        response = { json } as unknown as Response;
        nextMock = jest.fn();
    });

    async function invokeHandler(root: string): Promise<void> {
        let settle = () => {};
        const completed = new Promise<void>(resolve => {
            settle = resolve;
        });
        json.mockImplementation(() => {
            settle();
            return response;
        });
        next = (error?: unknown) => {
            nextMock(error);
            settle();
        };
        createWorkflowTodoHandler(root)({} as Request, response, next);
        await completed;
    }

    it('loads and returns current workflows including their work purpose', async () => {
        fileReader.mockResolvedValue(JSON.stringify(workflowTodo));

        await invokeHandler('repository-root');

        expect(fileReader).toHaveBeenCalledWith(
            join('repository-root', 'knowledge', 'workflows', 'workflow-todo-list.json'),
            'utf8',
        );
        expect(json).toHaveBeenCalledWith({ data: workflowTodo });
        expect(nextMock).not.toHaveBeenCalled();
    });

    it('parses the repository Workflow TODO List and its work-purpose labels', async () => {
        fileReader.mockImplementation(
            jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises').readFile,
        );

        await invokeHandler(process.cwd());

        expect(json).toHaveBeenCalledWith({
            data: expect.objectContaining({
                workflows: expect.arrayContaining([
                    expect.objectContaining({
                        name: 'Minimal Typed Diagram Editor',
                        primaryWorkPurpose: 'Product work',
                    }),
                    expect.objectContaining({
                        name: 'DevEnv Value Evaluation',
                        primaryWorkPurpose: 'Meta work',
                    }),
                ]),
            }),
        });
        expect(nextMock).not.toHaveBeenCalled();
    });

    it('forwards invalid JSON errors', async () => {
        fileReader.mockResolvedValue('{');

        await invokeHandler('repository-root');

        expect(json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'SyntaxError' }),
        );
    });

    it('rejects unknown work-purpose labels', async () => {
        fileReader.mockResolvedValue(JSON.stringify({
            ...workflowTodo,
            workflows: workflowTodo.workflows.map(workflow => ({
                ...workflow,
                primaryWorkPurpose: 'Other',
            })),
        }));

        await invokeHandler('repository-root');

        expect(json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Invalid WorkflowTodoList: unknown primary work purpose' }),
        );
    });

    it('rejects malformed workflow rows', async () => {
        fileReader.mockResolvedValue(JSON.stringify({
            ...workflowTodo,
            workflows: [{ name: 'Incomplete' }],
        }));

        await invokeHandler('repository-root');

        expect(json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Invalid WorkflowTodoList: missing or unsupported fields' }),
        );
    });

    it('rejects invalid checkpoint links', async () => {
        fileReader.mockResolvedValue(JSON.stringify({
            ...workflowTodo,
            workflows: workflowTodo.workflows.map(workflow => ({
                ...workflow,
                resumePath: 'https://example.test',
            })),
        }));

        await invokeHandler('repository-root');

        expect(json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Invalid WorkflowTodoList: resume references must be local Markdown checkpoints',
            }),
        );
    });

    it('forwards filesystem errors', async () => {
        const error = new Error('Permission denied');
        fileReader.mockRejectedValue(error);

        await invokeHandler('repository-root');

        expect(nextMock).toHaveBeenCalledWith(error);
    });
});
