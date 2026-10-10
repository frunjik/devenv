import { validateWorkEvaluationDataset } from './value-evaluation.types';

export type WorkTaskStatus = 'Pending' | 'Active' | 'Paused' | 'Blocked' | 'Completed';

export type WorkTaskMeasurement = 'Undecided' | 'Measured' | 'NotMeasured';

export interface WorkTask {
    id: string;
    title: string;
    description: string;
    status: WorkTaskStatus;
    measurement: WorkTaskMeasurement;
    evaluationIds: string[];
}

export interface WorkTopic {
    id: string;
    title: string;
    description: string;
    tasks: WorkTask[];
}

export interface WorkPlan {
    id: string;
    title: string;
    description: string;
    topics: WorkTopic[];
}

export interface WorkPlanRegistry {
    schemaVersion: 2;
    workPlans: WorkPlan[];
}

function requireRecord(value: unknown): Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid WorkPlanRegistry: expected a record');
    }
    return value as Record<string, unknown>;
}

function requireFields(value: Record<string, unknown>, fields: string[]): void {
    if (Object.keys(value).sort().join(',') !== [...fields].sort().join(',')) {
        throw new Error('Invalid WorkPlanRegistry: missing or unsupported fields');
    }
}

function requireText(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error('Invalid WorkPlanRegistry: expected non-empty text');
    }
    return value;
}

function requireSingleLineText(value: unknown): string {
    const text = requireText(value);
    if (/[\r\n]/.test(text)) {
        throw new Error('Invalid WorkPlanRegistry: expected single-line text');
    }
    return text;
}

function validateStatus(value: unknown): WorkTaskStatus {
    if (value !== 'Pending' && value !== 'Active' && value !== 'Paused'
        && value !== 'Blocked' && value !== 'Completed') {
        throw new Error('Invalid WorkPlanRegistry: unknown WorkTask status');
    }
    return value;
}

function requireArray(value: unknown, name: string): unknown[] {
    if (!Array.isArray(value)) {
        throw new Error(`Invalid WorkPlanRegistry: ${name} must be an array`);
    }
    return value;
}

function validateMeasurement(value: unknown): WorkTaskMeasurement {
    if (value !== 'Undecided' && value !== 'Measured' && value !== 'NotMeasured') {
        throw new Error('Invalid WorkPlanRegistry: unknown WorkTask measurement');
    }
    return value;
}

function validateEvaluationIds(value: unknown): string[] {
    const ids = requireArray(value, 'WorkTask evaluationIds').map(requireSingleLineText);
    if (new Set(ids).size !== ids.length) {
        throw new Error('Invalid WorkPlanRegistry: evaluation IDs must be unique per WorkTask');
    }
    return ids;
}

function validateTask(value: unknown): WorkTask {
    const task = requireRecord(value);
    requireFields(task, ['id', 'title', 'description', 'status', 'measurement', 'evaluationIds']);
    const status = validateStatus(task['status']);
    const measurement = validateMeasurement(task['measurement']);
    const evaluationIds = validateEvaluationIds(task['evaluationIds']);
    if (status !== 'Pending' && measurement === 'Undecided') {
        throw new Error('Invalid WorkPlanRegistry: started WorkTasks need a measurement decision');
    }
    if ((measurement === 'Measured') !== (evaluationIds.length > 0)) {
        throw new Error('Invalid WorkPlanRegistry: only Measured WorkTasks link evaluations, and they need at least one');
    }
    return {
        id: requireSingleLineText(task['id']),
        title: requireSingleLineText(task['title']),
        description: requireText(task['description']),
        status,
        measurement,
        evaluationIds,
    };
}

function validateTopic(value: unknown): WorkTopic {
    const topic = requireRecord(value);
    requireFields(topic, ['id', 'title', 'description', 'tasks']);
    return {
        id: requireSingleLineText(topic['id']),
        title: requireSingleLineText(topic['title']),
        description: requireText(topic['description']),
        tasks: requireArray(topic['tasks'], 'WorkTopic tasks').map(validateTask),
    };
}

function validatePlan(value: unknown): WorkPlan {
    const plan = requireRecord(value);
    requireFields(plan, ['id', 'title', 'description', 'topics']);
    return {
        id: requireSingleLineText(plan['id']),
        title: requireSingleLineText(plan['title']),
        description: requireText(plan['description']),
        topics: requireArray(plan['topics'], 'WorkPlan topics').map(validateTopic),
    };
}

export function validateWorkPlanRegistry(value: unknown): WorkPlanRegistry {
    const registry = requireRecord(value);
    requireFields(registry, ['schemaVersion', 'workPlans']);
    if (registry['schemaVersion'] !== 2) {
        throw new Error('Invalid WorkPlanRegistry: expected schema version 2');
    }
    const workPlans = requireArray(registry['workPlans'], 'workPlans').map(validatePlan);
    const ids = workPlans.flatMap(plan => [
        plan.id,
        ...plan.topics.flatMap(topic => [topic.id, ...topic.tasks.map(task => task.id)]),
    ]);
    if (new Set(ids).size !== ids.length) {
        throw new Error('Invalid WorkPlanRegistry: IDs must be unique across the hierarchy');
    }
    return { schemaVersion: 2, workPlans };
}

export function validateWorkPlanEvaluationLinks(registryValue: unknown, ledgerValue: unknown): void {
    const registry = validateWorkPlanRegistry(registryValue);
    const known = new Set(validateWorkEvaluationDataset(ledgerValue).evaluations.map(e => e.id));
    for (const plan of registry.workPlans) {
        for (const topic of plan.topics) {
            for (const task of topic.tasks) {
                const missing = task.evaluationIds.find(id => !known.has(id));
                if (missing !== undefined) {
                    throw new Error(`Invalid WorkPlanRegistry: unknown evaluation "${missing}"`);
                }
            }
        }
    }
}

export function workPlanRegistryToMarkdown(value: unknown): string {
    const registry = validateWorkPlanRegistry(value);
    const lines = [
        '# Work Plans',
        '',
        'Generated from [work-plans.json](./work-plans.json). Edit the JSON source, not this view.',
        '',
        'Hierarchy: WorkPlan > WorkTopic > WorkTask. IDs are unique across the registry.',
        'WorkTask statuses: Pending, Active, Paused, Blocked, Completed.',
        'WorkTask measurement: Undecided, Measured, NotMeasured. Decide before a task leaves Pending; Measured tasks link evaluation ledger IDs.',
        '',
    ];
    if (!registry.workPlans.length) {
        lines.push('No WorkPlans registered.', '');
        return lines.join('\n');
    }
    for (const plan of registry.workPlans) {
        lines.push(`## WorkPlan: ${plan.title}`, '', plan.description, '');
        if (!plan.topics.length) {
            lines.push('No WorkTopics registered.', '');
            continue;
        }
        for (const topic of plan.topics) {
            lines.push(`### WorkTopic: ${topic.title}`, '', topic.description, '');
            if (!topic.tasks.length) {
                lines.push('No WorkTasks registered.', '');
                continue;
            }
            for (const task of topic.tasks) {
                lines.push(
                    `#### WorkTask: ${task.title}`,
                    '',
                    `**Status:** ${task.status}`,
                    '',
                    `**Measurement:** ${task.measurement}`,
                    '',
                );
                if (task.evaluationIds.length) {
                    lines.push(`**Evaluations:** ${task.evaluationIds.map(id => `\`${id}\``).join(', ')}`, '');
                }
                lines.push(task.description, '');
            }
        }
    }
    return lines.join('\n');
}
