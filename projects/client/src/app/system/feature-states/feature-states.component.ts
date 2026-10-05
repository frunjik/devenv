import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import type { PPTFeatureStatus } from '@ppt';

export interface FeatureStateInfo {
    status: PPTFeatureStatus;
    usage: string;
}

// Record keeps this list complete: a new PPTFeatureStatus will not compile until it is described here.
const featureStateUsage: Record<PPTFeatureStatus, string> = {
    Questions: 'Needs clarification. Chosen in the status list; the feature is not an active task and any DEVENVOPDEV.md task line is removed.',
    Wished: 'Default for new features, from the client form and the API. Stored in .wishlist and listed on the Open tab.',
    Backlog: 'Accepted but not started. Chosen in the status list; also the default when a legacy line without a status is converted.',
    Queued: 'Started. The Start button sets it, moves the feature to .backlog and writes its JSON record into DEVENVOPDEV.md. Listed on the Queued tab, where it can be reordered.',
    Committed: 'Picked up by the DevEnvOPDev workflow. Chosen in the status list; the DEVENVOPDEV.md task line is removed.',
    InProgress: 'Being worked on in .current. Chosen in the status list; legacy "[in progress]" lines are converted to it.',
    Delivered: 'Built but not yet accepted. Only chosen in the status list; no automatic action.',
    Done: 'Finished. The Done button sets it and stamps deliveredDate; the feature moves to the Done tab and its task line is removed.',
    Aborted: 'Stopped before completion. The Abort button on the Queued tab sets it and removes the task line.',
    Denied: 'Rejected. The Deny action sets it and removes the task line.',
    Archived: 'Kept for the record. Only chosen in the status list; entries in the .archived file are shown on the Done tab as Done.',
};

@Component({
    selector: 'app-feature-states',
    standalone: true,
    imports: [NgFor],
    template: `
        <section class="feature-states">
            <h1>Feature states</h1>
            <dl>
                <ng-container *ngFor="let state of states">
                    <dt class="feature-state-name">{{ state.status }}</dt>
                    <dd class="feature-state-usage">{{ state.usage }}</dd>
                </ng-container>
            </dl>
        </section>
    `,
    styles: [`
        .feature-states { width: calc(100% - 2rem); margin: 0 auto; padding: 1rem 0; }
        dt { font-weight: 600; margin-top: 0.75rem; }
        dd { margin: 0.25rem 0 0; }
    `],
})
export class FeatureStatesComponent {
    readonly states: FeatureStateInfo[] = (Object.keys(featureStateUsage) as PPTFeatureStatus[])
        .map(status => ({ status, usage: featureStateUsage[status] }));
}
