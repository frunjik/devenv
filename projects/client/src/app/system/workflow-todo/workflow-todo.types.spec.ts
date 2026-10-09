import { describe, expect, it } from '@jest/globals';
import { validateWorkflowTodoList, workflowTodoListToMarkdown } from '@shared';
import type { WorkflowTodoList } from '@shared';

const workflow = {
    name: 'Canvas', evaluationIds: ['canvas-review'], primaryWorkPurpose: 'Product work',
    status: 'Active', resumeLabel: 'Checkpoint', resumePath: './canvas.md#checkpoint',
    relatedConcern: 'Not assigned',
};
const source = {
    schemaVersion: 2, title: 'Workflows', introduction: 'Resumable work', activeWorkflow: 'Canvas',
    workflows: [workflow], registrationNote: 'Explicit registration',
    workPurposeGuidance: {
        principle: 'Classify by outcome',
        purposes: [
            { label: 'Product work', description: 'User capability', example: 'Canvas' },
            { label: 'Meta work', description: 'Development practice', example: 'Coverage repair' },
        ],
        mixedEffects: 'Dominant outcome', distinction: 'Not lifecycle',
    },
    switchingGuidance: ['Save checkpoint'], statusGuidance: 'Select one workflow',
};

describe('WorkflowTodoList client contract', () => {
    it('validates and renders active and unselected workflows with safe table cells', () => {
        const validated = validateWorkflowTodoList(source);
        expect(validated.workflows[0].evaluationIds).toEqual(['canvas-review']);
        expect(workflowTodoListToMarkdown(validated)).toContain('**Active workflow:** Canvas.');
        const unselected: WorkflowTodoList = {
            ...validated, activeWorkflow: null,
            workflows: [{
                ...validated.workflows[0], name: 'Canvas | preview\r\nSecond line',
                status: 'Paused', resumePath: '../practices/canvas.generated.md#checkpoint',
            }],
        };
        const markdown = workflowTodoListToMarkdown(unselected);
        expect(markdown).toContain('**Active workflow:** None.');
        expect(markdown).toContain('Canvas \\| preview Second line');
        expect(markdown).toContain('1. Save checkpoint');
        expect(markdown).toContain('**Meta work** Development practice Example: Coverage repair.');
    });

    it.each([
        null, [], 42,
        { ...source, extra: true },
        { ...source, title: null },
        { ...source, title: ' ' },
        { ...source, schemaVersion: 1 },
        { ...source, workflows: null },
        { ...source, workflows: [] },
        { ...source, switchingGuidance: null },
        { ...source, switchingGuidance: [] },
        { ...source, switchingGuidance: [null] },
        { ...source, switchingGuidance: [' '] },
        { ...source, workflows: [null] },
        { ...source, workflows: [{ ...workflow, evaluationIds: null }] },
        { ...source, workflows: [{ ...workflow, evaluationIds: [' '] }] },
        { ...source, workflows: [{ ...workflow, evaluationIds: ['same', 'same'] }] },
        { ...source, workflows: [{ ...workflow, primaryWorkPurpose: 'Unknown' }] },
        { ...source, workflows: [{ ...workflow, resumePath: 'https://example.com' }] },
        { ...source, workflows: [workflow, workflow] },
        { ...source, activeWorkflow: null },
        { ...source, activeWorkflow: 'Missing' },
        { ...source, workflows: [{ ...workflow, status: 'Paused' }] },
        { ...source, workflows: [workflow, { ...workflow, name: 'Other' }] },
        { ...source, activeWorkflow: 'Other', workflows: [{ ...workflow, status: 'Paused' }] },
        { ...source, workPurposeGuidance: null },
        { ...source, workPurposeGuidance: { ...source.workPurposeGuidance, purposes: null } },
        { ...source, workPurposeGuidance: { ...source.workPurposeGuidance, purposes: [] } },
        { ...source, workPurposeGuidance: { ...source.workPurposeGuidance, purposes: [null, null] } },
        { ...source, workPurposeGuidance: {
            ...source.workPurposeGuidance,
            purposes: [source.workPurposeGuidance.purposes[0], source.workPurposeGuidance.purposes[0]],
        } },
    ])('rejects invalid authority without a success-shaped result (%#)', value => {
        expect(() => validateWorkflowTodoList(value)).toThrow('Invalid WorkflowTodoList');
        expect(() => workflowTodoListToMarkdown(value)).toThrow('Invalid WorkflowTodoList');
    });
});
