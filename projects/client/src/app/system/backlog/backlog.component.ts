import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import type { PPTFeature } from '@ppt';
import { BackendService } from '../../backend.service';

@Component({
    selector: 'app-backlog',
    standalone: true,
    imports: [NgFor, NgIf],
    template: `
        <section class="backlog">
            <h1>Backlog</h1>
            <p *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>
            <p *ngIf="!errorMessage && features.length === 0">The backlog is empty.</p>
            <ul *ngIf="features.length > 0">
                <li *ngFor="let feature of features" class="backlog-feature">
                    <span class="backlog-feature-id" [attr.title]="feature.id">{{ feature.id.slice(0, 8) }}</span>
                    <span class="backlog-feature-priority">{{ feature.priority }}</span>
                    <span class="backlog-feature-status">{{ feature.status }}</span>
                    <span class="backlog-feature-description">{{ feature.description }}</span>
                </li>
            </ul>
        </section>
    `,
    styles: [`
        .backlog { width: calc(100% - 2rem); margin: 0 auto; padding: 1rem 0; }
        ul { list-style: none; margin: 0; padding: 0; }
        .backlog-feature { display: flex; gap: 1rem; padding: 0.25rem 0; }
        .backlog-feature-id { flex: none; font-family: monospace; }
        .backlog-feature-priority, .backlog-feature-status { flex: none; min-width: 5rem; }
    `],
})
export class BacklogComponent implements OnInit {
    features: PPTFeature[] = [];
    errorMessage = '';

    constructor(private readonly backend: BackendService) {}

    ngOnInit(): void {
        this.backend.getBacklog().subscribe({
            next: features => {
                this.features = features;
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
            },
        });
    }
}