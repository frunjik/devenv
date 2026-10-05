import problemSetData from '../../../../../problem-domain/problem-sets/wms-problem-set.sample.json';

describe('ProblemTicket framing', () => {
    it('provides an explicit condition, affected party, and impact for each ticket', () => {
        expect(problemSetData.tickets.every(ticket =>
            ticket.problem.condition.trim().length > 0
            && ticket.problem.affected.trim().length > 0
            && ticket.problem.impact.trim().length > 0,
        )).toBe(true);
    });
});
