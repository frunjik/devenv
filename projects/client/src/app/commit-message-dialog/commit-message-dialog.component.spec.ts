import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CommitMessageDialogComponent } from './commit-message-dialog.component';

describe('CommitMessageDialogComponent', () => {
    let fixture: ComponentFixture<CommitMessageDialogComponent>;
    let close: jest.MockedFunction<MatDialogRef<CommitMessageDialogComponent, string>['close']>;

    beforeEach(async () => {
        close = jest.fn<MatDialogRef<CommitMessageDialogComponent, string>['close']>();
        await TestBed.configureTestingModule({
            imports: [CommitMessageDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: { close } }],
        }).compileComponents();

        fixture = TestBed.createComponent(CommitMessageDialogComponent);
        fixture.detectChanges();
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
});
