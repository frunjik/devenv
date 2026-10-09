import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { validateWorkEvaluationDataset } from '@shared';
import type { WorkEvaluationDataset } from '@shared';

function createDataset(): WorkEvaluationDataset {
    return {
        schemaVersion: 1,
        metrics: [{
            id: 'delivery',
            name: 'Delivery',
            definition: 'Measure elapsed delivery time.',
            interpretation: 'Elapsed time is not active effort.',
        }],
        evaluations: [{
            id: 'work-one',
            title: 'Evaluate one work item',
            beneficiary: 'Developer',
            intendedOutcome: 'Understand progress',
            successCondition: 'Record a result',
            baseline: 'Unknown',
            startedAt: '2026-10-09T13:00:00+02:00',
            completedAt: null,
            measures: [{
                metricId: 'delivery',
                value: null,
                evidence: null,
            }],
        }],
    };
}

describe('validateWorkEvaluationDataset', () => {
    it('validates a dataset and preserves explicit unknowns', () => {
        const dataset = createDataset();

        expect(validateWorkEvaluationDataset(dataset)).toEqual(dataset);
    });

    it('validates the authoritative value-evaluation JSON file', () => {
        const source = readFileSync('knowledge/workflows/devenv-value-evaluation.json', 'utf8');
        const dataset: unknown = JSON.parse(source);

        expect(validateWorkEvaluationDataset(dataset).evaluations).toHaveLength(4);
    });

    it('accepts an evaluation with an unknown start and a known completion', () => {
        const dataset = createDataset();
        dataset.evaluations[0].startedAt = null;
        dataset.evaluations[0].completedAt = '2026-10-09T13:15:00+02:00';

        expect(validateWorkEvaluationDataset(dataset)).toEqual(dataset);
    });

    it.each([
        { label: 'null', value: null },
        { label: 'an array', value: [] },
        { label: 'a primitive', value: 'dataset' },
    ])('rejects a root that is $label', ({ value }) => {
        expect(() => validateWorkEvaluationDataset(value)).toThrow('expected a record');
    });

    it.each([
        { label: 'missing fields', change: (dataset: ReturnType<typeof createDataset>) => { delete (dataset as { schemaVersion?: number }).schemaVersion; } },
        { label: 'extra fields', change: (dataset: ReturnType<typeof createDataset>) => Object.assign(dataset, { extra: true }) },
        { label: 'an unsupported schema version', change: (dataset: ReturnType<typeof createDataset>) => { Object.assign(dataset, { schemaVersion: 2 }); } },
        { label: 'a non-array metric collection', change: (dataset: ReturnType<typeof createDataset>) => { dataset.metrics = null as unknown as typeof dataset.metrics; } },
        { label: 'an empty metric collection', change: (dataset: ReturnType<typeof createDataset>) => { dataset.metrics = []; } },
        { label: 'a non-array evaluation collection', change: (dataset: ReturnType<typeof createDataset>) => { dataset.evaluations = null as unknown as typeof dataset.evaluations; } },
        { label: 'an empty evaluation collection', change: (dataset: ReturnType<typeof createDataset>) => { dataset.evaluations = []; } },
    ])('rejects a dataset with $label', ({ change }) => {
        const dataset = createDataset();
        change(dataset);

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('Invalid WorkEvaluationDataset');
    });

    it.each([
        { label: 'null', value: null },
        { label: 'an array', value: [] },
        { label: 'a primitive', value: 'metric' },
    ])('rejects a metric that is $label', ({ value }) => {
        const dataset = createDataset();
        dataset.metrics = [value] as unknown as typeof dataset.metrics;

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('Invalid WorkEvaluationDataset');
    });

    it.each(['id', 'name', 'definition', 'interpretation'])('rejects an empty metric %s', field => {
        const dataset = createDataset();
        Object.assign(dataset.metrics[0], { [field]: '  ' });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('expected non-empty text');
    });

    it('rejects a metric with an unsupported field', () => {
        const dataset = createDataset();
        Object.assign(dataset.metrics[0], { extra: true });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('missing or unsupported fields');
    });

    it('rejects duplicate metric IDs', () => {
        const dataset = createDataset();
        dataset.metrics.push({ ...dataset.metrics[0] });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('metric IDs must be unique');
    });

    it.each([
        { label: 'null', value: null },
        { label: 'an array', value: [] },
        { label: 'a primitive', value: 'evaluation' },
    ])('rejects an evaluation that is $label', ({ value }) => {
        const dataset = createDataset();
        dataset.evaluations = [value] as unknown as typeof dataset.evaluations;

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('Invalid WorkEvaluationDataset');
    });

    it('rejects an evaluation with an unsupported field', () => {
        const dataset = createDataset();
        Object.assign(dataset.evaluations[0], { extra: true });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('missing or unsupported fields');
    });

    it.each([
        { label: 'a non-array measure collection', change: (evaluation: ReturnType<typeof createDataset>['evaluations'][0]) => { evaluation.measures = null as unknown as typeof evaluation.measures; } },
        { label: 'a missing measure', change: (evaluation: ReturnType<typeof createDataset>['evaluations'][0]) => { evaluation.measures = []; } },
    ])('rejects an evaluation with $label', ({ change }) => {
        const dataset = createDataset();
        change(dataset.evaluations[0]);

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('Invalid WorkEvaluationDataset');
    });

    it.each([
        { label: 'null', value: null },
        { label: 'an array', value: [] },
        { label: 'a primitive', value: 'measure' },
    ])('rejects a measure that is $label', ({ value }) => {
        const dataset = createDataset();
        dataset.evaluations[0].measures = [value] as unknown as typeof dataset.evaluations[0]['measures'];

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('Invalid WorkEvaluationDataset');
    });

    it('rejects a measure with an unsupported field', () => {
        const dataset = createDataset();
        Object.assign(dataset.evaluations[0].measures[0], { extra: true });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('missing or unsupported fields');
    });

    it.each([
        { label: 'an empty ID', change: (measure: ReturnType<typeof createDataset>['evaluations'][0]['measures'][0]) => { measure.metricId = ''; } },
        { label: 'an unknown ID', change: (measure: ReturnType<typeof createDataset>['evaluations'][0]['measures'][0]) => { measure.metricId = 'unknown'; } },
    ])('rejects a measure with $label', ({ change }) => {
        const dataset = createDataset();
        change(dataset.evaluations[0].measures[0]);

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('Invalid WorkEvaluationDataset');
    });

    it.each(['value', 'evidence'])('rejects an empty non-null measure %s', field => {
        const dataset = createDataset();
        Object.assign(dataset.evaluations[0].measures[0], { [field]: ' ' });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('expected non-empty text');
    });

    it('rejects duplicated metric measures', () => {
        const dataset = createDataset();
        dataset.evaluations[0].measures.push({ ...dataset.evaluations[0].measures[0] });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('metric measures must be unique');
    });

    it('rejects duplicate evaluation IDs', () => {
        const dataset = createDataset();
        dataset.evaluations.push({ ...dataset.evaluations[0] });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('work evaluation IDs must be unique');
    });

    it.each([
        'id', 'title', 'beneficiary', 'intendedOutcome', 'successCondition', 'baseline',
    ])('rejects an empty evaluation %s', field => {
        const dataset = createDataset();
        Object.assign(dataset.evaluations[0], { [field]: '' });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('expected non-empty text');
    });

    it.each(['startedAt', 'completedAt'])('rejects an empty non-null evaluation %s', field => {
        const dataset = createDataset();
        Object.assign(dataset.evaluations[0], { [field]: ' ' });

        expect(() => validateWorkEvaluationDataset(dataset)).toThrow('expected non-empty text');
    });
});
