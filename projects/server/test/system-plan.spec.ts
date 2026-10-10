import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { requestApp } from './support/request-app';
import { createApp } from '../src/public-api';

// Interception: the system-plan handler imports readFile directly and has no injected filesystem boundary.
jest.mock('node:fs/promises', () => {
    const actual = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises');
    return { ...actual, readFile: jest.fn() };
});

const fileReader = jest.mocked(readFile);

beforeEach(() => {
    fileReader.mockReset();
    // Fail unconfigured reads instead of falling back to real repository files.
    fileReader.mockRejectedValue(Object.assign(new Error('Unexpected file read in test'), { code: 'ENOENT' }));
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

        const response = await requestApp(createApp(root)).get('/system-plan');

        expect(fileReader).toHaveBeenCalledWith(join(root, 'knowledge', 'domain-models', 'problem-inquiry-system', 'concerns.md'), 'utf8');
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

        const response = await requestApp(createApp(process.cwd())).get('/system-plan');

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
            const response = await requestApp(createApp(process.cwd())).get('/system-plan');
            expect(response.status).toBe(500);
        }
    });

    it('reports filesystem read failures instead of returning an empty plan', async () => {
        fileReader.mockRejectedValue(new Error('Permission denied'));

        const response = await requestApp(createApp(process.cwd())).get('/system-plan');

        expect(response.status).toBe(500);
    });

    it('skips the register template and accepts priorities and annotated dependencies', async () => {
        fileReader.mockResolvedValue([
            '### SC-000 — Short title',
            'Kind: ...',
            '',
            '### SC-021 — Define ticket lifecycle',
            '',
            '**Kind:** Domain · **Status:** In progress · **Priority:** High · **Depends on:** SC-016 (lifecycle states)',
            '',
            'Define how a ticket moves between states.',
        ].join('\n'));

        const response = await requestApp(createApp(process.cwd())).get('/system-plan');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([{
            id: 'SC-021',
            title: 'Define ticket lifecycle',
            kind: 'Domain',
            status: 'In progress',
            dependsOn: ['SC-016'],
            summary: 'Define how a ticket moves between states.',
        }]);
    });
});
