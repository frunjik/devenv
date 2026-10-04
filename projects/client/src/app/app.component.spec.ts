import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { CommitMessageDialogComponent } from './commit-message-dialog/commit-message-dialog.component';

describe('AppComponent', () => {
    let http: HttpTestingController;
    let snackbarOpen: jest.MockedFunction<MatSnackBar['open']>;
    let navigateByUrl: jest.SpiedFunction<Router['navigateByUrl']>;
    let dialogOpen: jest.Mock;

    beforeEach(async () => {
        snackbarOpen = jest.fn<MatSnackBar['open']>();
        dialogOpen = jest.fn(() => ({ afterClosed: () => of('Save progress') }));
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([])
            ]
        })
            .overrideComponent(AppComponent, {
                add: {
                    providers: [
                        { provide: MatSnackBar, useValue: { open: snackbarOpen } },
                        { provide: MatDialog, useValue: { open: dialogOpen } },
                    ],
                },
            })
            .compileComponents();
        http = TestBed.inject(HttpTestingController);
        navigateByUrl = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have the 'Devenv' title`, () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.title).toEqual('DevEnv');
    });

    it('renders the backend host in the toolbar', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('http://localhost:3000/');
    });

    it('shows a button to commit changes', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Commit changes');
    });

    it('shows a menu link to the git log view', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        const gitLogLink = fixture.nativeElement.querySelector('a[href="/git/log"]');
        expect(gitLogLink.textContent).toContain('Git log');
    });

    it('navigates to the git log before opening the commit dialog', async () => {
        const order: string[] = [];
        navigateByUrl.mockImplementation(async () => {
            order.push('navigate');
            return true;
        });
        dialogOpen.mockImplementation(() => {
            order.push('dialog');
            return { afterClosed: () => of(undefined) };
        });
        const fixture = TestBed.createComponent(AppComponent);

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        expect(navigateByUrl).toHaveBeenCalledWith('/git/log');
        expect(order).toEqual(['navigate', 'dialog']);
        expect(dialogOpen).toHaveBeenCalledWith(CommitMessageDialogComponent, {
            width: 'min(32rem, calc(100vw - 2rem))',
            ariaLabel: 'Commit changes',
        });
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('does not commit when the dialog is cancelled', async () => {
        dialogOpen.mockImplementation(() => ({ afterClosed: () => of(undefined) }));
        const fixture = TestBed.createComponent(AppComponent);

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        http.expectNone('http://localhost:3000/git/commit');
    });

    it('does not open another dialog while a commit is already running', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.isCommitting = true;

        fixture.componentInstance.commitChanges();

        expect(dialogOpen).not.toHaveBeenCalled();
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('posts the dialog message and shows commit output in a snackbar', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        const request = http.expectOne('http://localhost:3000/git/commit');
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ message: 'Save progress' });
        request.flush({ data: { stdout: '[main abc123] Save progress', stderr: '' } });

        expect(snackbarOpen).toHaveBeenCalledWith('[main abc123] Save progress', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-success',
        });
        expect(fixture.componentInstance.isCommitting).toBe(false);
    });

    it('shows a fallback success snackbar when Git returns no output', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        http.expectOne('http://localhost:3000/git/commit')
            .flush({ data: { stdout: '', stderr: '' } });

        expect(snackbarOpen).toHaveBeenCalledWith('Changes committed.', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-success',
        });
    });

    it('shows the server commit error in a snackbar', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        http.expectOne('http://localhost:3000/git/commit')
            .flush({ error: { message: 'Git commit failed' } }, { status: 500, statusText: 'Error' });

        expect(snackbarOpen).toHaveBeenCalledWith('Git commit failed', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-error',
        });
        expect(fixture.componentInstance.isCommitting).toBe(false);
    });

    it('falls back to the HTTP message when the server error message is invalid', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        http.expectOne('http://localhost:3000/git/commit')
            .flush({ error: { message: 500 } }, { status: 500, statusText: 'Error' });

        expect(snackbarOpen).toHaveBeenCalledWith('Unable to commit changes.', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-error',
        });
    });

    it('shows a fallback error for non-Error failures', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.bs.commitChanges = () => throwError(() => 'failure');

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        expect(snackbarOpen).toHaveBeenCalledWith('Unable to commit changes.', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-error',
        });
    });

    it('shows the error message for Error failures', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.bs.commitChanges = () => throwError(() => new Error('Network failure'));

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        expect(snackbarOpen).toHaveBeenCalledWith('Network failure', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-error',
        });
    });
});
