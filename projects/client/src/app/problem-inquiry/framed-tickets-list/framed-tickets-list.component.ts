import { Component, Input } from '@angular/core';
import { ImportedNote, ProblemTicket } from '@shared';

@Component({
    selector: 'app-framed-tickets-list',
    standalone: true,
    template: `
        <section class="framed-tickets" aria-labelledby="framed-tickets-heading">
            <h2 id="framed-tickets-heading">Framed problem tickets</h2>

            @if (tickets.length === 0) {
                <p class="empty-state">No framed problem tickets yet.</p>
            } @else {
                <ul class="ticket-list">
                    @for (ticket of tickets; track ticket.id) {
                        <li>
                            <article class="ticket-card" [attr.aria-label]="'Problem ticket ' + ticket.id">
                                <header>
                                    <p class="ticket-id">{{ ticket.id }}</p>
                                    <h3>{{ ticket.title }}</h3>
                                </header>

                                <p><strong>Report</strong>: {{ ticket.report }}</p>

                                <section aria-label="Problem frame">
                                    <h4>Problem frame</h4>
                                    <dl>
                                        <dt>Condition</dt>
                                        <dd>{{ ticket.problem.condition }}</dd>
                                        <dt>Affected</dt>
                                        <dd>{{ ticket.problem.affected }}</dd>
                                        <dt>Impact</dt>
                                        <dd>{{ ticket.problem.impact }}</dd>
                                    </dl>
                                </section>

                                <section aria-label="Scope and work context">
                                    <h4>Scope and work context</h4>
                                    <p>{{ ticket.scope.level }}: {{ ticket.scope.label }}</p>
                                    <dl class="context-list">
                                        <dt>People</dt>
                                        <dd>
                                            <ul>
                                                @for (person of ticket.context.people; track $index) {
                                                    <li>{{ person }}</li>
                                                } @empty {
                                                    <li>No people recorded.</li>
                                                }
                                            </ul>
                                        </dd>
                                        <dt>Places</dt>
                                        <dd>
                                            <ul>
                                                @for (place of ticket.context.places; track $index) {
                                                    <li>{{ place }}</li>
                                                } @empty {
                                                    <li>No places recorded.</li>
                                                }
                                            </ul>
                                        </dd>
                                        <dt>Things</dt>
                                        <dd>
                                            <ul>
                                                @for (thing of ticket.context.things; track $index) {
                                                    <li>{{ thing }}</li>
                                                } @empty {
                                                    <li>No things recorded.</li>
                                                }
                                            </ul>
                                        </dd>
                                    </dl>
                                </section>

                                <section aria-label="Accepted note references">
                                    <h4>Accepted note references</h4>
                                    @if (ticket.sourceNoteIds?.length) {
                                        <ul class="source-notes">
                                            @for (noteId of ticket.sourceNoteIds ?? []; track noteId) {
                                                <li>
                                                    <strong>{{ noteId }}</strong>
                                                    @if (findNote(noteId); as note) {
                                                        <p>{{ note.proposal.sourceText }}</p>
                                                        <p>{{ note.proposal.interpretation }}</p>
                                                    } @else {
                                                        <p>Note is not currently available.</p>
                                                    }
                                                </li>
                                            }
                                        </ul>
                                    } @else {
                                        <p class="no-note-references">No accepted note references recorded.</p>
                                    }
                                </section>

                                <footer>
                                    <p>Reported by {{ ticket.reportedBy }}</p>
                                    <p>Created <time [attr.datetime]="ticket.reportedAt">{{ ticket.reportedAt }}</time></p>
                                </footer>
                            </article>
                        </li>
                    }
                </ul>
            }
        </section>
    `,
    styles: `
        .framed-tickets {
            max-width: 64rem;
            margin-block: 2rem;
        }

        .ticket-list,
        .source-notes {
            display: grid;
            gap: 1rem;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .ticket-card {
            display: grid;
            gap: 1rem;
            padding: 1.25rem;
            border: 1px solid #cbd5e1;
            border-radius: 0.65rem;
            background: #fff;
        }

        .ticket-card header,
        .ticket-card footer {
            display: flex;
            flex-wrap: wrap;
            align-items: baseline;
            justify-content: space-between;
            gap: 0.5rem 1rem;
        }

        h3,
        h4,
        p {
            margin-block: 0;
        }

        .ticket-id {
            color: #475569;
            font-weight: 700;
        }

        dl {
            display: grid;
            grid-template-columns: minmax(7rem, auto) 1fr;
            gap: 0.4rem 1rem;
            margin: 0;
        }

        dt {
            font-weight: 700;
        }

        dd {
            min-width: 0;
            margin: 0;
        }

        .context-list ul {
            margin: 0;
            padding-inline-start: 1.25rem;
        }

        .source-notes {
            margin-block-start: 0.5rem;
        }

        .source-notes li {
            padding: 0.75rem;
            border-inline-start: 3px solid #94a3b8;
            background: #f8fafc;
            overflow-wrap: anywhere;
        }

        @media (max-width: 40rem) {
            .ticket-card {
                padding: 1rem;
            }

            dl {
                grid-template-columns: 1fr;
                gap: 0.15rem;
            }

            dd + dt {
                margin-block-start: 0.5rem;
            }
        }
    `,
})
export class FramedTicketsListComponent {
    @Input() tickets: readonly ProblemTicket[] = [];
    @Input() notes: readonly ImportedNote[] = [];

    findNote(noteId: string): ImportedNote | undefined {
        return this.notes.find(note => note.id === noteId);
    }
}
