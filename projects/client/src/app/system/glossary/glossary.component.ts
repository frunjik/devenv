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
    template: `
        <section class="glossary">
            <h1>Glossary</h1>
            <p *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>
            <p *ngIf="!errorMessage && entries.length === 0">No terms yet.</p>
            <dl *ngIf="entries.length > 0" class="glossary-list">
                <div *ngFor="let entry of entries" class="glossary-entry">
                    <dt class="glossary-term">{{ entry.term }}</dt>
                    <dd *ngFor="let definition of entry.definitions" class="glossary-definition">{{ definition }}</dd>
                </div>
            </dl>
        </section>
    `,
    styles: [`
        .glossary { width: calc(100% - 2rem); max-width: 76rem; margin: 0 auto; padding: 1rem 0; }
        .glossary-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr)); gap: .75rem; margin: 1rem 0 0; }
        .glossary-entry { border: 1px solid #37443b; border-left: 3px solid #596b5d; border-radius: .5rem; background: #1e2821; padding: .8rem 1rem; }
        .glossary-term { margin: 0 0 .35rem; color: #dce6dd; font-size: 1.05rem; font-weight: 600; line-height: 1.4; overflow-wrap: anywhere; }
        .glossary-definition { margin: 0; color: #b1bdb3; font-size: .9rem; line-height: 1.55; overflow-wrap: anywhere; }
        .glossary-definition + .glossary-definition { margin-top: .4rem; }
    `],
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
