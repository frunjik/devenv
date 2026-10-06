import { describe, expect, it } from '@jest/globals';
import { ProblemTicket, StoredTicket } from '@shared';
import { tallyByState } from './ticket-state-tally';

describe('tallyByState', () => {
    function stored(id: string, status: StoredTicket['status']): StoredTicket {
        return {
            id,
            title: `Title ${id}`,
            report: 'Report',
            problem: { condition: 'Condition', affected: 'Affected', impact: 'Impact' },
            scope: { level: 'workflow', label: 'Scope' },
            context: { people: [], places: [], things: [] },
            reportedBy: 'Reporter',
            reportedAt: '2026-10-05T12:00:00.000Z',
            status,
            version: 1,
            dataKind: 'real',
        };
    }

    function unstored(id: string): ProblemTicket {
        const { status: _status, version: _version, dataKind: _dataKind, ...ticket } = stored(id, { state: 'open' });
        return ticket;
    }

    it('returns an empty tally for no tickets', () => {
        expect(tallyByState([])).toEqual({});
    });

    it('counts each lifecycle state separately', () => {
        const tickets = [
            stored('a', { state: 'open' }),
            stored('b', { state: 'open' }),
            stored('c', { state: 'assigned', assigneeId: 'user-1' }),
            stored('d', { state: 'resolved', assigneeId: 'user-1' }),
            stored('e', { state: 'closed' }),
            stored('f', { state: 'duplicate', duplicateOfId: 'a' }),
        ];

        expect(tallyByState(tickets)).toEqual({
            open: 2,
            assigned: 1,
            resolved: 1,
            closed: 1,
            duplicate: 1,
        });
    });

    it('counts a ticket with no status as unsaved', () => {
        expect(tallyByState([unstored('local-1'), stored('a', { state: 'open' })])).toEqual({
            unsaved: 1,
            open: 1,
        });
    });
});
