import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BackendService } from '../../backend.service';

@Component({
    selector: 'app-glossary',
    standalone: true,
    imports: [NgFor, NgIf],
    template: `
        <section class="glossary">
            <h1>Glossary</h1>
            <p *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>
            <p *ngIf="!errorMessage && terms.length === 0">No terms yet.</p>
            <ul *ngIf="terms.length > 0">
                <li *ngFor="let term of terms" class="glossary-term">{{ term }}</li>
            </ul>
        </section>
    `,
    styles: [`
        .glossary { width: calc(100% - 2rem); margin: 0 auto; padding: 1rem 0; }
    `],
})
export class GlossaryComponent implements OnInit {
    terms: string[] = [];
    errorMessage = '';

    constructor(private readonly backend: BackendService) {}

    ngOnInit(): void {
        this.backend.getGlossary().subscribe({
            next: terms => {
                this.terms = terms;
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
            },
        });
    }
}