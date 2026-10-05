import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type ConcernStatus = 'In progress' | 'Ready' | 'Validated';

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
            <header class="page-header">
                <div>
                    <p class="eyebrow">Problem-inquiry system</p>
                    <h1>System plan</h1>
                    <p class="page-description">
                        Track the concerns shaping the system, from domain questions to validated work.
                    </p>
                </div>
                <a class="primary-link" routerLink="/problem-inquiry">Open the inquiry tool <span aria-hidden="true">→</span></a>
            </header>

            <section class="progress-summary" aria-labelledby="progress-heading">
                <div class="progress-header">
                    <div>
                        <h2 id="progress-heading">Plan progress</h2>
                        <p class="progress-caption">Validated concerns across the current plan</p>
                    </div>
                    <p class="progress-count"><strong>{{ validatedCount }}</strong><span>of {{ concerns.length }}</span></p>
                </div>
                <progress
                    [value]="validatedCount"
                    [max]="concerns.length"
                    aria-label="Plan completion"
                ></progress>
                <ul class="plan-stats">
                    <li><span class="stat-dot validated" aria-hidden="true"></span><strong>{{ validatedCount }}</strong> validated</li>
                    <li><span class="stat-dot in-progress" aria-hidden="true"></span><strong>{{ inProgressCount }}</strong> in progress</li>
                    <li><strong>{{ readyCount }}</strong> ready</li>
                </ul>
            </section>

            <section class="concerns-section" aria-labelledby="concerns-heading">
                <div class="section-heading">
                    <div>
                        <h2 id="concerns-heading">System concerns</h2>
                        <p>Each item has a stable reference and shows its current status and prerequisites.</p>
                    </div>
                    <span class="concern-total">{{ concerns.length }} concerns</span>
                </div>
                <ul class="concern-list" aria-label="System concerns">
                    @for (concern of concerns; track concern.id) {
                        <li>
                            <article class="concern-card" [attr.data-status]="concern.status">
                                <header class="concern-card__header">
                                    <div class="concern-card__identity">
                                        <span class="concern-id">{{ concern.id }}</span>
                                        <span class="kind">{{ concern.kind }}</span>
                                    </div>
                                    <span class="status" [attr.data-status]="concern.status" role="status">
                                        {{ concern.status }}
                                    </span>
                                </header>
                                <h3>{{ concern.title }}</h3>
                                <p class="concern-summary">{{ concern.summary }}</p>
                                <div class="dependencies">
                                    <span class="dependencies__label">Prerequisites</span>
                                    <span class="dependencies__value">
                                        {{ concern.dependsOn.length ? concern.dependsOn.join(', ') : 'None' }}
                                    </span>
                                </div>
                            </article>
                        </li>
                    }
                </ul>
            </section>

            <aside class="data-notice" aria-label="Plan data source">
                <p>
                    <strong>Snapshot, not live data.</strong>
                    This view is manually synchronized with
                    <code>design/problem-inquiry-system/concerns.md</code>. Update both together;
                    this view does not edit or infer concern status.
                </p>
            </aside>
        </main>
    `,
    styles: [`
        .system-plan { --border: #37443b; --muted: #9ba99e; max-width: 76rem; margin: 0 auto; padding: clamp(.75rem, 4vw, 3rem); }
        .page-header, .progress-header, .section-heading { display: flex; justify-content: space-between; gap: 1rem; }
        .page-header { align-items: end; gap: 2rem; margin-bottom: 2rem; }
        .eyebrow { margin: 0 0 .5rem; color: #a8c4ae; font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        h1 { margin: 0; font-size: clamp(2rem, 4vw, 2.75rem); letter-spacing: -.035em; }
        .page-description { margin: .65rem 0 0; color: var(--muted); line-height: 1.6; }
        .primary-link { display: inline-flex; flex: 0 0 auto; align-items: center; gap: .6rem; border: 1px solid #66816b; border-radius: .45rem; background: #385540; color: #f0f6f0; padding: .7rem 1rem; font-weight: 600; text-decoration: none; }
        .primary-link:focus-visible { outline: 2px solid #b2cfb7; outline-offset: 3px; }
        .progress-summary { border: 1px solid var(--border); border-radius: .75rem; background: #202922; padding: clamp(1rem, 3vw, 1.75rem); }
        .progress-header { align-items: center; }
        .progress-header h2, .section-heading h2 { margin: 0; font-size: 1.15rem; }
        .progress-caption, .section-heading p { margin: .4rem 0 0; color: var(--muted); font-size: .9rem; line-height: 1.5; }
        .progress-count { display: flex; align-items: baseline; gap: .45rem; margin: 0; color: var(--muted); white-space: nowrap; }
        .progress-count strong { color: #e1ece3; font-size: 1.8rem; }
        progress { display: block; width: 100%; height: .55rem; margin: 1.25rem 0 1rem; accent-color: #9bb9a1; }
        .plan-stats { display: flex; flex-wrap: wrap; gap: 1.25rem; margin: 0; padding: 0; list-style: none; }
        .plan-stats li { display: inline-flex; align-items: center; gap: .45rem; color: var(--muted); font-size: .88rem; }
        .plan-stats strong { color: #dce6dd; }
        .stat-dot { display: inline-block; width: .55rem; height: .55rem; border-radius: 50%; }
        .stat-dot.validated { background: #88b791; }
        .stat-dot.in-progress { background: #d6b66e; }
        .concerns-section { margin-top: 2.5rem; }
        .section-heading { align-items: end; flex-wrap: wrap; margin-bottom: 1rem; }
        .concern-total { color: var(--muted); }
        .concern-list { display: grid; gap: .75rem; margin: 0; padding: 0; list-style: none; }
        .concern-card { border: 1px solid var(--border); border-left: 3px solid #596b5d; border-radius: .65rem; background: #1e2821; padding: clamp(.9rem, 3vw, 1.1rem) clamp(.9rem, 3vw, 1.25rem); }
        .concern-card__header, .concern-card__identity { display: flex; align-items: center; gap: .6rem; }
        .concern-card__header { flex-wrap: wrap; justify-content: space-between; }
        .concern-card__identity { flex-wrap: wrap; min-width: 0; }
        .concern-id { border: 1px solid #46574a; border-radius: .3rem; background: #29372d; color: #b9d0bd; padding: .2rem .45rem; font: 700 .76rem/1.35 Consolas, 'Courier New', monospace; white-space: nowrap; }
        .kind { color: #a8b6aa; font-size: .78rem; }
        .status { border: 1px solid transparent; border-radius: 999px; background: #29372d; color: #b9d0bd; padding: .24rem .65rem; font-size: .76rem; font-weight: 600; white-space: nowrap; }
        .status[data-status="Validated"] { border-color: #42634a; background: #293e2e; color: #b8d9bd; }
        .status[data-status="In progress"] { border-color: #685a35; background: #3a3322; color: #e3cf97; }
        .concern-card h3 { margin: .8rem 0 .35rem; color: #dce6dd; font-size: 1.05rem; line-height: 1.4; }
        .concern-summary { margin: 0; color: #b1bdb3; font-size: .9rem; line-height: 1.55; }
        .dependencies { display: flex; flex-wrap: wrap; gap: .35rem .75rem; margin-top: .9rem; padding-top: .75rem; border-top: 1px solid #303c33; font-size: .8rem; }
        .dependencies__label { color: var(--muted); }
        .dependencies__value { color: #c3d3c6; font-family: Consolas, 'Courier New', monospace; }
        .data-notice { display: flex; gap: .75rem; margin-top: 1.5rem; border: 1px solid #414b3c; border-radius: .55rem; background: #242b22; padding: .9rem 1rem; }
        .data-notice p { margin: 0; color: #b7c0ae; font-size: .84rem; line-height: 1.55; }
        @media (max-width: 42rem) {
            .page-header { align-items: flex-start; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }
            .primary-link { width: 100%; box-sizing: border-box; justify-content: center; }
            .progress-header { align-items: flex-start; }
            .progress-count strong { font-size: 1.5rem; }
            .concerns-section { margin-top: 1.75rem; }
            .section-heading { align-items: flex-start; }
            .concern-card__header { align-items: flex-start; }
            .concern-card h3 { margin-top: .65rem; font-size: 1rem; }
            .dependencies { margin-top: .75rem; }
        }
    `],
})
export class SystemPlanComponent {
    readonly concerns: readonly PlanConcern[] = [
        {
            id: 'SC-001',
            title: 'Distinguish input from ticket',
            kind: 'Domain',
            status: 'Validated',
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
            status: 'Validated',
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
        {
            id: 'SC-011',
            title: 'Define note-to-ticket relationships',
            kind: 'Behavior',
            status: 'Validated',
            dependsOn: ['SC-001', 'SC-004'],
            summary: 'Require explicit human ticket framing from accepted notes; support one-to-many and many-to-one links.',
        },
        {
            id: 'SC-012',
            title: 'Collect complete ticket framing',
            kind: 'Behavior',
            status: 'Validated',
            dependsOn: ['SC-001', 'SC-011'],
            summary: 'Collect the complete current ProblemTicket fields without inferring values from source notes.',
        },
        {
            id: 'SC-013',
            title: 'Add identity and provenance links',
            kind: 'Implementation',
            status: 'Validated',
            dependsOn: ['SC-011'],
            summary: 'Give in-memory accepted notes identities so tickets can cite one or more sources.',
        },
        {
            id: 'SC-014',
            title: 'Build the ticket-framing component',
            kind: 'Implementation',
            status: 'Validated',
            dependsOn: ['SC-012', 'SC-013'],
            summary: 'Select accepted notes and explicitly frame a ticket with all required fields.',
        },
        {
            id: 'SC-015',
            title: 'Build the framed-ticket list',
            kind: 'Implementation',
            status: 'Validated',
            dependsOn: ['SC-012', 'SC-013'],
            summary: 'Display framed tickets and their linked accepted notes.',
        },
        {
            id: 'SC-016',
            title: 'Connect note framing to ticket review',
            kind: 'Implementation',
            status: 'Validated',
            dependsOn: ['SC-014', 'SC-015'],
            summary: 'Connect accepted notes, explicit ticket creation, and the framed-ticket list.',
        },
        {
            id: 'SC-017',
            title: 'Toggle sample and real data',
            kind: 'Behavior',
            status: 'Validated',
            dependsOn: ['SC-005', 'SC-016'],
            summary: 'Switch between showing sample and real data together and showing only real data.',
        },
        {
            id: 'SC-018',
            title: 'Explore a wide-screen inquiry layout',
            kind: 'Design',
            status: 'Validated',
            dependsOn: ['SC-016'],
            summary: 'Evaluate a responsive grid-based arrangement against the current stacked page.',
        },
        {
            id: 'SC-019',
            title: 'Clarify what a system concern is',
            kind: 'Domain',
            status: 'Validated',
            dependsOn: [],
            summary: 'Define how a concern differs from a Work Item and whether it belongs in the Glossary.',
        },
        {
            id: 'SC-020',
            title: 'Record note review decisions',
            kind: 'Domain',
            status: 'Ready',
            dependsOn: ['SC-006'],
            summary: 'Decide whether rejecting or deferring a note proposal is recorded, and what a decision records.',
        },
        {
            id: 'SC-021',
            title: 'Define ticket lifecycle',
            kind: 'Domain',
            status: 'Ready',
            dependsOn: ['SC-016'],
            summary: 'Decide whether a framed ticket can be edited, closed, or marked duplicate, and by whom.',
        },
        {
            id: 'SC-022',
            title: 'Improve glossary screen layout and styling',
            kind: 'Design',
            status: 'Ready',
            dependsOn: [],
            summary: 'Evaluate readability and responsive layout of the existing glossary screen.',
        },
        {
            id: 'SC-023',
            title: 'Quick glossary search from anywhere',
            kind: 'Behavior',
            status: 'Ready',
            dependsOn: ['SC-022'],
            summary: 'Find a way to look up a glossary term quickly from any screen.',
        },
        {
            id: 'SC-024',
            title: 'Integrate the problem-solving app into the host app shell',
            kind: 'Design',
            status: 'Validated',
            dependsOn: [],
            summary: 'High priority. Make the problem-solving app look docked into or included by the host app.',
        },
        {
            id: 'SC-025',
            title: 'Explore an AI chatbot inside the meta app',
            kind: 'Design',
            status: 'Ready',
            dependsOn: ['SC-024'],
            summary: 'Explore purpose, data exposure, and placement of an AI chatbot in the meta layer.',
        },
        {
            id: 'SC-026',
            title: 'Sort and search the problem ticket list',
            kind: 'Behavior',
            status: 'Validated',
            dependsOn: ['SC-015', 'SC-017'],
            summary: 'Sort framed tickets by different properties and search them by description.',
        },
        {
            id: 'SC-027',
            title: 'Scope glossary terms by domain level',
            kind: 'Design',
            status: 'Ready',
            dependsOn: ['SC-019', 'SC-022'],
            summary: 'Decide between separate glossaries or a level marking on a global glossary.',
        },
        {
            id: 'SC-028',
            title: 'Persist notes and tickets across reloads',
            kind: 'Design',
            status: 'Ready',
            dependsOn: ['SC-020', 'SC-021'],
            summary: 'Decide how accepted notes, decisions, and framed tickets are stored.',
        },
        {
            id: 'SC-029',
            title: 'Assign problem tickets',
            kind: 'Behavior',
            status: 'Ready',
            dependsOn: ['SC-021', 'SC-028'],
            summary: 'Let a user assign a framed ticket; model assignee, lifecycle step, and persistence first.',
        },
        {
            id: 'SC-030',
            title: 'Define a calm, consistent color system',
            kind: 'Design',
            status: 'Ready',
            dependsOn: ['SC-024'],
            summary: 'Replace scattered hex values with a small palette of tokens suited to long viewing; fix light and indigo outliers.',
        },
    ];

    get validatedCount(): number {
        return this.concerns.filter(concern => concern.status === 'Validated').length;
    }

    get inProgressCount(): number {
        return this.concerns.filter(concern => concern.status === 'In progress').length;
    }

    get readyCount(): number {
        return this.concerns.filter(concern => concern.status === 'Ready').length;
    }
}
