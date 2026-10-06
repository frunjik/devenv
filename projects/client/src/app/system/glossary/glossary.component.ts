import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BackendService } from '../../backend.service';

export interface GlossaryEntry {
    term: string;
    definitions: string[];
}

const DEFINITION_MARKER = '- ';

// A line starting with "- " belongs to the term above it; any other line starts a new term.
function toEntries(lines: string[]): GlossaryEntry[] {
    const entries: GlossaryEntry[] = [];
    for (const line of lines) {
        const current = entries.at(-1);
        if (line.startsWith(DEFINITION_MARKER) && current) {
            current.definitions.push(line.slice(DEFINITION_MARKER.length).trim());
        } else {
            entries.push({ term: line, definitions: [] });
        }
    }
    return entries;
}

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

    constructor(private readonly backend: BackendService) {}

    ngOnInit(): void {
        this.backend.getGlossary().subscribe({
            next: lines => {
                this.entries = toEntries(lines);
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
            },
        });
    }
}
