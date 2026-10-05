import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type ConcernStatus = 'In progress' | 'Validated';

interface PlanConcern {
    readonly id: string;
    readonly title: string;
    readonly kind: string;
    readonly status: ConcernStatus;
    readonly dependsOn: readonly string[];
    readonly summary: string;
}

@Component({
    selector: 'app-system-plan',
    standalone: true,
    imports: [RouterLink],
    template: `
        <main class="system-plan">
            <header>
                <p class="eyebrow">Problem-inquiry system</p>
                <h1>System plan</h1>
                <p>Current concerns, their dependencies, and implementation status.</p>
                <a routerLink="/problem-inquiry">Open the inquiry tool</a>
            </header>

            <section class="progress-summary" aria-labelledby="progress-heading">
                <h2 id="progress-heading">Plan progress</h2>
                <progress
                    [value]="validatedCount"
                    [max]="concerns.length"
                    aria-label="Validated concerns"
                ></progress>
                <p>{{ validatedCount }} validated of {{ concerns.length }} concerns</p>
                <ul>
                    <li>{{ validatedCount }} validated</li>
                    <li>{{ inProgressCount }} in progress</li>
                </ul>
            </section>

            <section aria-labelledby="concerns-heading">
                <h2 id="concerns-heading">Concerns</h2>
                <ol class="concern-list">
                    @for (concern of concerns; track concern.id) {
                        <li [attr.data-status]="concern.status">
                            <article>
                                <div class="concern-heading">
                                    <h3><span>{{ concern.id }}</span> — {{ concern.title }}</h3>
                                    <span class="status" [attr.data-status]="concern.status">
                                        {{ concern.status }}
                                    </span>
                                </div>
                                <p class="kind">{{ concern.kind }}</p>
                                <p>{{ concern.summary }}</p>
                                <p>
                                    <strong>Depends on:</strong>
                                    {{ concern.dependsOn.length ? concern.dependsOn.join(', ') : 'None' }}
                                </p>
                            </article>
                        </li>
                    }
                </ol>
            </section>

            <aside aria-label="Plan data source">
                <strong>Plan data:</strong> this view is a manually synchronized snapshot of
                <code>design/problem-inquiry-system/concerns.md</code>, not live plan data.
                Update both together; this view does not edit or infer concern status.
            </aside>
        </main>
    `,
    styles: [`
        .system-plan { max-width: 72rem; margin: 0 auto; padding: 1.5rem; }
        .eyebrow, .kind { color: #a8c4ae; text-transform: uppercase; letter-spacing: 0.08em; }
        .progress-summary, .concern-list article, aside {
            border: 1px solid #3b4b40;
            border-radius: 0.5rem;
            background: #202922;
            padding: 1rem;
        }
        .progress-summary { margin: 1.5rem 0; }
        progress { width: 100%; height: 0.8rem; accent-color: #9bb9a1; }
        .progress-summary ul { display: flex; gap: 2rem; padding-left: 1.25rem; }
        .concern-list { display: grid; gap: 0.8rem; padding-left: 2.5rem; }
        .concern-list li { padding-left: 0.5rem; }
        .concern-list article { padding: 1rem 1.25rem; }
        .concern-heading { display: flex; align-items: start; justify-content: space-between; gap: 1rem; }
        .concern-heading h3 { margin-top: 0; }
        .status { flex: 0 0 auto; border-radius: 1rem; padding: 0.25rem 0.7rem; }
        .status[data-status="Validated"] { background: #34553c; color: #d7efda; }
        .status[data-status="In progress"] { background: #514529; color: #f0dfad; }
        .kind { font-size: 0.8rem; }
        aside { margin-top: 1.5rem; line-height: 1.6; }
        code { overflow-wrap: anywhere; }
        @media (max-width: 36rem) {
            .system-plan { padding: 1rem; }
            .concern-heading { flex-direction: column; gap: 0; }
            .progress-summary ul { flex-direction: column; gap: 0.25rem; }
        }
    `],
})
export class SystemPlanComponent {
    readonly concerns: readonly PlanConcern[] = [
        {
            id: 'SC-001',
            title: 'Distinguish input from ticket',
            kind: 'Domain',
            status: 'In progress',
            dependsOn: [],
            summary: 'Clarify the difference between raw input, an imported note, and a Problem Ticket.',
        },
        {
            id: 'SC-002',
            title: 'Preserve source provenance',
            kind: 'Behavior',
            status: 'In progress',
            dependsOn: ['SC-001'],
            summary: 'Keep interpretations traceable to their original artifacts and relevant wording.',
        },
        {
            id: 'SC-003',
            title: 'Represent uncertain conversion',
            kind: 'Behavior',
            status: 'In progress',
            dependsOn: ['SC-001', 'SC-002'],
            summary: 'Preserve ambiguity, missing information, and alternative interpretations.',
        },
        {
            id: 'SC-004',
            title: 'Define human review',
            kind: 'Behavior',
            status: 'In progress',
            dependsOn: ['SC-003'],
            summary: 'Define proposal review and distinguish acceptance from truth or ticket promotion.',
        },
        {
            id: 'SC-005',
            title: 'Preserve sample provenance',
            kind: 'Quality',
            status: 'In progress',
            dependsOn: ['SC-002'],
            summary: 'Keep synthetic examples distinguishable from observed or verified reports.',
        },
        {
            id: 'SC-006',
            title: 'Build the input converter',
            kind: 'Implementation',
            status: 'Validated',
            dependsOn: ['SC-003', 'SC-004', 'SC-005'],
            summary: 'Convert manually entered text into a local proposal with explicit acceptance.',
        },
        {
            id: 'SC-007',
            title: 'Define the converted-items list',
            kind: 'Behavior',
            status: 'Validated',
            dependsOn: ['SC-004', 'SC-005'],
            summary: 'Show accepted notes and keep their source, verification, and open questions visible.',
        },
        {
            id: 'SC-008',
            title: 'Build the converted-items list',
            kind: 'Implementation',
            status: 'Validated',
            dependsOn: ['SC-007'],
            summary: 'Implement the accepted-notes list as a separate component.',
        },
        {
            id: 'SC-009',
            title: 'Connect the vertical slice',
            kind: 'Implementation',
            status: 'Validated',
            dependsOn: ['SC-006', 'SC-008'],
            summary: 'Connect proposal acceptance to the in-memory list and expose the inquiry page.',
        },
        {
            id: 'SC-010',
            title: 'Visualize the current system plan',
            kind: 'Implementation',
            status: 'Validated',
            dependsOn: [],
            summary: 'Provide a read-only view of concern status, dependencies, and overall progress.',
        },
    ];

    get validatedCount(): number {
        return this.concerns.filter(concern => concern.status === 'Validated').length;
    }

    get inProgressCount(): number {
        return this.concerns.filter(concern => concern.status === 'In progress').length;
    }
}
