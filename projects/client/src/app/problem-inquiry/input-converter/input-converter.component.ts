import { Component, EventEmitter, Output } from '@angular/core';
import { ImportedNote, NoteProposal, NoteReviewDecision, SourceOrigin, SourceReference } from '@shared';

@Component({
    selector: 'app-input-converter',
    standalone: true,
    templateUrl: './input-converter.component.html',
    styleUrl: './input-converter.component.scss',
})
export class InputConverterComponent {
    @Output() readonly proposalCreated = new EventEmitter<NoteProposal>();
    @Output() readonly noteAccepted = new EventEmitter<ImportedNote>();
    @Output() readonly proposalReviewed = new EventEmitter<{ proposal: NoteProposal; decision: NoteReviewDecision }>();
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

    reviewProposal(proposal: NoteProposal, outcome: 'rejected' | 'deferred', reasonText: string): void {
        const reason = reasonText.trim();
        this.proposalReviewed.emit({
            proposal,
            decision: {
                outcome,
                ...(reason ? { reason } : {}),
                decidedAt: new Date().toISOString(),
            },
        });
        this.pendingProposal = null;
    }
}
