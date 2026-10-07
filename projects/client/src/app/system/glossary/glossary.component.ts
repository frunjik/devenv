import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { parseGlossaryLines, type GlossaryEntry } from '@shared';
import { BackendService } from '../../backend.service';
import { map } from 'rxjs';

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
        this.backend.getGlossary().pipe(map(parseGlossaryLines)).subscribe({
            next: entries => {
                this.entries = entries;
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
            },
        });
    }
}
