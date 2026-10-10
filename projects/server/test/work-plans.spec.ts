import { describe, expect, it, jest } from '@jest/globals';
import { validateWorkPlanRegistry, workPlanRegistryToMarkdown } from '@shared';
import { writeWorkPlanMarkdown } from '../../../scripts/work-plans-export';

const emptyRegistry = {
    schemaVersion: 1,
    workPlans: [],
};

const registry = {
    schemaVersion: 1,
    workPlans: [{
        id: 'agent-practices',
        title: 'Agent practices',
        description: 'Improve development guidance.',
        topics: [{
            id: 'agent-essentials',
            title: 'Agent Essentials',
            description: 'Maintain the selected guidance.',
            tasks: [{
                id: 'persist-plan',
                title: 'Persist structured plans',
                description: 'Add a validated WorkPlan registry.',
                status: 'Active',
            }],
        }],
    }],
};

describe('WorkPlan persistence model', () => {
    it('accepts an empty registry and renders an explicit empty state', () => {
        expect(validateWorkPlanRegistry(emptyRegistry)).toEqual(emptyRegistry);
        expect(workPlanRegistryToMarkdown(emptyRegistry)).toContain('No WorkPlans registered.');
    });

    it.each(['Pending', 'Active', 'Paused', 'Blocked', 'Completed'])(
        'accepts the WorkTask status %s',
        status => {
            const taskRegistry = {
                ...registry,
                workPlans: [{
                    ...registry.workPlans[0],
                    topics: [{
                        ...registry.workPlans[0].topics[0],
                        tasks: [{
                            ...registry.workPlans[0].topics[0].tasks[0],
                            status,
                        }],
                    }],
                }],
            };
            expect(validateWorkPlanRegistry(taskRegistry).workPlans[0].topics[0].tasks[0].status)
                .toBe(status);
        },
    );

    it('validates and renders the WorkPlan > WorkTopic > WorkTask hierarchy', () => {
        const validated = validateWorkPlanRegistry(registry);
        expect(validated.workPlans[0].topics[0].tasks[0].status).toBe('Active');

        const markdown = workPlanRegistryToMarkdown(validated);
        expect(markdown).toContain('# Work Plans');
        expect(markdown).toContain('## WorkPlan: Agent practices');
        expect(markdown).toContain('### WorkTopic: Agent Essentials');
        expect(markdown).toContain('#### WorkTask: Persist structured plans');
        expect(markdown).toContain('**Status:** Active');
        expect(markdown).toContain('Add a validated WorkPlan registry.');
        expect(markdown).toContain(
            'WorkTask statuses: Pending, Active, Paused, Blocked, Completed.',
        );
        expect(markdown).toContain(
            'Evaluation links and baseline/completion evidence are not part of this schema yet.',
        );
    });

    it('preserves multi-line descriptions while keeping hierarchy labels single-line', () => {
        const multilineRegistry = {
            ...registry,
            workPlans: [{
                ...registry.workPlans[0],
                description: 'First line.\nSecond line.',
            }],
        };
        expect(workPlanRegistryToMarkdown(multilineRegistry)).toContain(
            'First line.\nSecond line.',
        );
        expect(() => validateWorkPlanRegistry({
            ...registry,
            workPlans: [{ ...registry.workPlans[0], title: 'First line.\nSecond line.' }],
        })).toThrow('Invalid WorkPlanRegistry: expected single-line text');
    });

    it('renders plans without topics and topics without tasks', () => {
        const sparseRegistry = {
            schemaVersion: 1,
            workPlans: [{
                ...registry.workPlans[0],
                topics: [
                    { ...registry.workPlans[0].topics[0], tasks: [] },
                    { ...registry.workPlans[0].topics[0], id: 'empty-topic', tasks: [] },
                ],
            }],
        };
        const markdown = workPlanRegistryToMarkdown(sparseRegistry);
        expect(markdown).toContain('No WorkTasks registered.');
        expect(workPlanRegistryToMarkdown({
            schemaVersion: 1,
            workPlans: [{ ...registry.workPlans[0], topics: [] }],
        })).toContain('No WorkTopics registered.');
    });

    it.each([
        null,
        [],
        12,
        { ...emptyRegistry, schemaVersion: 2 },
        { ...emptyRegistry, extra: true },
        { ...emptyRegistry, workPlans: null },
        { ...emptyRegistry, workPlans: [null] },
        { ...registry, workPlans: [{ ...registry.workPlans[0], id: ' ' }] },
        { ...registry, workPlans: [{ ...registry.workPlans[0], id: 'multi\nline' }] },
        { ...registry, workPlans: [{ ...registry.workPlans[0], title: '' }] },
        { ...registry, workPlans: [{ ...registry.workPlans[0], description: 1 }] },
        { ...registry, workPlans: [{ ...registry.workPlans[0], topics: null }] },
        {
            ...registry,
            workPlans: [{
                ...registry.workPlans[0],
                topics: [null],
            }],
        },
        {
            ...registry,
            workPlans: [{
                ...registry.workPlans[0],
                topics: [{
                    ...registry.workPlans[0].topics[0],
                    tasks: [null],
                }],
            }],
        },
        {
            ...registry,
            workPlans: [{
                ...registry.workPlans[0],
                topics: [{
                    ...registry.workPlans[0].topics[0],
                    tasks: [{
                        ...registry.workPlans[0].topics[0].tasks[0],
                        status: 'In progress',
                    }],
                }],
            }],
        },
        {
            ...registry,
            workPlans: [
                registry.workPlans[0],
                { ...registry.workPlans[0], id: registry.workPlans[0].topics[0].id },
            ],
        },
    ])('rejects invalid registry values', value => {
        expect(() => validateWorkPlanRegistry(value)).toThrow('Invalid WorkPlanRegistry');
    });

    it('writes a generated view from validated JSON and does not write invalid data', () => {
        const filesystem = {
            readFileSync: jest.fn(() => JSON.stringify(registry)),
            writeFileSync: jest.fn(),
        };
        writeWorkPlanMarkdown('work-plans.json', 'work-plans.md', filesystem);
        expect(filesystem.writeFileSync).toHaveBeenCalledWith(
            'work-plans.md',
            expect.stringContaining('Generated from [work-plans.json]'),
            'utf8',
        );

        filesystem.readFileSync.mockReturnValue(JSON.stringify({ ...emptyRegistry, schemaVersion: 2 }));
        expect(() => writeWorkPlanMarkdown('work-plans.json', 'work-plans.md', filesystem))
            .toThrow('Invalid WorkPlanRegistry');
        expect(filesystem.writeFileSync).toHaveBeenCalledTimes(1);
    });
});
