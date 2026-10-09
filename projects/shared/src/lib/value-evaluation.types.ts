export interface EvaluationMetric {
    id: string;
    name: string;
    definition: string;
    interpretation: string;
}

export interface WorkEvaluationMeasure {
    metricId: string;
    value: string | null;
    evidence: string | null;
}

export interface WorkEvaluation {
    id: string;
    title: string;
    beneficiary: string;
    intendedOutcome: string;
    successCondition: string;
    baseline: string;
    startedAt: string | null;
    completedAt: string | null;
    measures: WorkEvaluationMeasure[];
}

export interface WorkEvaluationDataset {
    schemaVersion: 1;
    metrics: EvaluationMetric[];
    evaluations: WorkEvaluation[];
}

function requireRecord(value: unknown): Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid WorkEvaluationDataset: expected a record');
    }
    return value as Record<string, unknown>;
}

function requireFields(value: Record<string, unknown>, fields: string[]): void {
    if (Object.keys(value).sort().join(',') !== [...fields].sort().join(',')) {
        throw new Error('Invalid WorkEvaluationDataset: missing or unsupported fields');
    }
}

function requireText(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error('Invalid WorkEvaluationDataset: expected non-empty text');
    }
    return value;
}

function requireNullableText(value: unknown): string | null {
    return value === null ? null : requireText(value);
}

function validateMetrics(value: unknown[]): EvaluationMetric[] {
    const ids = new Set<string>();
    return value.map(item => {
        const metric = requireRecord(item);
        requireFields(metric, ['id', 'name', 'definition', 'interpretation']);
        const id = requireText(metric['id']);
        if (ids.has(id)) {
            throw new Error('Invalid WorkEvaluationDataset: metric IDs must be unique');
        }
        ids.add(id);
        return {
            id,
            name: requireText(metric['name']),
            definition: requireText(metric['definition']),
            interpretation: requireText(metric['interpretation']),
        };
    });
}

function validateEvaluationMeasure(value: unknown, metricIds: Set<string>): WorkEvaluationMeasure {
    const measure = requireRecord(value);
    requireFields(measure, ['metricId', 'value', 'evidence']);
    const metricId = requireText(measure['metricId']);
    if (!metricIds.has(metricId)) {
        throw new Error(`Invalid WorkEvaluationDataset: unknown metric "${metricId}"`);
    }
    return {
        metricId,
        value: requireNullableText(measure['value']),
        evidence: requireNullableText(measure['evidence']),
    };
}

function validateWorkEvaluation(value: unknown, metricIds: Set<string>): WorkEvaluation {
    const evaluation = requireRecord(value);
    requireFields(evaluation, [
        'id', 'title', 'beneficiary', 'intendedOutcome', 'successCondition',
        'baseline', 'startedAt', 'completedAt', 'measures',
    ]);
    if (!Array.isArray(evaluation['measures'])) {
        throw new Error('Invalid WorkEvaluationDataset: expected a measure array');
    }
    const evaluationIds = new Set<string>();
    const measures = evaluation['measures'].map((measure: unknown) =>
        validateEvaluationMeasure(measure, metricIds));
    for (const measure of measures) {
        if (evaluationIds.has(measure.metricId)) {
            throw new Error('Invalid WorkEvaluationDataset: metric measures must be unique per evaluation');
        }
        evaluationIds.add(measure.metricId);
    }
    if (evaluationIds.size !== metricIds.size || [...metricIds].some(id => !evaluationIds.has(id))) {
        throw new Error('Invalid WorkEvaluationDataset: every evaluation must record every metric');
    }
    return {
        id: requireText(evaluation['id']),
        title: requireText(evaluation['title']),
        beneficiary: requireText(evaluation['beneficiary']),
        intendedOutcome: requireText(evaluation['intendedOutcome']),
        successCondition: requireText(evaluation['successCondition']),
        baseline: requireText(evaluation['baseline']),
        startedAt: requireNullableText(evaluation['startedAt']),
        completedAt: requireNullableText(evaluation['completedAt']),
        measures,
    };
}

function validateEvaluations(value: unknown[], metricIds: Set<string>): WorkEvaluation[] {
    const ids = new Set<string>();
    return value.map(item => {
        const evaluation = validateWorkEvaluation(item, metricIds);
        if (ids.has(evaluation.id)) {
            throw new Error('Invalid WorkEvaluationDataset: work evaluation IDs must be unique');
        }
        ids.add(evaluation.id);
        return evaluation;
    });
}

export function validateWorkEvaluationDataset(value: unknown): WorkEvaluationDataset {
    const dataset = requireRecord(value);
    requireFields(dataset, ['schemaVersion', 'metrics', 'evaluations']);
    if (dataset['schemaVersion'] !== 1
        || !Array.isArray(dataset['metrics'])
        || !dataset['metrics'].length
        || !Array.isArray(dataset['evaluations'])) {
        throw new Error('Invalid WorkEvaluationDataset: expected version 1 and metric/evaluation arrays');
    }
    const metrics = validateMetrics(dataset['metrics']);
    if (!dataset['evaluations'].length) {
        throw new Error('Invalid WorkEvaluationDataset: expected at least one work evaluation');
    }
    const metricIds = new Set(metrics.map(metric => metric.id));
    const evaluations = validateEvaluations(dataset['evaluations'], metricIds);
    return { schemaVersion: 1, metrics, evaluations };
}
