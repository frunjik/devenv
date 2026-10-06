import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SystemPlanConcern } from '@shared';
import { BackendService } from '../backend.service';

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
                @if (loading) {
                    <p>Loading plan progress…</p>
                } @else if (loadError) {
                    <p role="alert">Could not load the system plan.</p>
                } @else {
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
                }
            </section>

            <section class="concerns-section" aria-labelledby="concerns-heading">
                <div class="section-heading">
                    <div>
                        <h2 id="concerns-heading">System concerns</h2>
                        <p>Each item has a stable reference and shows its current status and prerequisites.</p>
                    </div>
                    <span class="concern-total">{{ concerns.length }} concerns</span>
                </div>
                @if (loading) {
                    <p>Loading system concerns…</p>
                } @else if (loadError) {
                    <p role="alert">Could not load the system plan.</p>
                } @else if (concerns.length === 0) {
                    <p>No system concerns are registered.</p>
                } @else {
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
                }
            </section>

            <aside class="data-notice" aria-label="Plan data source">
                <p>
                    Live data from
                    <code>design/problem-inquiry-system/concerns.md</code>.
                    This view does not edit or infer concern status.
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
export class SystemPlanComponent implements OnInit {
    private readonly backend = inject(BackendService);
    concerns: readonly SystemPlanConcern[] = [];
    loading = true;
    loadError = false;

    ngOnInit(): void {
        this.backend.getSystemPlan().subscribe({
            next: concerns => {
                this.concerns = concerns;
                this.loading = false;
            },
            error: () => {
                this.loadError = true;
                this.loading = false;
            },
        });
    }

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
