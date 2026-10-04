import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BackendService } from './backend.service';
// import pipe from 
@Component({
    selector: 'app-root',
    imports: [NgIf, RouterLink, RouterOutlet, MatButtonModule, MatToolbarModule],
    // providers: [

    // ]
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'DevEnv';
    isCommitting = false;
    commitStatus = '';
    commitError = '';
    
    constructor(public bs: BackendService) {
    }

    get host(): string {
        return this.bs.host;
    }

    commitChanges(): void {
        if (this.isCommitting) {
            return;
        }
        const message = window.prompt('Commit message');
        if (message === null) {
            return;
        }
        if (!message.trim()) {
            this.commitError = 'A commit message is required.';
            this.commitStatus = '';
            return;
        }

        this.isCommitting = true;
        this.commitError = '';
        this.commitStatus = '';
        this.bs.commitChanges(message).subscribe({
            next: result => {
                this.commitStatus = result.stdout.trim() || 'Changes committed.';
                this.isCommitting = false;
            },
            error: error => {
                this.commitError = this.getCommitError(error);
                this.isCommitting = false;
            },
        });
    }

    private getCommitError(error: unknown): string {
        if (error instanceof HttpErrorResponse && error.error
            && typeof error.error === 'object' && 'error' in error.error
            && error.error.error && typeof error.error.error === 'object'
            && 'message' in error.error.error && typeof error.error.error.message === 'string') {
            return error.error.error.message;
        }
        return error instanceof Error ? error.message : 'Unable to commit changes.';
    }
}
