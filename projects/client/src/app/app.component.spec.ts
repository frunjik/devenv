import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';

describe('AppComponent', () => {
    let http: HttpTestingController;
    let snackbarOpen: jest.MockedFunction<MatSnackBar['open']>;
    let navigateByUrl: jest.SpiedFunction<Router['navigateByUrl']>;
    const originalPrompt = window.prompt;

    beforeEach(async () => {
        snackbarOpen = jest.fn<MatSnackBar['open']>();
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([])
            ]
        })
            .overrideComponent(AppComponent, {
                add: { providers: [{ provide: MatSnackBar, useValue: { open: snackbarOpen } }] },
            })
            .compileComponents();
        http = TestBed.inject(HttpTestingController);
        navigateByUrl = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    });

    afterEach(() => {
        http.verify();
        window.prompt = originalPrompt;
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

    it('navigates to the git log before prompting for a commit message', async () => {
        const order: string[] = [];
        navigateByUrl.mockImplementation(async () => {
            order.push('navigate');
            return true;
        });
        window.prompt = () => {
            order.push('prompt');
            return null;
        };
        const fixture = TestBed.createComponent(AppComponent);

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        expect(navigateByUrl).toHaveBeenCalledWith('/git/log');
        expect(order).toEqual(['navigate', 'prompt']);
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('does not commit when the prompt is cancelled', async () => {
        window.prompt = () => null;
        const fixture = TestBed.createComponent(AppComponent);

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        http.expectNone('http://localhost:3000/git/commit');
    });

    it('does not prompt for another commit while one is already running', () => {
        let promptCalled = false;
        window.prompt = () => {
            promptCalled = true;
            return 'another commit';
        };
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.isCommitting = true;

        fixture.componentInstance.commitChanges();

        expect(promptCalled).toBe(false);
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('shows a snackbar when the commit message is empty', async () => {
        window.prompt = () => '   ';
        const fixture = TestBed.createComponent(AppComponent);

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        expect(snackbarOpen).toHaveBeenCalledWith('A commit message is required.', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-error',
        });
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('posts the prompted message and shows commit output in a snackbar', async () => {
        window.prompt = () => 'Save progress';
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
        window.prompt = () => 'Save progress';
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
        window.prompt = () => 'Save progress';
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
        window.prompt = () => 'Save progress';
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
        window.prompt = () => 'Save progress';
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
        window.prompt = () => 'Save progress';
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
