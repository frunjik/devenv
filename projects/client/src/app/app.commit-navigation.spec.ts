import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from './app.component';

@Component({
    selector: 'app-test-git-log-route',
    standalone: true,
    templateUrl: './test-git-log-route.component.html',
})
class TestGitLogRouteComponent {}

describe('AppComponent commit navigation', () => {
    let http: HttpTestingController;
    let allowGitLogNavigation: boolean;
    let failGitLogNavigation: boolean;

    beforeEach(async () => {
        allowGitLogNavigation = true;
        failGitLogNavigation = false;
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        await TestBed.configureTestingModule({
            imports: [AppComponent, MatDialogModule, NoopAnimationsModule],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([{
                    path: 'git/log',
                    component: TestGitLogRouteComponent,
                    canActivate: [() => {
                        if (failGitLogNavigation) {
                            throw new Error('Git log navigation failed');
                        }
                        return allowGitLogNavigation;
                    }],
                }]),
            ],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.match('http://localhost:3000/tests/cache/status').forEach(request => request.flush({
            data: {
                available: false,
                status: 'empty',
                startedAt: null,
                finishedAt: null,
                exitCode: null,
            },
        }));
        http.verify();
    });

    it('opens the commit dialog when already on the Git log route', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        await TestBed.inject(Router).navigateByUrl('/git/log');
        fixture.componentInstance.commitChanges();

        expect(document.querySelector('mat-dialog-container')).toBeNull();
        http.expectOne('http://localhost:3000/git/log').flush({ data: [] });
        expect(document.querySelector('mat-dialog-container')).not.toBeNull();
        expect(document.querySelector('textarea[aria-label="Commit message"]')).not.toBeNull();
        TestBed.inject(MatDialog).closeAll();
        fixture.destroy();
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('does not open the commit dialog when the Git log refresh fails', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        http.expectOne('http://localhost:3000/git/log').flush(
            { error: { message: 'Git log unavailable' } },
            { status: 500, statusText: 'Error' },
        );

        expect(document.querySelector('mat-dialog-container')).toBeNull();
        expect(fixture.componentInstance.isCommitDialogOpen).toBe(false);
        expect(document.body.textContent).toContain('Could not refresh Git log');
        http.expectNone('http://localhost:3000/git/commit');
        fixture.destroy();
    });

    it('does not open the dialog when navigation to the Git log is cancelled', async () => {
        allowGitLogNavigation = false;
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        expect(TestBed.inject(Router).url).not.toBe('/git/log');
        expect(document.querySelector('mat-dialog-container')).toBeNull();
        expect(fixture.componentInstance.isCommitDialogOpen).toBe(false);
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('shows a snackbar when navigation to the Git log fails', async () => {
        failGitLogNavigation = true;
        const fixture = TestBed.createComponent(AppComponent);

        fixture.componentInstance.commitChanges();
        await fixture.whenStable();

        expect(fixture.componentInstance.isCommitDialogOpen).toBe(false);
        expect(document.body.textContent).toContain('Git log navigation failed');
        http.expectNone('http://localhost:3000/git/commit');
        fixture.destroy();
    });

});
