import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImportedNote, ProblemTicket, ScopeLevel } from '@shared';

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
}

const scopeLevels = new Map<string, ScopeLevel>([
    ['operation', 'operation'],
    ['workflow', 'workflow'],
    ['system', 'system'],
    ['cross-system', 'cross-system'],
]);

@Component({
    selector: 'app-ticket-framing',
    standalone: true,
    template: `
        <section class="ticket-framing" aria-labelledby="ticket-framing-heading">
            <h2 id="ticket-framing-heading">Frame a problem ticket</h2>
            <p>Select one or more accepted notes, then enter the ticket details explicitly.
                Note content is not copied into ticket fields.</p>

            @if (notes.length === 0) {
                <p class="empty-notes">Accept a note before framing a ticket.</p>
            }

            <form (submit)="createTicket(
                sourceNoteIds,
                {
                    title: title.value,
                    report: report.value,
                    condition: condition.value,
                    affected: affected.value,
                    impact: impact.value,
                    scopeLevel: scopeLevel.value,
                    scopeLabel: scopeLabel.value,
                    contextPeople: contextPeople.value,
                    contextPlaces: contextPlaces.value,
                    contextThings: contextThings.value,
                    reportedBy: reportedBy.value,
                    reportedAt: reportedAt.value
                },
                $event
            )">
                <fieldset class="source-notes" [disabled]="notes.length === 0">
                    <legend>Accepted notes</legend>
                    <label for="source-note-ids">Notes linked to this ticket</label>
                    <select id="source-note-ids" #sourceNoteIds multiple size="4" required>
                        @for (note of notes; track note.id) {
                            <option [value]="note.id">{{ note.id }} — {{ note.proposal.sourceText }}</option>
                        }
                    </select>
                </fieldset>

                <div class="ticket-fields">
                    <label for="ticket-title">Title</label>
                    <input id="ticket-title" #title name="title" type="text" required>

                    <label for="ticket-report">Report</label>
                    <textarea id="ticket-report" #report name="report" required></textarea>

                    <fieldset class="problem-frame">
                        <legend>Problem frame</legend>
                        <label for="problem-condition">Undesirable condition</label>
                        <textarea id="problem-condition" #condition name="condition" required></textarea>

                        <label for="problem-affected">Who or what is affected</label>
                        <input id="problem-affected" #affected name="affected" type="text" required>

                        <label for="problem-impact">Why it matters</label>
                        <textarea id="problem-impact" #impact name="impact" required></textarea>
                    </fieldset>

                    <fieldset class="scope">
                        <legend>Scope</legend>
                        <label for="scope-level">Scope level</label>
                        <select id="scope-level" #scopeLevel name="scopeLevel" required>
                            <option value="">Select a scope level</option>
                            <option value="operation">Operation</option>
                            <option value="workflow">Workflow</option>
                            <option value="system">System</option>
                            <option value="cross-system">Cross-system</option>
                        </select>

                        <label for="scope-label">Scope description</label>
                        <input id="scope-label" #scopeLabel name="scopeLabel" type="text" required>
                    </fieldset>

                    <fieldset class="work-context">
                        <legend>Work context</legend>
                        <p>Enter one item per line. Leave a field blank when no entry is recorded.</p>
                        <label for="context-people">People</label>
                        <textarea id="context-people" #contextPeople name="contextPeople"></textarea>

                        <label for="context-places">Places</label>
                        <textarea id="context-places" #contextPlaces name="contextPlaces"></textarea>

                        <label for="context-things">Things</label>
                        <textarea id="context-things" #contextThings name="contextThings"></textarea>
                    </fieldset>

                    <label for="reported-by">Reported by</label>
                    <input id="reported-by" #reportedBy name="reportedBy" type="text" required>

                    <label for="reported-at">Creation time</label>
                    <input id="reported-at" #reportedAt name="reportedAt" type="datetime-local" required>
                </div>

                @if (validationMessage) {
                    <p role="alert">{{ validationMessage }}</p>
                }

                <button type="submit" [disabled]="notes.length === 0">Create problem ticket</button>
            </form>
        </section>
    `,
    styles: `
        .ticket-framing {
            max-width: 52rem;
            margin-block: 2rem;
        }

        form,
        .ticket-fields,
        .problem-frame,
        .scope,
        .work-context {
            display: grid;
            gap: 0.75rem;
        }

        fieldset {
            min-width: 0;
            padding: 1rem;
            border: 1px solid #cbd5e1;
            border-radius: 0.5rem;
        }

        input,
        select,
        textarea {
            box-sizing: border-box;
            width: 100%;
            padding: 0.65rem;
            font: inherit;
        }

        textarea {
            min-height: 5rem;
            resize: vertical;
        }

        .work-context p,
        .empty-notes {
            margin-block: 0;
        }
    `,
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
        };
        this.ticketCreated.emit(ticket);
    }

    private toEntries(value: string): string[] {
        return value
            .split(/\r?\n/)
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0);
    }
}
