import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

describe('AppComponent', () => {
    let http: HttpTestingController;
    const originalPrompt = window.prompt;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([])
            ]
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
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

    it('does not commit when the prompt is cancelled', () => {
        window.prompt = () => null;
        const fixture = TestBed.createComponent(AppComponent);

        fixture.componentInstance.commitChanges();

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

    it('requires a non-empty commit message', () => {
        window.prompt = () => '   ';
        const fixture = TestBed.createComponent(AppComponent);

        fixture.componentInstance.commitChanges();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('A commit message is required.');
        http.expectNone('http://localhost:3000/git/commit');
    });

    it('posts the prompted message and displays the commit result', () => {
        window.prompt = () => 'Save progress';
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();

        const request = http.expectOne('http://localhost:3000/git/commit');
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ message: 'Save progress' });
        request.flush({ data: { stdout: '[main abc123] Save progress', stderr: '' } });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('[main abc123] Save progress');
        expect(fixture.componentInstance.isCommitting).toBe(false);
    });

    it('shows a fallback success message when Git returns no output', () => {
        window.prompt = () => 'Save progress';
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();

        http.expectOne('http://localhost:3000/git/commit')
            .flush({ data: { stdout: '', stderr: '' } });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Changes committed.');
    });

    it('shows the server commit error', () => {
        window.prompt = () => 'Save progress';
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();

        http.expectOne('http://localhost:3000/git/commit')
            .flush({ error: { message: 'Git commit failed' } }, { status: 500, statusText: 'Error' });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Git commit failed');
        expect(fixture.componentInstance.isCommitting).toBe(false);
    });

    it('falls back to the HTTP message when the server error message is invalid', () => {
        window.prompt = () => 'Save progress';
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.commitChanges();

        http.expectOne('http://localhost:3000/git/commit')
            .flush({ error: { message: 500 } }, { status: 500, statusText: 'Error' });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Unable to commit changes.');
    });

    it('shows a fallback error for non-Error failures', () => {
        window.prompt = () => 'Save progress';
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.bs.commitChanges = () => throwError(() => 'failure');

        fixture.componentInstance.commitChanges();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Unable to commit changes.');
    });

    it('shows the error message for Error failures', () => {
        window.prompt = () => 'Save progress';
        const fixture = TestBed.createComponent(AppComponent);
        fixture.componentInstance.bs.commitChanges = () => throwError(() => new Error('Network failure'));

        fixture.componentInstance.commitChanges();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Network failure');
    });
});
