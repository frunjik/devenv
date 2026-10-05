import { describe, expect, it } from '@jest/globals';
import { ProblemTicket } from '@shared';

const ticket: ProblemTicket = {
    id: 'WMS-011',
    title: 'Validation error has an unknown cause',
    report: 'Entering a value is rejected; the cause is unknown.',
    problem: {
        condition: 'Entering a value is rejected, but the responsible rule or setup is unknown.',
        affected: 'Warehouse operator',
        impact: 'The operator cannot proceed safely without understanding the rule.',
    },
    sourceNoteIds: ['note-1', 'note-2'],
    scope: {
        level: 'operation',
        label: 'Input validation',
    },
    context: {
        people: ['warehouse operator'],
        places: ['screen with validation'],
        things: ['entered value', 'validation rule'],
    },
    reportedBy: 'synthetic-sample',
    reportedAt: '2026-10-05T00:00:00.000Z',
};

describe('ProblemTicket', () => {
    it('separates the problem frame from the report and does not require a cause', () => {
        expect(ticket.problem).toEqual({
            condition: 'Entering a value is rejected, but the responsible rule or setup is unknown.',
            affected: 'Warehouse operator',
            impact: 'The operator cannot proceed safely without understanding the rule.',
        });
        expect(ticket.sourceNoteIds).toEqual(['note-1', 'note-2']);
    });
});
