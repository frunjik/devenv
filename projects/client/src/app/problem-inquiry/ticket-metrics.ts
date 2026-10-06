import { TicketEstimate } from '@shared';

export type MetricMethod = 'impact-urgency' | 'wsjf';

export const METRIC_METHODS: readonly { id: MetricMethod; label: string }[] = [
    { id: 'impact-urgency', label: 'Impact × urgency' },
    { id: 'wsjf', label: 'Weighted shortest job first' },
];

export function calculateMetric(method: MetricMethod, estimate: TicketEstimate | undefined): number | undefined {
    if (!estimate) {
        return undefined;
    }
    if (method === 'impact-urgency') {
        return estimate.impact * estimate.urgency;
    }
    return Math.round(((estimate.impact + estimate.urgency) / estimate.effort) * 100) / 100;
}