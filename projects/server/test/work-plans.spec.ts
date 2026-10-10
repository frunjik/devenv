import { describe, expect, it } from '@jest/globals';
import type { WorkPlanRegistry } from '@shared';
import { writeWorkPlanMarkdown } from '../../../scripts/work-plans-export';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';

describe('WorkPlan Markdown export', () => {
    it('writes a generated view only after validating the registry and its ledger links', () => {
        const registry: WorkPlanRegistry = {
            schemaVersion: 2,
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
                        measurement: 'Measured',
                        evaluationIds: ['work-plan-registry'],
                    }],
                }],
            }],
        };
        const filesystem = createMemoryTextFileSystem({
            'work-plans.json': JSON.stringify(registry),
            'evaluations.json': JSON.stringify({
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
            }),
        });
        writeWorkPlanMarkdown('work-plans.json', 'evaluations.json', 'work-plans.md', filesystem);
        const view = filesystem.readFileSync('work-plans.md', 'utf8');
        expect(view).toContain('Generated from [work-plans.json]');

        const task = registry.workPlans[0].topics[0].tasks[0];
        task.evaluationIds = ['missing-evaluation'];
        filesystem.writeFileSync('work-plans.json', JSON.stringify(registry), 'utf8');
        expect(() => writeWorkPlanMarkdown('work-plans.json', 'evaluations.json', 'work-plans.md', filesystem))
            .toThrow('unknown evaluation "missing-evaluation"');

        filesystem.writeFileSync('work-plans.json', JSON.stringify({ schemaVersion: 1, workPlans: [] }), 'utf8');
        expect(() => writeWorkPlanMarkdown('work-plans.json', 'evaluations.json', 'work-plans.md', filesystem))
            .toThrow('Invalid WorkPlanRegistry');
        expect(filesystem.readFileSync('work-plans.md', 'utf8')).toBe(view);
    });
});
