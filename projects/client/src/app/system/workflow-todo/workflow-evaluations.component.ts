import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { validateWorkEvaluationDataset } from '@shared';
import type { WorkEvaluationDataset } from '@shared';
import { BackendService } from '../../backend.service';
import { formatElapsedDuration } from './evaluation-duration';
import {
    COPILOT_CREDIT_PRICING_AS_OF,
    COPILOT_CREDIT_PRICING_SOURCE,
    estimateCopilotCredits,
} from './copilot-credit-estimator';
import type { CopilotCreditEstimate } from './copilot-credit-estimator';

@Component({
    selector: 'app-workflow-evaluations',
    standalone: true,
    imports: [NgFor, NgIf],
    templateUrl: './workflow-evaluations.component.html',
    styleUrl: './workflow-evaluations.component.scss',
})
export class WorkflowEvaluationsComponent implements OnInit {
    dataset: WorkEvaluationDataset | null = null;
    loading = true;
    errorMessage = '';
    tokenUsageJson = '';
    tokenUsageError = '';
    creditEstimates: CopilotCreditEstimate[] | null = null;
    readonly pricingAsOf = COPILOT_CREDIT_PRICING_AS_OF;
    readonly pricingSource = COPILOT_CREDIT_PRICING_SOURCE;

    constructor(private readonly backend: BackendService) {}

    formatElapsedDuration(startedAt: string | null, completedAt: string | null): string {
        return formatElapsedDuration(startedAt, completedAt);
    }

    ngOnInit(): void {
        this.backend.loadFile('knowledge\\workflows\\devenv-value-evaluation.json').subscribe({
            next: text => {
                try {
                    const value: unknown = JSON.parse(text);
                    this.dataset = validateWorkEvaluationDataset(value);
                    this.loading = false;
                } catch (error) {
                    this.errorMessage = String(error);
                    this.loading = false;
                }
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
                this.loading = false;
            },
        });
    }

    updateTokenUsage(event: Event): void {
        if (event.target instanceof HTMLTextAreaElement) {
            this.tokenUsageJson = event.target.value;
        }
    }

    estimateTokenUsage(): void {
        try {
            this.creditEstimates = estimateCopilotCredits(JSON.parse(this.tokenUsageJson));
            this.tokenUsageError = '';
        } catch (error) {
            this.creditEstimates = null;
            this.tokenUsageError = String(error);
        }
    }

    get estimatedAiCredits(): number {
        return this.creditEstimates?.reduce((total, estimate) => total + estimate.aiCredits, 0) ?? 0;
    }

    get estimatedUsdCost(): number {
        return this.creditEstimates?.reduce((total, estimate) => total + estimate.usdCost, 0) ?? 0;
    }
}
