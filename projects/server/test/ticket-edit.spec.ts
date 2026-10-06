import { describe, expect, it } from '@jest/globals';
import type { TicketContent } from '@shared';
import { applyTicketEdit } from '../src/lib/domain/ticket-edit';

const before: TicketContent = {
    title: 'Pick list is wrong',
    report: 'Pickers get the wrong aisle.',
    problem: { condition: 'Wrong aisle', affected: 'Pickers', impact: 'Delays' },
    scope: { level: 'workflow', label: 'Picking' },
    estimate: { impact: 3, urgency: 3, effort: 3 },
};
const actor = { id: 'user-1', name: 'Ada' };
const at = '2026-10-06T10:00:00.000Z';

describe('applyTicketEdit', () => {
    it('records the content before and after with who and when', () => {
        const after = { ...before, title: 'Pick list sends pickers to the wrong aisle' };

        expect(applyTicketEdit(before, after, actor, at)).toEqual({
            ok: true,
            event: { kind: 'edit', actor, at, before, after },
        });
    });

    it('trims text and lets an edit remove the estimate', () => {
        const { estimate: _removed, ...withoutEstimate } = before;

        const result = applyTicketEdit(before, { ...withoutEstimate, title: '  New title  ' }, actor, at);

        expect(result).toMatchObject({ ok: true, event: { after: { title: 'New title' } } });
        expect(result.ok && 'estimate' in result.event.after).toBe(false);
    });

    it('refuses blank required text', () => {
        const blankTitle = applyTicketEdit(before, { ...before, title: '  ' }, actor, at);
        const blankLabel = applyTicketEdit(before, { ...before, scope: { ...before.scope, label: '' } }, actor, at);
        const blankImpact = applyTicketEdit(before, { ...before, problem: { ...before.problem, impact: '' } }, actor, at);

        expect([blankTitle, blankLabel, blankImpact]).toEqual([
            { ok: false, reason: 'The title, report, problem frame, and scope description cannot be blank.' },
            { ok: false, reason: 'The title, report, problem frame, and scope description cannot be blank.' },
            { ok: false, reason: 'The title, report, problem frame, and scope description cannot be blank.' },
        ]);
    });

    it('refuses an edit that changes nothing', () => {
        expect(applyTicketEdit(before, { ...before, title: ` ${before.title} ` }, actor, at)).toEqual({
            ok: false,
            reason: 'Nothing changed.',
        });
    });
});