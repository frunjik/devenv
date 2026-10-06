import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SystemPlanConcern } from '@shared';
import { BackendService } from '../backend.service';

@Component({
    selector: 'app-system-plan',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './system-plan.component.html',
    styleUrl: './system-plan.component.scss',
})
export class SystemPlanComponent implements OnInit {
    private readonly backend = inject(BackendService);
    concerns: readonly SystemPlanConcern[] = [];
    loading = true;
    loadError = false;
    query = '';

    get visibleConcerns(): readonly SystemPlanConcern[] {
        const query = this.query.trim().toLowerCase();
        if (!query) {
            return this.concerns;
        }
        return this.concerns.filter(concern =>
            [concern.id, concern.title, concern.summary].some(value => value.toLowerCase().includes(query)));
    }

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
