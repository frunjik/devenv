import { describe, expect, it } from '@jest/globals';
import type { SystemPlanConcern } from '../../shared/src/lib/types';

describe('system plan concern contract', () => {
    it('requires acceptance only for validated work', () => {
        const fields = { id: 'SC-001', title: 'Review input', kind: 'Domain', dependsOn: [], summary: 'Review input.' };
        const validated: SystemPlanConcern = { ...fields, status: 'Validated', userAcceptance: 'Pending' };
        const unfinished: SystemPlanConcern = { ...fields, status: 'In progress' };

        // @ts-expect-error Validated work must carry an acceptance disposition.
        const missingAcceptance: SystemPlanConcern = { ...fields, status: 'Validated' };
        // @ts-expect-error Unfinished work cannot carry an acceptance disposition.
        const prematureAcceptance: SystemPlanConcern = { ...fields, status: 'Ready', userAcceptance: 'Accepted' };

        expect(validated.userAcceptance).toBe('Pending');
        expect(unfinished.status).toBe('In progress');
        expect(missingAcceptance.status).toBe('Validated');
        expect(prematureAcceptance.status).toBe('Ready');
    });
});
