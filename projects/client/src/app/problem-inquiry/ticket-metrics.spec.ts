import { describe, expect, it } from '@jest/globals';
import { TicketEstimate } from '@shared';
import { METRIC_METHODS, calculateMetric } from './ticket-metrics';

const estimate = (impact: TicketEstimate['impact'], urgency: TicketEstimate['urgency'], effort: TicketEstimate['effort']): TicketEstimate => ({
    impact,
    urgency,
    effort,
});

describe('calculateMetric', () => {
    it('multiplies impact by urgency', () => {
        expect(calculateMetric('impact-urgency', estimate(4, 5, 2))).toBe(20);
    });

    it('divides impact plus urgency by effort for weighted shortest job first', () => {
        expect(calculateMetric('wsjf', estimate(4, 5, 2))).toBe(4.5);
    });

    it('rounds weighted shortest job first to two decimals', () => {
        expect(calculateMetric('wsjf', estimate(1, 1, 3))).toBe(0.67);
    });

    it('gives nothing when the ticket has no estimate', () => {
        expect(calculateMetric('impact-urgency', undefined)).toBeUndefined();
        expect(calculateMetric('wsjf', undefined)).toBeUndefined();
    });

    it('lists each method with a label', () => {
        expect(METRIC_METHODS.map(method => method.id)).toEqual(['impact-urgency', 'wsjf']);
        expect(METRIC_METHODS.map(method => method.label)).toEqual(['Impact × urgency', 'Weighted shortest job first']);
    });
});