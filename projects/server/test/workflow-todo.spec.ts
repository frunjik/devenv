import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import request from 'supertest';
import { createApp } from '../src/public-api';

jest.mock('node:fs/promises', () => ({
    ...jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises'),
    readFile: jest.fn(),
}));

const fileReader = jest.mocked(readFile);
const header = '| Workflow | Status | Resume reference | Related concern |\n| --- | --- | --- | --- |';
const row = '| TODO View (DevEnv system layer) | Pending | [Starting checkpoint](./todo-view-workflow.md#checkpoint) | Not assigned |';

beforeEach(() => {
    fileReader.mockReset();
});

describe('workflow TODO JSON', () => {
    it('derives live workflows from the authoritative Markdown', async () => {
        fileReader.mockResolvedValue(`# Workflow TODO List\n\n${header}\n${row}\n\n## Maintaining and Switching`);
        const response = await request(createApp(process.cwd())).get('/workflow-todo');
        expect(response.status).toBe(200);
        expect(fileReader).toHaveBeenCalledWith(join(process.cwd(), 'design', 'workflow-todo-list.md'), 'utf8');
        expect(response.body.data).toEqual({ workflows: [{
            name: 'TODO View (DevEnv system layer)', status: 'Pending',
            resumeLabel: 'Starting checkpoint', resumePath: './todo-view-workflow.md#checkpoint',
            relatedConcern: 'Not assigned',
        }] });
    });

    it('supports CRLF, descriptive statuses and an empty workflow table', async () => {
        fileReader.mockResolvedValue(`${header}\n${row.replace('Pending', 'Awaiting review')}\n`.replace(/\n/g, '\r\n'));
        expect((await request(createApp(process.cwd())).get('/workflow-todo')).body.data.workflows[0].status)
            .toBe('Awaiting review');
        fileReader.mockResolvedValue(`${header}\n\n## Maintaining`);
        expect((await request(createApp(process.cwd())).get('/workflow-todo')).body.data).toEqual({ workflows: [] });
    });

    it.each([
        'No table',
        '| Workflow | Status | Resume reference | Related concern |',
        `${header}\n| missing fields |`,
        `${header}\n${row.replace('Pending', '')}`,
        `${header}\n${row.replace('Starting checkpoint', '')}`,
        `${header}\n${row.replace('./todo-view-workflow.md#checkpoint', 'https://example.com')}`,
        `${header}\n${row.replace('./todo-view-workflow.md', '../secrets.md')}`,
        `${header}\n${row.replace('Not assigned', '')}`,
    ])('rejects malformed workflow data instead of returning success: %s', async markdown => {
        fileReader.mockResolvedValue(markdown);
        expect((await request(createApp(process.cwd())).get('/workflow-todo')).status).toBe(500);
    });

    it('forwards filesystem failures', async () => {
        fileReader.mockRejectedValue(new Error('Permission denied'));
        expect((await request(createApp(process.cwd())).get('/workflow-todo')).status).toBe(500);
    });

    it('loads the repository list rather than a copied snapshot', async () => {
        fileReader.mockImplementation(jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises').readFile);
        const response = await request(createApp(process.cwd())).get('/workflow-todo');
        expect(response.status).toBe(200);
        expect(response.body.data.workflows).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'TODO View (DevEnv system layer)' }),
            expect.objectContaining({ name: 'DevEnv Export (sibling or hosting system)' }),
        ]));
    });
});
