import { describe, expect, it } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import type { NextFunction, Request, Response } from 'express';
import { createWorkflowTodoHandler } from '../src/lib/handlers/workflow-todo';

describe('workflow TODO API source', () => {
    it('loads and validates the current repository JSON without a network listener', async () => {
        const responseBody = await new Promise<unknown>((resolve, reject) => {
            let response: Response;
            response = {
                json: (body: unknown) => {
                    resolve(body);
                    return response;
                },
            } as Response;
            const next: NextFunction = error => reject(error);
            createWorkflowTodoHandler(process.cwd())({} as Request, response, next);
        });
        const source = JSON.parse(await readFile(
            'knowledge/workflows/workflow-todo-list.json',
            'utf8',
        )) as { workflows: { name: string; primaryWorkPurpose: string }[] };
        const data = (responseBody as { data: typeof source }).data;

        expect(data).toEqual(source);
        expect(data.workflows).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: 'TODO View (DevEnv system layer)',
                primaryWorkPurpose: 'Meta work',
            }),
            expect.objectContaining({
                name: 'DevEnv Export (sibling or hosting system)',
                primaryWorkPurpose: 'Product work',
            }),
        ]));
    });
});
