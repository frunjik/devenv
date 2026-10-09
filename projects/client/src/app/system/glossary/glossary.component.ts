import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import type { GlossaryEntry } from '@shared';
import { BackendService } from '../../backend.service';

@Component({
    selector: 'app-glossary',
    standalone: true,
    imports: [NgFor, NgIf],
    templateUrl: './glossary.component.html',
    styleUrl: './glossary.component.scss',
})
export class GlossaryComponent implements OnInit {
    entries: GlossaryEntry[] = [];
    errorMessage = '';
    searchQuery = '';

    get filteredEntries(): GlossaryEntry[] {
        const query = this.searchQuery.trim().toLowerCase();
        if (query.length === 0) {
            return this.entries;
        }

        return this.entries.filter(entry => [
            entry.term,
            ...entry.definitions,
            ...entry.examples,
            ...entry.domains,
        ].some(value => value.toLowerCase().includes(query)));
    }

    constructor(private readonly backend: BackendService) {}

    ngOnInit(): void {
        this.backend.getGlossary().subscribe({
            next: entries => {
                this.entries = entries;
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
            },
        });
    }
}
