import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { GitLogEntry } from '../../backend.service';
import { GitLogRefreshService } from '../../git-log-refresh.service';
import { GitLogComponent } from './git-log.component';

describe('GitLogComponent', () => {
    let fixture: ComponentFixture<GitLogComponent>;
    let http: HttpTestingController;

    beforeEach(async () => {
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        await TestBed.configureTestingModule({
            imports: [GitLogComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    function createComponent(): void {
        fixture = TestBed.createComponent(GitLogComponent);
        fixture.detectChanges();
    }

    function expectGitLogRequest() {
        return http.expectOne('http://localhost:3000/git/log');
    }

    it('loads and displays commit details on initialization', () => {
        const entries: GitLogEntry[] = [{
            hash: '1234567890abcdef',
            author: 'Test Author',
            date: '2026-10-04T12:00:00Z',
            subject: 'Add git log view',
        }];
        createComponent();
        expectGitLogRequest().flush({ data: entries });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Add git log view');
        expect(fixture.nativeElement.textContent).toContain('Test Author');
        expect(fixture.nativeElement.textContent).toContain('12345678');
        expect(fixture.nativeElement.querySelector('time').getAttribute('datetime'))
            .toBe('2026-10-04T12:00:00Z');
    });

    it('shows an empty state when there are no commits', () => {
        createComponent();
        expectGitLogRequest().flush({ data: [] });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('No commits yet.');
    });

    it('shows an error when loading the git log fails', () => {
        createComponent();
        expectGitLogRequest().flush(
            { error: { message: 'Network unavailable' } },
            { status: 500, statusText: 'Error' },
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
            .toContain('Could not load Git log');
    });

    it('does not send another request while a commit list request is pending', () => {
        createComponent();

        fixture.componentInstance.loadGitLog();

        const requests = http.match('http://localhost:3000/git/log');
        expect(requests).toHaveLength(1);
        requests[0].flush({ data: [] });
    });

    it('refreshes the commit list when requested', () => {
        createComponent();
        expectGitLogRequest().flush({ data: [] });
        fixture.detectChanges();

        TestBed.inject(GitLogRefreshService).refresh();

        expectGitLogRequest().flush({ data: [] });
    });

    it('refreshes after the current request finishes if a refresh is requested while loading', () => {
        createComponent();

        TestBed.inject(GitLogRefreshService).refresh();
        expectGitLogRequest().flush({ data: [] });

        expectGitLogRequest().flush({ data: [] });
    });
});
