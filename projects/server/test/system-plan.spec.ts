import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import request from 'supertest';
import { createApp } from '../src/public-api';

jest.mock('node:fs/promises', () => {
    const actual = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises');
    return { ...actual, readFile: jest.fn(actual.readFile) };
});

const fileReader = jest.mocked(readFile);
const realFileReader = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises').readFile;

beforeEach(() => {
    fileReader.mockReset();
    fileReader.mockImplementation(realFileReader);
});

describe('system plan route', () => {
    it('returns live concern data parsed from the register', async () => {
        const root = process.cwd();
        fileReader.mockResolvedValue([
            '# Problem-Inquiry System Concerns',
            '',
            '### SC-001 — Distinguish input from ticket',
            '',
            '**Kind:** Domain · **Status:** Validated · **Depends on:** None · **User acceptance:** Pending',
            '',
            'Distinguish raw input from a Problem Ticket.',
            '',
            '### SC-002 — Preserve source provenance',
            '',
            '**Kind:** Behavior · **Status:** In progress · **Depends on:** SC-001',
            '',
            'Keep each interpretation traceable to its source.',
            '',
            '### SC-003 — Build the list',
            '',
            '**Kind:** Implementation · **Status:** Ready · **Depends on:** SC-001, SC-002',
            '',
            'Show accepted notes in a reviewable list.',
            '',
            '### SC-004 — Review design',
            '',
            '**Kind:** Design · **Status:** Validated · **Depends on:** None · **User acceptance:** Accepted',
            '',
            'Review the proposed design.',
            '',
            '### SC-005 — Review alternative',
            '',
            '**Kind:** Design · **Status:** Validated · **Depends on:** None · **User acceptance:** Rejected',
            '',
            'Record the alternative for reconsideration.',
        ].join('\n'));

        const response = await request(createApp(root)).get('/system-plan');

        expect(fileReader).toHaveBeenCalledWith(join(root, 'design', 'problem-inquiry-system', 'concerns.md'), 'utf8');
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([
            {
                id: 'SC-001',
                title: 'Distinguish input from ticket',
                kind: 'Domain',
                status: 'Validated',
                dependsOn: [],
                summary: 'Distinguish raw input from a Problem Ticket.',
                userAcceptance: 'Pending',
            },
            {
                id: 'SC-002',
                title: 'Preserve source provenance',
                kind: 'Behavior',
                status: 'In progress',
                dependsOn: ['SC-001'],
                summary: 'Keep each interpretation traceable to its source.',
            },
            {
                id: 'SC-003',
                title: 'Build the list',
                kind: 'Implementation',
                status: 'Ready',
                dependsOn: ['SC-001', 'SC-002'],
                summary: 'Show accepted notes in a reviewable list.',
            },
            {
                id: 'SC-004',
                title: 'Review design',
                kind: 'Design',
                status: 'Validated',
                dependsOn: [],
                summary: 'Review the proposed design.',
                userAcceptance: 'Accepted',
            },
            {
                id: 'SC-005',
                title: 'Review alternative',
                kind: 'Design',
                status: 'Validated',
                dependsOn: [],
                summary: 'Record the alternative for reconsideration.',
                userAcceptance: 'Rejected',
            },
        ]);
    });

    it('returns an explicit server error for a malformed register', async () => {
        fileReader.mockResolvedValue('No concern entries');

        const response = await request(createApp(process.cwd())).get('/system-plan');

        expect(response.status).toBe(500);
    });

    it('rejects malformed concern metadata, dependencies, and descriptions', async () => {
        const malformedEntries = [
            '### SC-001 — Missing metadata\n\nA description without metadata.',
            '### SC-001 — Invalid status\n\n**Kind:** Domain · **Status:** Unknown · **Depends on:** None\n\nA description.',
            '### SC-001 — Invalid dependency\n\n**Kind:** Domain · **Status:** Ready · **Depends on:** not-an-id\n\nA description.',
            '### SC-001 — Invalid acceptance\n\n**Kind:** Domain · **Status:** Validated · **Depends on:** None · **User acceptance:** Deferred\n\nA description.',
            '### SC-001 — Acceptance on unfinished work\n\n**Kind:** Domain · **Status:** In progress · **Depends on:** None · **User acceptance:** Pending\n\nA description.',
            '### SC-001 — Validated without acceptance\n\n**Kind:** Domain · **Status:** Validated · **Depends on:** None\n\nA description.',
            '### SC-001 — Missing description\n\n**Kind:** Domain · **Status:** Ready · **Depends on:** None\n\n',
        ];

        for (const entry of malformedEntries) {
            fileReader.mockResolvedValue(entry);
            const response = await request(createApp(process.cwd())).get('/system-plan');
            expect(response.status).toBe(500);
        }
    });

    it('reports filesystem read failures instead of returning an empty plan', async () => {
        fileReader.mockRejectedValue(new Error('Permission denied'));

        const response = await request(createApp(process.cwd())).get('/system-plan');

        expect(response.status).toBe(500);
    });

    it('loads the repository concern register without a duplicated dashboard snapshot', async () => {
        const response = await request(createApp(process.cwd())).get('/system-plan');

        expect(response.status).toBe(200);
        expect(response.body.data.find((concern: { id: string }) => concern.id === 'SC-021'))
            .toMatchObject({ dependsOn: ['SC-016'] });
        expect(response.body.data.map((concern: { id: string }) => concern.id)).toContain('SC-052');
        const validated = response.body.data.filter((concern: { status: string }) => concern.status === 'Validated');
        expect(validated.length).toBeGreaterThan(0);
        expect(validated.every((concern: { userAcceptance: string }) =>
            ['Pending', 'Accepted', 'Rejected'].includes(concern.userAcceptance))).toBe(true);
    });
});
