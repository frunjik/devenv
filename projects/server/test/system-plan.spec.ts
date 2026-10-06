import { afterEach, describe, expect, it } from '@jest/globals';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { createApp } from '../src/public-api';

const temporaryDirectories: string[] = [];

afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map(path => rm(path, { recursive: true, force: true })));
});

describe('system plan route', () => {
    it('returns live concern data parsed from the register', async () => {
        const root = await mkdtemp(join(tmpdir(), 'system-plan-'));
        temporaryDirectories.push(root);
        const concernDirectory = join(root, 'design', 'problem-inquiry-system');
        await mkdir(concernDirectory, { recursive: true });
        await writeFile(join(concernDirectory, 'concerns.md'), [
            '# Problem-Inquiry System Concerns',
            '',
            '### SC-001 — Distinguish input from ticket',
            '',
            '**Kind:** Domain · **Status:** Validated · **Depends on:** None',
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
        ].join('\n'));

        const response = await request(createApp(root)).get('/system-plan');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([
            {
                id: 'SC-001',
                title: 'Distinguish input from ticket',
                kind: 'Domain',
                status: 'Validated',
                dependsOn: [],
                summary: 'Distinguish raw input from a Problem Ticket.',
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
        ]);
    });

    it('returns an explicit server error for a malformed register', async () => {
        const root = await mkdtemp(join(tmpdir(), 'system-plan-'));
        temporaryDirectories.push(root);
        const concernDirectory = join(root, 'design', 'problem-inquiry-system');
        await mkdir(concernDirectory, { recursive: true });
        await writeFile(join(concernDirectory, 'concerns.md'), 'No concern entries');

        const response = await request(createApp(root)).get('/system-plan');

        expect(response.status).toBe(500);
    });

    it('rejects malformed concern metadata, dependencies, and descriptions', async () => {
        const root = await mkdtemp(join(tmpdir(), 'system-plan-'));
        temporaryDirectories.push(root);
        const concernDirectory = join(root, 'design', 'problem-inquiry-system');
        await mkdir(concernDirectory, { recursive: true });
        const register = join(concernDirectory, 'concerns.md');
        const malformedEntries = [
            '### SC-001 — Missing metadata\n\nA description without metadata.',
            '### SC-001 — Invalid status\n\n**Kind:** Domain · **Status:** Unknown · **Depends on:** None\n\nA description.',
            '### SC-001 — Invalid dependency\n\n**Kind:** Domain · **Status:** Ready · **Depends on:** not-an-id\n\nA description.',
            '### SC-001 — Missing description\n\n**Kind:** Domain · **Status:** Ready · **Depends on:** None\n\n',
        ];

        for (const entry of malformedEntries) {
            await writeFile(register, entry);
            const response = await request(createApp(root)).get('/system-plan');
            expect(response.status).toBe(500);
        }
    });

    it('loads the repository concern register without a duplicated dashboard snapshot', async () => {
        const response = await request(createApp(process.cwd())).get('/system-plan');

        expect(response.status).toBe(200);
        expect(response.body.data.find((concern: { id: string }) => concern.id === 'SC-021'))
            .toMatchObject({ dependsOn: ['SC-016'] });
        expect(response.body.data.map((concern: { id: string }) => concern.id)).toContain('SC-052');
    });
});
