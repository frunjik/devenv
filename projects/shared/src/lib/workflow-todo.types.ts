export type WorkflowWorkPurpose = 'Product work' | 'Meta work';

export interface WorkflowTodoList {
    schemaVersion: 1;
    title: string;
    introduction: string;
    activeWorkflow: string | null;
    workflows: {
        name: string;
        primaryWorkPurpose: WorkflowWorkPurpose;
        status: string;
        resumeLabel: string;
        resumePath: string;
        relatedConcern: string;
    }[];
    registrationNote: string;
    workPurposeGuidance: {
        principle: string;
        purposes: {
            label: WorkflowWorkPurpose;
            description: string;
            example: string;
        }[];
        mixedEffects: string;
        distinction: string;
    };
    switchingGuidance: string[];
    statusGuidance: string;
}

function requireRecord(value: unknown): Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid WorkflowTodoList: expected a record');
    }
    return value as Record<string, unknown>;
}

function requireFields(value: Record<string, unknown>, fields: string[]): void {
    if (Object.keys(value).sort().join(',') !== [...fields].sort().join(',')) {
        throw new Error('Invalid WorkflowTodoList: missing or unsupported fields');
    }
}

function requireText(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error('Invalid WorkflowTodoList: expected non-empty text');
    }
    return value;
}

function validatePurpose(value: unknown): WorkflowWorkPurpose {
    if (value !== 'Product work' && value !== 'Meta work') {
        throw new Error('Invalid WorkflowTodoList: unknown primary work purpose');
    }
    return value;
}

function validateWorkflow(value: unknown): WorkflowTodoList['workflows'][number] {
    const workflow = requireRecord(value);
    requireFields(workflow, [
        'name', 'primaryWorkPurpose', 'status', 'resumeLabel', 'resumePath', 'relatedConcern',
    ]);
    const resumePath = requireText(workflow['resumePath']);
    if (!/^(?:\.\/|\.\.\/practices\/)[a-z0-9-]+(?:\.generated)?\.md#[a-z0-9-]+$/.test(resumePath)) {
        throw new Error('Invalid WorkflowTodoList: resume references must be local Markdown checkpoints');
    }
    return {
        name: requireText(workflow['name']),
        primaryWorkPurpose: validatePurpose(workflow['primaryWorkPurpose']),
        status: requireText(workflow['status']),
        resumeLabel: requireText(workflow['resumeLabel']),
        resumePath,
        relatedConcern: requireText(workflow['relatedConcern']),
    };
}

function validatePurposeGuidance(value: unknown): WorkflowTodoList['workPurposeGuidance'] {
    const guidance = requireRecord(value);
    requireFields(guidance, ['principle', 'purposes', 'mixedEffects', 'distinction']);
    if (!Array.isArray(guidance['purposes']) || guidance['purposes'].length !== 2) {
        throw new Error('Invalid WorkflowTodoList: expected two purpose definitions');
    }
    const purposes = guidance['purposes'].map(item => {
        const purpose = requireRecord(item);
        requireFields(purpose, ['label', 'description', 'example']);
        return {
            label: validatePurpose(purpose['label']),
            description: requireText(purpose['description']),
            example: requireText(purpose['example']),
        };
    });
    if (new Set(purposes.map(purpose => purpose.label)).size !== 2) {
        throw new Error('Invalid WorkflowTodoList: purpose definitions must be unique');
    }
    return {
        principle: requireText(guidance['principle']),
        purposes,
        mixedEffects: requireText(guidance['mixedEffects']),
        distinction: requireText(guidance['distinction']),
    };
}

export function validateWorkflowTodoList(value: unknown): WorkflowTodoList {
    const source = requireRecord(value);
    requireFields(source, [
        'schemaVersion', 'title', 'introduction', 'activeWorkflow', 'workflows', 'registrationNote',
        'workPurposeGuidance', 'switchingGuidance', 'statusGuidance',
    ]);
    const workflowValues = source['workflows'];
    const switchingGuidance = source['switchingGuidance'];
    if (source['schemaVersion'] !== 1 || !Array.isArray(workflowValues) || !workflowValues.length
        || !Array.isArray(switchingGuidance) || !switchingGuidance.length) {
        throw new Error('Invalid WorkflowTodoList: expected version 1 and non-empty workflow/guidance arrays');
    }
    if (!switchingGuidance.every(item => typeof item === 'string' && item.trim())) {
        throw new Error('Invalid WorkflowTodoList: switching guidance must contain non-empty text');
    }
    const workflows = workflowValues.map(validateWorkflow);
    const names = new Set(workflows.map(workflow => workflow.name));
    if (names.size !== workflows.length) {
        throw new Error('Invalid WorkflowTodoList: workflow names must be unique');
    }
    const activeWorkflows = workflows.filter(workflow => workflow.status === 'Active');
    const activeWorkflow = source['activeWorkflow'] === null
        ? null
        : requireText(source['activeWorkflow']);
    if ((activeWorkflow === null && activeWorkflows.length > 0)
        || (activeWorkflow !== null
            && (activeWorkflows.length !== 1 || activeWorkflows[0].name !== activeWorkflow))) {
        throw new Error('Invalid WorkflowTodoList: active workflow selection must match workflow status');
    }
    return {
        schemaVersion: 1,
        title: requireText(source['title']),
        introduction: requireText(source['introduction']),
        activeWorkflow,
        workflows,
        registrationNote: requireText(source['registrationNote']),
        workPurposeGuidance: validatePurposeGuidance(source['workPurposeGuidance']),
        switchingGuidance,
        statusGuidance: requireText(source['statusGuidance']),
    };
}

function escapeTableCell(value: string): string {
    return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function workflowTodoListToMarkdown(value: unknown): string {
    const list = validateWorkflowTodoList(value);
    const lines = [
        `# ${list.title}`,
        '',
        `Generated from [workflow-todo-list.json](./workflow-todo-list.json). Edit the JSON source, not this view.`,
        '',
        list.introduction,
        '',
        `**Active workflow:** ${list.activeWorkflow ?? 'None'}.`,
        '',
        '## Workflows',
        '',
        '| Workflow | Primary work purpose | Status | Resume reference | Related concern |',
        '| --- | --- | --- | --- | --- |',
        ...list.workflows.map(workflow =>
            `| ${escapeTableCell(workflow.name)} | ${workflow.primaryWorkPurpose} | ${escapeTableCell(workflow.status)} | [${escapeTableCell(workflow.resumeLabel)}](${workflow.resumePath}) | ${escapeTableCell(workflow.relatedConcern)} |`),
        '',
        `**Registration:** ${list.registrationNote}`,
        '',
        '## Classifying Work Purpose',
        '',
        list.workPurposeGuidance.principle,
        '',
        ...list.workPurposeGuidance.purposes.map(purpose =>
            `- **${purpose.label}** ${purpose.description} Example: ${purpose.example}.`),
        '',
        list.workPurposeGuidance.mixedEffects,
        '',
        list.workPurposeGuidance.distinction,
        '',
        '## Maintaining and Switching',
        '',
        ...list.switchingGuidance.map((step, index) => `${index + 1}. ${step}`),
        '',
        list.statusGuidance,
        '',
    ];
    return lines.join('\n');
}
