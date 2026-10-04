import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommitMessageDialogComponent } from './commit-message-dialog.component';

describe('CommitMessageDialogComponent', () => {
    let fixture: ComponentFixture<CommitMessageDialogComponent>;
    let close: jest.MockedFunction<MatDialogRef<CommitMessageDialogComponent, string>['close']>;
    let dialogData: { message: string };

    beforeEach(async () => {
        dialogData = { message: '' };
        close = jest.fn<MatDialogRef<CommitMessageDialogComponent, string>['close']>();
        await TestBed.configureTestingModule({
            imports: [CommitMessageDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: { close } },
                { provide: MAT_DIALOG_DATA, useValue: dialogData },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CommitMessageDialogComponent);
        fixture.detectChanges();
    });

    it('prefills the input with the supplied default commit message', async () => {
        fixture.destroy();
        dialogData.message = 'Implement toolbar feature';
        fixture = TestBed.createComponent(CommitMessageDialogComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.componentInstance.message).toBe('Implement toolbar feature');
        expect(fixture.nativeElement.querySelector('textarea').value).toBe('Implement toolbar feature');
    });

    it('disables commit when the message is empty or whitespace', () => {
        const button = fixture.nativeElement.querySelector('mat-dialog-actions button:last-child');
        expect(button.disabled).toBe(true);

        fixture.componentInstance.message = '   ';
        fixture.detectChanges();

        expect(button.disabled).toBe(true);
        expect(close).not.toHaveBeenCalled();
    });

    it('closes with the trimmed commit message when submitted', () => {
        fixture.componentInstance.message = '  Update docs  ';

        fixture.componentInstance.submit();

        expect(close).toHaveBeenCalledWith('Update docs');
    });

    it('submits the message when Ctrl+Enter is pressed', () => {
        fixture.componentInstance.message = '  Update docs  ';
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });
        fixture.nativeElement.querySelector('textarea').dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(close).toHaveBeenCalledWith('Update docs');
    });
});
