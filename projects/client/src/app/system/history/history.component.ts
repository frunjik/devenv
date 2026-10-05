import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BackendService } from '../../backend.service';

export interface HistoryItem {
    timestamp: string;
    text: string;
}

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [NgFor, NgIf],
    template: `
        <section class="history">
            <h1>History</h1>
            <p *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>
            <p *ngIf="!errorMessage && items.length === 0">No history yet.</p>
            <ul *ngIf="items.length > 0">
                <li *ngFor="let item of items" class="history-item">
                    <time *ngIf="item.timestamp" class="history-timestamp">{{ item.timestamp }}</time>
                    <span class="history-text">{{ item.text }}</span>
                </li>
            </ul>
        </section>
    `,
    styles: [`
        .history { width: calc(100% - 2rem); margin: 0 auto; padding: 1rem 0; }
        ul { list-style: none; margin: 0; padding: 0; }
        .history-item { display: flex; gap: 1rem; padding: 0.25rem 0; }
        .history-timestamp { flex: none; opacity: 0.7; }
    `],
})
export class HistoryComponent implements OnInit {
    items: HistoryItem[] = [];
    errorMessage = '';

    constructor(private readonly backend: BackendService) {}

    ngOnInit(): void {
        this.backend.getHistory().subscribe({
            next: lines => {
                this.items = lines.map(line => {
                    const match = /^\/\/\s*\[([^\]]+)\]\s*(.*)$/.exec(line);
                    return match ? { timestamp: match[1], text: match[2] } : { timestamp: '', text: line };
                });
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
            },
        });
    }
}
