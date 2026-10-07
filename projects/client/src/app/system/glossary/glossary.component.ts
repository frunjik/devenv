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
