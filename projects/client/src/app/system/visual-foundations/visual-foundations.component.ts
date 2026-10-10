import { Component } from '@angular/core';

interface ColorSample {
    role: string;
    token: string;
}

@Component({
    selector: 'app-visual-foundations',
    standalone: true,
    templateUrl: './visual-foundations.component.html',
    styleUrl: './visual-foundations.component.scss',
})
export class VisualFoundationsComponent {
    selected = false;
    readonly colors: ColorSample[] = [
        { role: 'Page surface', token: '--surface-page' },
        { role: 'Card surface', token: '--surface-card' },
        { role: 'Body text', token: '--text-body' },
        { role: 'Heading text', token: '--text-heading' },
        { role: 'Secondary text', token: '--text-secondary' },
        { role: 'Border', token: '--border-default' },
        { role: 'Primary action', token: '--action-primary' },
        { role: 'Focus / selection', token: '--state-focus' },
        { role: 'Success', token: '--state-success' },
        { role: 'Warning (trial)', token: '--state-warning' },
        { role: 'Error', token: '--state-error' },
    ];
}
