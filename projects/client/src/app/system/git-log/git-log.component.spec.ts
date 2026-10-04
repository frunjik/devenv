import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BackendService, type GitLogEntry } from '../../backend.service';
import { GitLogComponent } from './git-log.component';

describe('GitLogComponent', () => {
    let fixture: ComponentFixture<GitLogComponent>;
    let getGitLog: jest.MockedFunction<BackendService['getGitLog']>;

    beforeEach(async () => {
        getGitLog = jest.fn<BackendService['getGitLog']>();
        await TestBed.configureTestingModule({
            imports: [GitLogComponent],
            providers: [{ provide: BackendService, useValue: { getGitLog } }],
        }).compileComponents();
    });

    function createComponent(): void {
        fixture = TestBed.createComponent(GitLogComponent);
        fixture.detectChanges();
    }

    it('loads and displays commit details on initialization', () => {
        const entries: GitLogEntry[] = [{
            hash: '1234567890abcdef',
            author: 'Test Author',
            date: '2026-10-04T12:00:00Z',
            subject: 'Add git log view',
        }];
        getGitLog.mockReturnValue(of(entries));

        createComponent();

        expect(getGitLog).toHaveBeenCalledTimes(1);
        expect(fixture.nativeElement.textContent).toContain('Add git log view');
        expect(fixture.nativeElement.textContent).toContain('Test Author');
        expect(fixture.nativeElement.textContent).toContain('12345678');
        expect(fixture.nativeElement.querySelector('time').getAttribute('datetime'))
            .toBe('2026-10-04T12:00:00Z');
    });

    it('shows an empty state when there are no commits', () => {
        getGitLog.mockReturnValue(of([]));

        createComponent();

        expect(fixture.nativeElement.textContent).toContain('No commits yet.');
    });

    it('shows an error when loading the git log fails', () => {
        getGitLog.mockReturnValue(throwError(() => new Error('Network unavailable')));

        createComponent();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
            .toContain('Network unavailable');
    });

    it('refreshes the commit list when requested', () => {
        getGitLog.mockReturnValue(of([]));
        createComponent();

        fixture.nativeElement.querySelector('button').click();

        expect(getGitLog).toHaveBeenCalledTimes(2);
    });
});
