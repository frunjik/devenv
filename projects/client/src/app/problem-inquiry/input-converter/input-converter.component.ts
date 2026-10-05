import { Component, EventEmitter, Output } from '@angular/core';
import { ImportedNote, NoteProposal, SourceOrigin, SourceReference } from '@shared';

@Component({
    selector: 'app-input-converter',
    standalone: true,
    template: `
        <form (submit)="createProposal(
            sourceText.value,
            sourceArtifact.value,
            sourceLocator.value,
            interpretation.value,
            openQuestions.value,
            $event
        )">
            <fieldset [disabled]="pendingProposal !== null">
                <label for="source-text">Source text</label>
                <textarea id="source-text" #sourceText required></textarea>

                <label for="source-artifact">Source artifact (optional)</label>
                <input id="source-artifact" #sourceArtifact type="text">

                <label for="source-locator">Source location (optional)</label>
                <input id="source-locator" #sourceLocator type="text">

                <fieldset>
                    <legend>Source origin</legend>
                    <label><input type="radio" name="source-origin" value="unknown" checked
                        (change)="setSourceOrigin('unknown')"> Unknown</label>
                    <label><input type="radio" name="source-origin" value="synthetic"
                        (change)="setSourceOrigin('synthetic')"> Synthetic sample</label>
                    <label><input type="radio" name="source-origin" value="external-report"
                        (change)="setSourceOrigin('external-report')"> External report</label>
                    <label><input type="radio" name="source-origin" value="direct-observation"
                        (change)="setSourceOrigin('direct-observation')"> Direct observation</label>
                    <label><input type="radio" name="source-origin" value="system-artifact"
                        (change)="setSourceOrigin('system-artifact')"> System artifact</label>
                </fieldset>

                <label for="interpretation">Tentative interpretation</label>
                <textarea id="interpretation" #interpretation required></textarea>

                <label for="open-questions">Unresolved questions (one per line)</label>
                <textarea id="open-questions" #openQuestions></textarea>

                @if (validationMessage) {
                    <p role="alert">{{ validationMessage }}</p>
                }

                <button type="submit">Create note proposal</button>
            </fieldset>
        </form>

        @if (pendingProposal; as proposal) {
            <section aria-labelledby="proposal-review-heading">
                <h2 id="proposal-review-heading">Review note proposal</h2>
                <p>{{ proposal.sourceText }}</p>
                <p>{{ proposal.interpretation }}</p>
                <ul>
                    @for (question of proposal.openQuestions; track $index) {
                        <li>{{ question }}</li>
                    }
                </ul>
                <button id="edit-proposal" type="button" (click)="editProposal()">Edit proposal</button>
                <button id="accept-note" type="button" (click)="acceptProposal(proposal)">Accept note</button>
            </section>
        }
    `,
    styles: `
        :host {
            display: block;
            min-width: 0;
        }

        form,
        section[aria-labelledby="proposal-review-heading"] {
            display: grid;
            gap: 0.75rem;
            max-width: 100%;
        }

        fieldset {
            box-sizing: border-box;
            min-width: 0;
            max-width: 100%;
            padding: 0.75rem;
        }

        form > label {
            font-weight: 600;
        }

        input[type="text"],
        textarea {
            box-sizing: border-box;
            display: block;
            width: 100%;
            max-width: 100%;
            padding: 0.6rem;
        }

        textarea {
            min-height: 5rem;
            resize: vertical;
        }

        fieldset fieldset label {
            display: inline-flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.35rem;
            margin-inline-end: 0.75rem;
        }

        fieldset fieldset input[type="radio"] {
            width: auto;
        }

        section[aria-labelledby="proposal-review-heading"] {
            margin-block-start: 1rem;
        }

        button {
            justify-self: start;
        }
    `,
})
export class InputConverterComponent {
    @Output() readonly proposalCreated = new EventEmitter<NoteProposal>();
    @Output() readonly noteAccepted = new EventEmitter<ImportedNote>();
    validationMessage = '';
    pendingProposal: NoteProposal | null = null;
    private sourceOrigin: SourceOrigin = 'unknown';
    private nextNoteNumber = 1;

    createProposal(
        sourceText: string,
        sourceArtifact: string,
        sourceLocator: string,
        interpretation: string,
        openQuestionsText: string,
        event: SubmitEvent,
    ): void {
        event.preventDefault();
        if (!sourceText.trim() || !interpretation.trim()) {
            this.validationMessage = 'Enter source text and an interpretation.';
            return;
        }

        this.validationMessage = '';
        const sourceReference: SourceReference = {
            artifact: sourceArtifact.trim() || null,
            locator: sourceLocator.trim() || null,
        };
        const proposal: NoteProposal = {
            sourceText,
            sourceReference,
            sourceOrigin: this.sourceOrigin,
            verificationStatus: 'unreviewed',
            interpretation,
            openQuestions: openQuestionsText
                .split(/\r?\n/)
                .map(question => question.trim())
                .filter(question => question.length > 0),
        };
        this.pendingProposal = proposal;
        this.proposalCreated.emit(proposal);
    }

    setSourceOrigin(sourceOrigin: SourceOrigin): void {
        this.sourceOrigin = sourceOrigin;
    }

    editProposal(): void {
        this.pendingProposal = null;
    }

    acceptProposal(proposal: NoteProposal): void {
        this.noteAccepted.emit({
            id: `note-${this.nextNoteNumber++}`,
            proposal,
            acceptedAt: new Date().toISOString(),
        });
        this.pendingProposal = null;
    }
}
