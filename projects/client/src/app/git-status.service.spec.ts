import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GitStatusService } from './git-status.service';

describe('GitStatusService', () => {
    let service: GitStatusService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(GitStatusService);
        http = TestBed.inject(HttpTestingController);
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
    });

    afterEach(() => {
        service.stopPolling();
        http.verify();
    });

    it('shows the checking state before polling starts', () => {
        expect(service.count).toBe('…');
        expect(service.label).toBe('Checking changes…');
        expect(service.tooltip).toBe('Checking changes…');
    });

    it('polls the status endpoint and avoids duplicate polling subscriptions', () => {
        service.startPolling();
        service.startPolling();

        http.expectOne('http://localhost:3000/git/status').flush({
            data: { branch: 'main', ahead: 0, behind: 0, clean: true, files: [] },
        });
        http.expectNone('http://localhost:3000/git/status');

        expect(service.count).toBe('0');
        expect(service.label).toBe('No open changes');
        expect(service.tooltip).toBe('Branch: main\nNo open changes');

        service.stopPolling();
        service.stopPolling();
    });

    it('does not duplicate an in-flight status request', () => {
        service.startPolling();
        service.refresh();

        const requests = http.match('http://localhost:3000/git/status');
        expect(requests).toHaveLength(1);
        requests[0].flush({
            data: { branch: 'main', ahead: 0, behind: 0, clean: true, files: [] },
        });
    });

    it('formats detached branch status and change types in its tooltip', () => {
        service.startPolling();
        http.expectOne('http://localhost:3000/git/status').flush({
            data: {
                branch: null,
                ahead: 0,
                behind: 0,
                clean: false,
                files: [
                    {
                        path: 'conflicted.txt',
                        originalPath: 'old-conflicted.txt',
                        indexStatus: 'U',
                        workTreeStatus: 'U',
                        staged: true,
                        unstaged: true,
                        untracked: false,
                        conflicted: true,
                    },
                    {
                        path: 'new.txt',
                        indexStatus: '?',
                        workTreeStatus: '?',
                        staged: false,
                        unstaged: true,
                        untracked: true,
                        conflicted: false,
                    },
                    {
                        path: 'staged.txt',
                        indexStatus: 'M',
                        workTreeStatus: ' ',
                        staged: true,
                        unstaged: false,
                        untracked: false,
                        conflicted: false,
                    },
                    {
                        path: 'unstaged.txt',
                        indexStatus: ' ',
                        workTreeStatus: 'M',
                        staged: false,
                        unstaged: true,
                        untracked: false,
                        conflicted: false,
                    },
                    {
                        path: 'changed.txt',
                        indexStatus: ' ',
                        workTreeStatus: ' ',
                        staged: false,
                        unstaged: false,
                        untracked: false,
                        conflicted: false,
                    },
                ],
            },
        });

        expect(service.tooltip).toBe([
            'Branch: Detached HEAD',
            'old-conflicted.txt → conflicted.txt (conflict, staged, unstaged)',
            'new.txt (untracked)',
            'staged.txt (staged)',
            'unstaged.txt (unstaged)',
            'changed.txt (changed)',
        ].join('\n'));
    });

    it('stops polling safely before it has started', () => {
        service.stopPolling();

        expect(service.count).toBe('…');
        http.expectNone('http://localhost:3000/git/status');
    });

    it('shows API error details and supports restarting polling', () => {
        service.startPolling();
        http.expectOne('http://localhost:3000/git/status')
            .flush({ error: { message: 'Repository unavailable' } }, { status: 500, statusText: 'Error' });

        expect(service.count).toBe('!');
        expect(service.label).toBe('Git status unavailable');
        expect(service.tooltip).toBe('Repository unavailable');

        service.stopPolling();
        service.startPolling();
        http.expectOne('http://localhost:3000/git/status').flush({
            data: { branch: 'feature', ahead: 1, behind: 2, clean: false, files: [] },
        });
        expect(service.tooltip).toBe('Branch: feature (1 ahead, 2 behind)\nNo open changes');
        service.stopPolling();
    });
});
