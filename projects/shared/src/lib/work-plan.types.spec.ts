import { describe, expect, it } from '@jest/globals';
import {
    validateWorkPlanEvaluationLinks,
    validateWorkPlanRegistry,
    workPlanRegistryToMarkdown,
} from './work-plan.types';

const task = {
    id: 'persist-plan',
    title: 'Persist structured plans',
    description: 'Add a validated WorkPlan registry.',
    status: 'Active',
    measurement: 'Measured',
    evaluationIds: ['work-plan-registry'],
};

function withTask(overrides: Record<string, unknown>) {
    return {
        schemaVersion: 2,
        workPlans: [{
            id: 'agent-practices',
            title: 'Agent practices',
            description: 'Improve development guidance.',
            topics: [{
                id: 'agent-essentials',
                title: 'Agent Essentials',
                description: 'Maintain the selected guidance.',
                tasks: [{ ...task, ...overrides }],
            }],
        }],
    };
}

const emptyRegistry = { schemaVersion: 2, workPlans: [] };
const registry = withTask({});
const plan = registry.workPlans[0];
const topic = plan.topics[0];

const ledger = {
    schemaVersion: 1,
    metrics: [{
        id: 'outcome-and-quality',
        name: 'Outcome and quality',
        definition: 'Was the requested result achieved?',
        interpretation: 'Observed outcome, not test results alone.',
    }],
    evaluations: [{
        id: 'work-plan-registry',
        title: 'WorkPlan registry',
        beneficiary: 'DevEnv developer',
        intendedOutcome: 'Structured, resumable plans.',
        successCondition: 'Plans validate and render.',
        baseline: 'No structured plan registry.',
        startedAt: null,
        completedAt: null,
        measures: [{ metricId: 'outcome-and-quality', value: null, evidence: null }],
    }],
};

describe('WorkPlan persistence model', () => {
    it('accepts an empty registry and renders an explicit empty state', () => {
        expect(validateWorkPlanRegistry(emptyRegistry)).toEqual(emptyRegistry);
        expect(workPlanRegistryToMarkdown(emptyRegistry)).toContain('No WorkPlans registered.');
    });

    it.each(['Active', 'Paused', 'Blocked', 'Completed'])(
        'accepts a decided measurement for the started WorkTask status %s',
        status => {
            expect(validateWorkPlanRegistry(withTask({ status })).workPlans[0].topics[0].tasks[0])
                .toMatchObject({ status, measurement: 'Measured' });
            expect(validateWorkPlanRegistry(withTask({
                status, measurement: 'NotMeasured', evaluationIds: [],
            })).workPlans[0].topics[0].tasks[0].measurement).toBe('NotMeasured');
        },
    );

    it('allows a Pending WorkTask to leave measurement Undecided until it becomes Active', () => {
        const pending = withTask({ status: 'Pending', measurement: 'Undecided', evaluationIds: [] });
        expect(validateWorkPlanRegistry(pending).workPlans[0].topics[0].tasks[0].measurement)
            .toBe('Undecided');
    });

    it('validates and renders the hierarchy with measurement choices and evaluation links', () => {
        const markdown = workPlanRegistryToMarkdown(validateWorkPlanRegistry(registry));
        expect(markdown).toContain('# Work Plans');
        expect(markdown).toContain('## WorkPlan: Agent practices');
        expect(markdown).toContain('### WorkTopic: Agent Essentials');
        expect(markdown).toContain('#### WorkTask: Persist structured plans');
        expect(markdown).toContain('**Status:** Active');
        expect(markdown).toContain('**Measurement:** Measured');
        expect(markdown).toContain('**Evaluations:** `work-plan-registry`');
        expect(markdown).toContain('Add a validated WorkPlan registry.');
        expect(markdown).toContain('WorkTask statuses: Pending, Active, Paused, Blocked, Completed.');
        expect(markdown).toContain('WorkTask measurement: Undecided, Measured, NotMeasured.');

        const notMeasured = workPlanRegistryToMarkdown(withTask({
            measurement: 'NotMeasured', evaluationIds: [],
        }));
        expect(notMeasured).toContain('**Measurement:** NotMeasured');
        expect(notMeasured).not.toContain('**Evaluations:**');
    });

    it('preserves multi-line descriptions while keeping hierarchy labels single-line', () => {
        const multiline = { ...registry, workPlans: [{ ...plan, description: 'First line.\nSecond line.' }] };
        expect(workPlanRegistryToMarkdown(multiline)).toContain('First line.\nSecond line.');
        expect(() => validateWorkPlanRegistry({
            ...registry,
            workPlans: [{ ...plan, title: 'First line.\nSecond line.' }],
        })).toThrow('Invalid WorkPlanRegistry: expected single-line text');
    });

    it('renders plans without topics and topics without tasks', () => {
        expect(workPlanRegistryToMarkdown({
            schemaVersion: 2,
            workPlans: [{
                ...plan,
                topics: [{ ...topic, tasks: [] }, { ...topic, id: 'empty-topic', tasks: [] }],
            }],
        })).toContain('No WorkTasks registered.');
        expect(workPlanRegistryToMarkdown({ schemaVersion: 2, workPlans: [{ ...plan, topics: [] }] }))
            .toContain('No WorkTopics registered.');
    });

    it.each([
        ['an Active task with an Undecided measurement', withTask({ measurement: 'Undecided', evaluationIds: [] })],
        ['a Measured task without evaluation links', withTask({ evaluationIds: [] })],
        ['a NotMeasured task with evaluation links', withTask({ measurement: 'NotMeasured' })],
        ['an Undecided task with evaluation links', withTask({ status: 'Pending', measurement: 'Undecided' })],
        ['an unknown measurement choice', withTask({ measurement: 'Maybe' })],
        ['non-array evaluation links', withTask({ evaluationIds: 'work-plan-registry' })],
        ['blank evaluation links', withTask({ evaluationIds: [' '] })],
        ['duplicate evaluation links', withTask({ evaluationIds: ['work-plan-registry', 'work-plan-registry'] })],
        ['an unknown task status', withTask({ status: 'In progress' })],
    ])('rejects %s', (_name, value) => {
        expect(() => validateWorkPlanRegistry(value)).toThrow('Invalid WorkPlanRegistry');
    });

    it.each([
        null,
        [],
        12,
        { ...emptyRegistry, schemaVersion: 1 },
        { ...emptyRegistry, extra: true },
        { ...emptyRegistry, workPlans: null },
        { ...emptyRegistry, workPlans: [null] },
        { ...registry, workPlans: [{ ...plan, id: ' ' }] },
        { ...registry, workPlans: [{ ...plan, id: 'multi\nline' }] },
        { ...registry, workPlans: [{ ...plan, title: '' }] },
        { ...registry, workPlans: [{ ...plan, description: 1 }] },
        { ...registry, workPlans: [{ ...plan, topics: null }] },
        { ...registry, workPlans: [{ ...plan, topics: [null] }] },
        { ...registry, workPlans: [{ ...plan, topics: [{ ...topic, tasks: [null] }] }] },
        { ...registry, workPlans: [{ ...plan, topics: [{ ...topic, tasks: [{ ...task, extra: 1 }] }] }] },
        { ...registry, workPlans: [plan, { ...plan, id: topic.id }] },
    ])('rejects invalid registry values', value => {
        expect(() => validateWorkPlanRegistry(value)).toThrow('Invalid WorkPlanRegistry');
    });

    it('accepts evaluation links present in the evaluation ledger and rejects missing ones', () => {
        expect(() => validateWorkPlanEvaluationLinks(registry, ledger)).not.toThrow();
        expect(() => validateWorkPlanEvaluationLinks(
            withTask({ evaluationIds: ['missing-evaluation'] }),
            ledger,
        )).toThrow('Invalid WorkPlanRegistry: unknown evaluation "missing-evaluation"');
    });

});
