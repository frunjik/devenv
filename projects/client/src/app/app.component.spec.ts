import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { of, throwError } from 'rxjs';
import { CommitMessageDialogComponent } from './commit-message-dialog/commit-message-dialog.component';
import { GitLogRefreshService } from './git-log-refresh.service';

describe('AppComponent', () => {
    let http: HttpTestingController;
    let snackbarOpen: jest.MockedFunction<MatSnackBar['open']>;
    let navigateByUrl: jest.SpiedFunction<Router['navigateByUrl']>;
    let dialogOpen: jest.Mock;

    async function startCommit(fixture: ComponentFixture<AppComponent>): Promise<void> {
        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        const refreshRequest = http.expectOne('http://localhost:3000/git/log');
        expect(refreshRequest.request.method).toBe('GET');
        refreshRequest.flush({ data: [] });
        await fixture.whenStable();
    }

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

    afterEach(() => {
        http.match('http://localhost:3000/current').forEach(request => request.flush({ data: null }));
        http.match('http://localhost:3000/git/status').forEach(request => request.flush({
            data: { branch: null, ahead: 0, behind: 0, clean: true, files: [] },
        }));
        http.verify();
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

    it('shows and updates the latest current entry on the right side of the toolbar', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        http.expectOne('http://localhost:3000/current').flush({
            data: '// [2026-10-04 22:23 +02:00] First current entry',
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.current-entry').textContent.trim())
            .toBe('First current entry');
        expect(fixture.debugElement.query(By.css('.current-entry')).injector.get(MatTooltip).message)
            .toBe('// [2026-10-04 22:23 +02:00] First current entry');
        const currentTooltip = fixture.debugElement.query(By.css('.current-entry')).injector.get(MatTooltip);
        expect(currentTooltip.tooltipClass).toBe('current-entry-tooltip');
        expect(currentTooltip.position).toBe('below');

        fixture.componentInstance.currentEntry.startPolling();
        fixture.componentInstance.currentEntry.refresh();
        http.expectOne('http://localhost:3000/current').flush({
            data: '// [2026-10-04 22:24 +02:00] Updated current entry',
        });
        fixture.detectChanges();

        const entry = fixture.nativeElement.querySelector('.current-entry');
        expect(entry.textContent.trim()).toBe('Updated current entry');
        expect(entry.compareDocumentPosition(fixture.nativeElement.querySelector('nav'))
            & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
        fixture.destroy();
        fixture.componentInstance.currentEntry.stopPolling();
    });

    it('refreshes the current entry when its toolbar control is clicked', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        http.expectOne('http://localhost:3000/current').flush({
            data: '// [2026-10-04 22:23 +02:00] Previous entry',
        });
        fixture.detectChanges();

        fixture.nativeElement.querySelector('.current-entry').click();

        const refreshRequest = http.expectOne('http://localhost:3000/current');
        expect(refreshRequest.request.method).toBe('GET');
        refreshRequest.flush({ data: '// [2026-10-04 22:35 +02:00] Refreshed entry' });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.current-entry').textContent.trim())
            .toBe('Refreshed entry');
        fixture.destroy();
    });

    it('shows an error if the current entry cannot be loaded', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        http.expectOne('http://localhost:3000/current').flush(
            { error: { message: 'Current entry unavailable' } },
            { status: 500, statusText: 'Error' },
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.current-entry').textContent)
            .toContain('Http failure response');
        fixture.destroy();
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

    it('shows the number of open changes from the git status API', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        http.expectOne('http://localhost:3000/git/status').flush({
            data: {
                branch: 'main',
                ahead: 0,
                behind: 0,
                clean: false,
                files: [
                    {
                        path: 'one.txt',
                        indexStatus: 'M',
                        workTreeStatus: ' ',
                        staged: true,
                        unstaged: false,
                        untracked: false,
                        conflicted: false,
                    },
                    {
                        path: 'two.txt',
                        indexStatus: ' ',
                        workTreeStatus: 'M',
                        staged: false,
                        unstaged: true,
                        untracked: false,
                        conflicted: false,
                    },
                ],
            },
        });
        fixture.detectChanges();

        const indicator = fixture.nativeElement.querySelector('.git-status-indicator');
        expect(indicator.textContent.trim()).toBe('2');
        expect(indicator.getAttribute('aria-label')).toBe('Git status: 2 open changes');
        expect(fixture.componentInstance.gitStatus.tooltip).toContain('Branch: main');
        expect(fixture.componentInstance.gitStatus.tooltip).toContain('one.txt (staged)');
        expect(fixture.componentInstance.gitStatus.tooltip).toContain('two.txt (unstaged)');
        expect(indicator.classList).toContain('git-status-open');
        const commitButton = fixture.nativeElement.querySelector('.commit-button');
        expect(commitButton.compareDocumentPosition(indicator) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('shows a clean status when there are no open changes', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        http.expectOne('http://localhost:3000/git/status').flush({
            data: { branch: 'main', ahead: 0, behind: 0, clean: true, files: [] },
        });
        fixture.detectChanges();

        const indicator = fixture.nativeElement.querySelector('.git-status-indicator');
        expect(indicator.textContent.trim()).toBe('0');
        expect(indicator.getAttribute('aria-label')).toBe('Git status: No open changes');
        expect(indicator.classList).toContain('git-status-clean');
    });

    it('includes ahead and behind counts and caps long file lists in the tooltip', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        http.expectOne('http://localhost:3000/git/status').flush({
            data: {
                branch: 'feature',
                ahead: 2,
                behind: 3,
                clean: false,
                files: Array.from({ length: 10 }, (_, index) => ({
                    path: `file-${index}.txt`,
                    indexStatus: '?',
                    workTreeStatus: '?',
                    staged: false,
                    unstaged: true,
                    untracked: true,
                    conflicted: false,
                })),
            },
        });
        fixture.detectChanges();

        const indicator = fixture.nativeElement.querySelector('.git-status-indicator');
        const tooltip = fixture.componentInstance.gitStatus.tooltip;
        expect(tooltip).toContain('Branch: feature (2 ahead, 3 behind)');
        expect(tooltip).toContain('file-7.txt (untracked)');
        expect(tooltip).not.toContain('file-8.txt');
        expect(tooltip).toContain('…and 2 more');
        expect(indicator.hasAttribute('title')).toBe(false);
    });

    it('shows when the git status cannot be retrieved', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();

        http.expectOne('http://localhost:3000/git/status')
            .flush({ error: { message: 'Not a repository' } }, { status: 500, statusText: 'Error' });
        fixture.detectChanges();

        const indicator = fixture.nativeElement.querySelector('.git-status-indicator');
        expect(indicator.textContent.trim()).toBe('!');
        expect(indicator.getAttribute('aria-label')).toBe('Git status: Git status unavailable');
        expect(fixture.componentInstance.gitStatus.tooltip).toContain('Not a repository');
        expect(indicator.classList).toContain('git-status-error');
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
        expect(dialogOpen).not.toHaveBeenCalled();
        http.expectOne('http://localhost:3000/git/log').flush({ data: [] });
        await fixture.whenStable();
        expect(order).toEqual(['navigate', 'dialog']);
        expect(dialogOpen).toHaveBeenCalledWith(CommitMessageDialogComponent, {
            width: 'min(32rem, calc(100vw - 2rem))',
            ariaLabel: 'Commit changes',
            data: { message: '' },
        });
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('uses the current entry summary as the default commit message', async () => {
        dialogOpen.mockImplementation(() => ({ afterClosed: () => of(undefined) }));
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.currentEntry.entry = '// [2026-10-04 22:23 +02:00] Implement toolbar feature';

        await startCommit(fixture);

        expect(dialogOpen).toHaveBeenCalledWith(CommitMessageDialogComponent, {
            width: 'min(32rem, calc(100vw - 2rem))',
            ariaLabel: 'Commit changes',
            data: { message: 'Implement toolbar feature' },
        });
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('does not commit when the dialog is cancelled', async () => {
        dialogOpen.mockImplementation(() => ({ afterClosed: () => of(undefined) }));
        const fixture = TestBed.createComponent(AppComponent);

        await startCommit(fixture);

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
        const refreshGitLog = jest.spyOn(TestBed.inject(GitLogRefreshService), 'refresh');
        const fixture = TestBed.createComponent(AppComponent);
        await startCommit(fixture);

        const request = http.expectOne('http://localhost:3000/git/commit');
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ message: 'Save progress' });
        request.flush({ data: { stdout: '[main abc123] Save progress', stderr: '' } });
        http.expectOne('http://localhost:3000/git/log').flush({ data: [] });

        expect(snackbarOpen).toHaveBeenCalledWith('[main abc123] Save progress', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-success',
        });
        expect(fixture.componentInstance.isCommitting).toBe(false);
        expect(refreshGitLog).toHaveBeenCalledTimes(2);
    });

    it('shows a fallback success snackbar when Git returns no output', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        await startCommit(fixture);

        http.expectOne('http://localhost:3000/git/commit')
            .flush({ data: { stdout: '', stderr: '' } });
        http.expectOne('http://localhost:3000/git/log').flush({ data: [] });

        expect(snackbarOpen).toHaveBeenCalledWith('Changes committed.', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-success',
        });
    });

    it('shows a fallback message when Git log refresh fails without an Error', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.bs.getGitLog = () => throwError(() => 'failure');

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        expect(dialogOpen).not.toHaveBeenCalled();
        expect(snackbarOpen).toHaveBeenCalledWith(
            'Could not refresh Git log: Unknown error',
            'Dismiss',
            { duration: 5000, panelClass: 'commit-snackbar-error' },
        );
    });

    it('shows the Error message when Git log refresh fails', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.bs.getGitLog = () => throwError(() => new Error('Refresh failed'));

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        expect(snackbarOpen).toHaveBeenCalledWith(
            'Could not refresh Git log: Refresh failed',
            'Dismiss',
            { duration: 5000, panelClass: 'commit-snackbar-error' },
        );
    });

    it('reports when the Git log cannot refresh after a successful commit', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        await startCommit(fixture);

        http.expectOne('http://localhost:3000/git/commit')
            .flush({ data: { stdout: '[main abc123] Save progress', stderr: '' } });
        http.expectOne('http://localhost:3000/git/log').flush(
            { error: { message: 'Git log unavailable' } },
            { status: 500, statusText: 'Error' },
        );

        expect(snackbarOpen).toHaveBeenLastCalledWith(
            'Changes committed, but the Git log could not be refreshed: Http failure response for http://localhost:3000/git/log: 500 Error',
            'Dismiss',
            { duration: 5000, panelClass: 'commit-snackbar-error' },
        );
    });

    it('shows the server commit error in a snackbar', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        await startCommit(fixture);

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
        await startCommit(fixture);

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

        await startCommit(fixture);

        expect(snackbarOpen).toHaveBeenCalledWith('Unable to commit changes.', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-error',
        });
    });

    it('shows the error message for Error failures', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.bs.commitChanges = () => throwError(() => new Error('Network failure'));

        await startCommit(fixture);

        expect(snackbarOpen).toHaveBeenCalledWith('Network failure', 'Dismiss', {
            duration: 5000,
            panelClass: 'commit-snackbar-error',
        });
    });
});
