import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EstimateRating, ImportedNote, ProblemTicket, ScopeLevel, TicketEstimate } from '@shared';

interface TicketFormValues {
    title: string;
    report: string;
    condition: string;
    affected: string;
    impact: string;
    scopeLevel: string;
    scopeLabel: string;
    contextPeople: string;
    contextPlaces: string;
    contextThings: string;
    reportedBy: string;
    reportedAt: string;
    estimateImpact: string;
    estimateUrgency: string;
    estimateEffort: string;
    dependsOnTicketIds: string;
}

const ratings = new Map<string, EstimateRating>([['1', 1], ['2', 2], ['3', 3], ['4', 4], ['5', 5]]);

const scopeLevels = new Map<string, ScopeLevel>([
    ['operation', 'operation'],
    ['workflow', 'workflow'],
    ['system', 'system'],
    ['cross-system', 'cross-system'],
]);

@Component({
    selector: 'app-ticket-framing',
    standalone: true,
    templateUrl: './ticket-framing.component.html',
    styleUrl: './ticket-framing.component.scss',
})
export class TicketFramingComponent {
    @Input() notes: readonly ImportedNote[] = [];
    @Output() readonly ticketCreated = new EventEmitter<ProblemTicket>();

    validationMessage = '';
    private nextTicketNumber = 1;

    createTicket(sourceNoteSelect: HTMLSelectElement, values: TicketFormValues, event: SubmitEvent): void {
        event.preventDefault();

        const requiredValues = [
            values.title,
            values.report,
            values.condition,
            values.affected,
            values.impact,
            values.scopeLevel,
            values.scopeLabel,
            values.reportedBy,
            values.reportedAt,
        ];
        if (requiredValues.some(value => !value.trim())) {
            this.validationMessage = 'Complete all required fields.';
            return;
        }

        const sourceNoteIds = Array.from(sourceNoteSelect.selectedOptions)
            .map(option => option.value);
        if (sourceNoteIds.length === 0
            || sourceNoteIds.some(id => !this.notes.some(note => note.id === id))) {
            this.validationMessage = 'Select one or more available accepted notes.';
            return;
        }

        const scopeLevel = scopeLevels.get(values.scopeLevel);
        if (!scopeLevel) {
            this.validationMessage = 'Select a valid scope level.';
            return;
        }

        const reportedAt = new Date(values.reportedAt);
        if (Number.isNaN(reportedAt.getTime())) {
            this.validationMessage = 'Enter a valid creation time.';
            return;
        }

        const estimate = this.toEstimate(values);
        if (estimate === 'invalid') {
            this.validationMessage = 'Rate impact, urgency, and effort, or leave all three blank.';
            return;
        }

        const dependsOnTicketIds = this.toEntries(values.dependsOnTicketIds);

        this.validationMessage = '';
        const ticket: ProblemTicket = {
            id: `ticket-${this.nextTicketNumber++}`,
            title: values.title.trim(),
            report: values.report.trim(),
            problem: {
                condition: values.condition.trim(),
                affected: values.affected.trim(),
                impact: values.impact.trim(),
            },
            sourceNoteIds,
            scope: {
                level: scopeLevel,
                label: values.scopeLabel.trim(),
            },
            context: {
                people: this.toEntries(values.contextPeople),
                places: this.toEntries(values.contextPlaces),
                things: this.toEntries(values.contextThings),
            },
            reportedBy: values.reportedBy.trim(),
            reportedAt: reportedAt.toISOString(),
            ...(estimate ? { estimate } : {}),
            ...(dependsOnTicketIds.length ? { dependsOnTicketIds } : {}),
        };
        this.ticketCreated.emit(ticket);
    }

    private toEstimate(values: TicketFormValues): TicketEstimate | undefined | 'invalid' {
        const chosen = [values.estimateImpact, values.estimateUrgency, values.estimateEffort];
        if (chosen.every(value => value === '')) {
            return undefined;
        }
        const [impact, urgency, effort] = chosen.map(value => ratings.get(value));
        return impact && urgency && effort ? { impact, urgency, effort } : 'invalid';
    }

    private toEntries(value: string): string[] {
        return value
            .split(/\r?\n/)
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0);
    }
}
