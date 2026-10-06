import type { TicketContent, TicketEditResult, User } from '@shared';

function tidy(content: TicketContent): TicketContent {
    const tidied: TicketContent = {
        title: content.title.trim(),
        report: content.report.trim(),
        problem: {
            condition: content.problem.condition.trim(),
            affected: content.problem.affected.trim(),
            impact: content.problem.impact.trim(),
        },
        scope: { ...content.scope, label: content.scope.label.trim() },
    };
    if (content.estimate) {
        const { impact, urgency, effort } = content.estimate;
        tidied.estimate = { impact, urgency, effort };
    }
    return tidied;
}

function requiredText(content: TicketContent): string[] {
    return [
        content.title,
        content.report,
        content.problem.condition,
        content.problem.affected,
        content.problem.impact,
        content.scope.label,
    ];
}

export function applyTicketEdit(
    before: TicketContent,
    proposed: TicketContent,
    actor: User,
    at: string,
): TicketEditResult {
    const after = tidy(proposed);
    if (requiredText(after).some(text => !text)) {
        return { ok: false, reason: 'The title, report, problem frame, and scope description cannot be blank.' };
    }
    if (JSON.stringify(after) === JSON.stringify(tidy(before))) {
        return { ok: false, reason: 'Nothing changed.' };
    }
    return { ok: true, event: { kind: 'edit', actor, at, before, after } };
}