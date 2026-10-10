import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { validateWorkPlanEvaluationLinks, validateWorkPlanRegistry } from '@shared';
import type { WorkPlanRegistry } from '@shared';
import { BackendService } from '../../backend.service';

@Component({
    selector: 'app-work-plans',
    standalone: true,
    imports: [NgFor, NgIf, RouterLink],
    templateUrl: './work-plans.component.html',
    styleUrl: './work-plans.component.scss',
})
export class WorkPlansComponent implements OnInit {
    private readonly backend = inject(BackendService);
    registry: WorkPlanRegistry | null = null;
    loading = true;
    errorMessage = '';

    ngOnInit(): void {
        forkJoin([
            this.backend.loadFile('knowledge\\workflows\\work-plans.json'),
            this.backend.loadFile('knowledge\\workflows\\devenv-value-evaluation.json'),
        ]).subscribe({
            next: ([registryText, ledgerText]) => {
                try {
                    const registryValue: unknown = JSON.parse(registryText);
                    validateWorkPlanEvaluationLinks(registryValue, JSON.parse(ledgerText));
                    this.registry = validateWorkPlanRegistry(registryValue);
                } catch (error) {
                    this.errorMessage = String(error);
                }
                this.loading = false;
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
                this.loading = false;
            },
        });
    }
}
