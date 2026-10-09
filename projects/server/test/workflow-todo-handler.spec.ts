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
const header = '| Workflow | Primary work purpose | Status | Resume reference | Related concern |\n| --- | --- | --- | --- | --- |';
const row = '| Minimal Typed Diagram Editor | Product work | Paused | [Checkpoint](./diagram-editor-workflow.md#checkpoint) | Not assigned |';

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
        fileReader.mockResolvedValue(`# Workflow TODO List\n\n${header}\n${row}\n`);

        await invokeHandler('repository-root');

        expect(fileReader).toHaveBeenCalledWith(
            join('repository-root', 'knowledge', 'workflows', 'workflow-todo-list.md'),
            'utf8',
        );
        expect(json).toHaveBeenCalledWith({ data: { workflows: [{
            name: 'Minimal Typed Diagram Editor',
            primaryWorkPurpose: 'Product work',
            status: 'Paused',
            resumeLabel: 'Checkpoint',
            resumePath: './diagram-editor-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        }] } });
        expect(nextMock).not.toHaveBeenCalled();
    });

    it('parses the repository Workflow TODO List and its work-purpose labels', async () => {
        fileReader.mockImplementation(
            jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises').readFile,
        );

        await invokeHandler(process.cwd());

        expect(json).toHaveBeenCalledWith({
            data: {
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
            },
        });
        expect(nextMock).not.toHaveBeenCalled();
    });

    it('forwards malformed table errors', async () => {
        fileReader.mockResolvedValue('| Workflow | Status |\n| --- | --- |');

        await invokeHandler('repository-root');

        expect(json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'The Workflow TODO List is missing its table header' }),
        );
    });

    it('rejects unknown work-purpose labels', async () => {
        fileReader.mockResolvedValue(`${header}\n${row.replace('Product work', 'Other')}\n`);

        await invokeHandler('repository-root');

        expect(json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'A workflow TODO row must have a valid primary work purpose' }),
        );
    });

    it('rejects malformed workflow rows', async () => {
        fileReader.mockResolvedValue(`${header}\n| only | two | fields |`);

        await invokeHandler('repository-root');

        expect(json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'A workflow TODO row must contain five non-empty fields' }),
        );
    });

    it('rejects invalid checkpoint links', async () => {
        fileReader.mockResolvedValue(`${header}\n${row.replace('./diagram-editor-workflow.md#checkpoint', 'https://example.test')}`);

        await invokeHandler('repository-root');

        expect(json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'A workflow resume reference must link to a local knowledge Markdown checkpoint',
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
