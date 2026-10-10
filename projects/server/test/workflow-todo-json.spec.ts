import { describe, expect, it } from '@jest/globals';
import { validateWorkflowTodoList, workflowTodoListToMarkdown } from '@shared';
import { writeWorkflowTodoMarkdown } from '../../../scripts/workflow-todo-export';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';

const workflowTodo = {
    schemaVersion: 2,
    title: 'Workflow TODO List',
    introduction: 'Repository-wide navigation for resumable work.',
    activeWorkflow: 'Diagram Editor',
    workflows: [{
        name: 'Diagram Editor',
        evaluationIds: [],
        primaryWorkPurpose: 'Product work',
        status: 'Active',
        resumeLabel: 'Checkpoint',
        resumePath: './diagram-editor-workflow.md#checkpoint',
        relatedConcern: 'Not assigned',
    }],
    registrationNote: 'Only registered workflows are tracked.',
    workPurposeGuidance: {
        principle: 'Classify by primary intended outcome.',
        purposes: [{
            label: 'Product work',
            description: 'Adds or changes a user capability.',
            example: 'Diagram Editor',
        }, {
            label: 'Meta work',
            description: 'Develops or evaluates DevEnv or its practices.',
            example: 'Workflow TODO View',
        }],
        mixedEffects: 'Record the dominant agreed outcome.',
        distinction: 'Purpose is not lifecycle status.',
    },
    switchingGuidance: [
        'Save decisions, open questions, and next step.',
        'Select one workflow or none.',
    ],
    statusGuidance: 'Use Pending, Active, Paused, Blocked, or Completed.',
};

describe('Workflow TODO JSON authority', () => {
    it('validates workflow data and renders the complete readable view', () => {
        const validated = validateWorkflowTodoList(workflowTodo);
        expect(validated.workflows[0].evaluationIds).toEqual([]);
        const filesystem = createMemoryTextFileSystem({ 'workflow-todo-list.json': JSON.stringify(validated) });

        writeWorkflowTodoMarkdown('workflow-todo-list.json', 'workflow-todo-list.md', filesystem);

        const markdown = filesystem.readFileSync('workflow-todo-list.md', 'utf8');
        expect(markdown).toContain('Generated from [workflow-todo-list.json]');
        expect(markdown).toContain('**Active workflow:** Diagram Editor.');
        expect(markdown).toContain('| Diagram Editor | Product work | Active | [Checkpoint](./diagram-editor-workflow.md#checkpoint) | Not assigned |');
        expect(markdown).toContain('## Classifying Work Purpose');
        expect(markdown).toContain('## Maintaining and Switching');
        expect(markdown).toContain('Only registered workflows are tracked.');
    });

    it('rejects invalid authority data without writing a Markdown view', () => {
        const filesystem = createMemoryTextFileSystem({
            'workflow-todo-list.json': JSON.stringify({
                ...workflowTodo,
                activeWorkflow: 'Missing workflow',
            }),
        });

        expect(() => writeWorkflowTodoMarkdown(
            'workflow-todo-list.json',
            'workflow-todo-list.md',
            filesystem,
        )).toThrow('Invalid WorkflowTodoList');
        expect(filesystem.files.has('workflow-todo-list.md')).toBe(false);
    });

    it('rejects unknown primary work-purpose labels', () => {
        expect(() => validateWorkflowTodoList({
            ...workflowTodo,
            workflows: workflowTodo.workflows.map(workflow => ({
                ...workflow,
                primaryWorkPurpose: 'Other',
            })),
        })).toThrow('Invalid WorkflowTodoList');
    });

    it.each([
        null,
        [],
        { ...workflowTodo, schemaVersion: 1 },
        { ...workflowTodo, workflows: [] },
        { ...workflowTodo, workflows: undefined },
        { ...workflowTodo, workflows: [{ ...workflowTodo.workflows[0], evaluationIds: null }] },
        { ...workflowTodo, workflows: [{ ...workflowTodo.workflows[0], evaluationIds: [' '] }] },
        {
            ...workflowTodo,
            workflows: [{
                ...workflowTodo.workflows[0],
                evaluationIds: ['diagram-evaluation', 'diagram-evaluation'],
            }],
        },
        { ...workflowTodo, switchingGuidance: [] },
        { ...workflowTodo, switchingGuidance: [null] },
        { ...workflowTodo, activeWorkflow: null },
        { ...workflowTodo, activeWorkflow: 'Other workflow' },
        {
            ...workflowTodo,
            workflows: [
                ...workflowTodo.workflows,
                { ...workflowTodo.workflows[0], status: 'Paused' },
            ],
        },
        {
            ...workflowTodo,
            workflows: [
                workflowTodo.workflows[0],
                { ...workflowTodo.workflows[0], name: 'Another active workflow' },
            ],
        },
        {
            ...workflowTodo,
            workflows: workflowTodo.workflows.map(workflow => ({ ...workflow, name: ' ' })),
        },
        {
            ...workflowTodo,
            workflows: workflowTodo.workflows.map(workflow => ({ ...workflow, resumePath: '../secrets.md' })),
        },
        { ...workflowTodo, workPurposeGuidance: { ...workflowTodo.workPurposeGuidance, purposes: [] } },
        {
            ...workflowTodo,
            workPurposeGuidance: {
                ...workflowTodo.workPurposeGuidance,
                purposes: [
                    workflowTodo.workPurposeGuidance.purposes[0],
                    workflowTodo.workPurposeGuidance.purposes[0],
                ],
            },
        },
        {
            ...workflowTodo,
            workPurposeGuidance: {
                ...workflowTodo.workPurposeGuidance,
                purposes: [null, workflowTodo.workPurposeGuidance.purposes[1]],
            },
        },
        { ...workflowTodo, title: null },
    ])('rejects invalid WorkflowTodoList values', value => {
        expect(() => validateWorkflowTodoList(value)).toThrow('Invalid WorkflowTodoList');
    });

    it('accepts no selected workflow when no workflow is active', () => {
        const validated = validateWorkflowTodoList({
            ...workflowTodo,
            activeWorkflow: null,
            workflows: workflowTodo.workflows.map(workflow => ({ ...workflow, status: 'Paused' })),
        });
        expect(validated.activeWorkflow).toBeNull();
        expect(workflowTodoListToMarkdown(validated)).toContain('**Active workflow:** None.');
    });

    it('escapes Markdown table cells and validates the generator input before writing', () => {
        expect(() => validateWorkflowTodoList({
            ...workflowTodo,
            title: ' ',
        })).toThrow('Invalid WorkflowTodoList: expected non-empty text');

        const filesystem = createMemoryTextFileSystem({
            'workflow-todo-list.json': JSON.stringify({
                ...workflowTodo,
                activeWorkflow: 'Diagram | Editor\nPreview',
                workflows: workflowTodo.workflows.map(workflow => ({
                    ...workflow,
                    name: 'Diagram | Editor\nPreview',
                })),
            }),
        });
        writeWorkflowTodoMarkdown('workflow-todo-list.json', 'workflow-todo-list.md', filesystem);
        expect(filesystem.readFileSync('workflow-todo-list.md', 'utf8')).toContain(
            '| Diagram \\| Editor Preview | Product work | Active |',
        );
    });
});
