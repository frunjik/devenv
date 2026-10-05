import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { FeatureWorkService } from './feature-work.service';
import { MainComponent } from './system/main/main.component';
import { AppComponent } from './app.component';

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
                    component: MainComponent,
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

    it('marks the active feature committed only after Git reports a successful commit', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        const featureWork = TestBed.inject(FeatureWorkService);
        featureWork.start('123e4567-e89b-42d3-a456-426614174000', 'Add a feature');
        await TestBed.inject(Router).navigateByUrl('/git/log');

        fixture.componentInstance.commitChanges();
        http.expectOne('http://localhost:3000/git/log').flush({ data: [] });

        const commitDialog = TestBed.inject(MatDialog).openDialogs[0].componentInstance;
        commitDialog.message = 'Complete feature';
        commitDialog.submit();
        await fixture.whenStable();

        http.expectOne('http://localhost:3000/git/commit').flush({
            data: { stdout: 'Committed', stderr: '' },
        });
        expect(featureWork.activeFeature?.id).toBe('123e4567-e89b-42d3-a456-426614174000');
        const statusRequest = http.expectOne('http://localhost:3000/features/123e4567-e89b-42d3-a456-426614174000/status');
        expect(statusRequest.request.method).toBe('PATCH');
        expect(statusRequest.request.body).toEqual({ status: 'Committed' });
        statusRequest.flush({ data: 'committed feature entry' });
        http.expectOne('http://localhost:3000/task').flush({ data: null });
        http.expectOne('http://localhost:3000/git/status').flush({
            data: { branch: 'main', ahead: 0, behind: 0, clean: true, files: [] },
        });
        http.expectOne('http://localhost:3000/git/log').flush({ data: [] });

        expect(featureWork.activeFeature).toBeNull();
        fixture.destroy();
    });

    it('keeps the active feature and does not remove it when the Git commit fails', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        const featureWork = TestBed.inject(FeatureWorkService);
        featureWork.start('123e4567-e89b-42d3-a456-426614174000', 'Add a feature');
        await TestBed.inject(Router).navigateByUrl('/git/log');

        fixture.componentInstance.commitChanges();
        http.expectOne('http://localhost:3000/git/log').flush({ data: [] });
        const commitDialog = TestBed.inject(MatDialog).openDialogs[0].componentInstance;
        commitDialog.message = 'Complete feature';
        commitDialog.submit();
        await fixture.whenStable();

        http.expectOne('http://localhost:3000/git/commit').flush(
            { error: { message: 'Commit failed' } },
            { status: 500, statusText: 'Error' },
        );

        expect(featureWork.activeFeature?.id).toBe('123e4567-e89b-42d3-a456-426614174000');
        http.expectNone('http://localhost:3000/features/123e4567-e89b-42d3-a456-426614174000/status');
        fixture.destroy();
    });

    it('keeps the active feature and reports an error if marking it committed fails', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        const featureWork = TestBed.inject(FeatureWorkService);
        featureWork.start('123e4567-e89b-42d3-a456-426614174000', 'Add a feature');
        await TestBed.inject(Router).navigateByUrl('/git/log');

        fixture.componentInstance.commitChanges();
        http.expectOne('http://localhost:3000/git/log').flush({ data: [] });
        const commitDialog = TestBed.inject(MatDialog).openDialogs[0].componentInstance;
        commitDialog.message = 'Complete feature';
        commitDialog.submit();
        await fixture.whenStable();

        http.expectOne('http://localhost:3000/git/commit').flush({
            data: { stdout: 'Committed', stderr: '' },
        });
        http.expectOne('http://localhost:3000/features/123e4567-e89b-42d3-a456-426614174000/status')
            .flush({ error: { message: 'Feature status update failed' } }, { status: 500, statusText: 'Error' });
        http.expectOne('http://localhost:3000/git/status').flush({
            data: { branch: 'main', ahead: 0, behind: 0, clean: true, files: [] },
        });
        http.expectOne('http://localhost:3000/git/log').flush({ data: [] });

        expect(featureWork.activeFeature?.id).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(document.body.textContent).toContain('could not be marked committed');
        expect(document.body.textContent).toContain('Feature status update failed');
        fixture.destroy();
    });
});
