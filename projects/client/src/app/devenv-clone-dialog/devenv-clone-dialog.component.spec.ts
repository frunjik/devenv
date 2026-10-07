import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DevEnvCloneDialogComponent } from './devenv-clone-dialog.component';

describe('DevEnvCloneDialogComponent', () => {
    let fixture: ComponentFixture<DevEnvCloneDialogComponent>;
    let http: HttpTestingController;
    let close: jest.MockedFunction<MatDialogRef<DevEnvCloneDialogComponent>['close']>;
    let snackbarOpen: jest.MockedFunction<MatSnackBar['open']>;

    beforeEach(async () => {
        close = jest.fn<MatDialogRef<DevEnvCloneDialogComponent>['close']>();
        snackbarOpen = jest.fn<MatSnackBar['open']>();
        await TestBed.configureTestingModule({
            imports: [DevEnvCloneDialogComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: MatDialogRef, useValue: { close } },
            ],
        }).overrideComponent(DevEnvCloneDialogComponent, {
            add: { providers: [{ provide: MatSnackBar, useValue: { open: snackbarOpen } }] },
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(DevEnvCloneDialogComponent);
        fixture.detectChanges();
    });

    afterEach(() => http.verify());

    it('requires an absolute destination and explicit replacement acknowledgement', () => {
        fixture.componentInstance.destination = '  ';
        fixture.componentInstance.replaceExisting = true;
        fixture.componentInstance.submit();
        expect(http.match('http://localhost:3000/devenv/clone')).toHaveLength(0);

        fixture.componentInstance.destination = 'C:\\exports\\devenv';
        fixture.componentInstance.replaceExisting = false;
        fixture.componentInstance.submit();
        expect(http.match('http://localhost:3000/devenv/clone')).toHaveLength(0);
    });

    it('requests the clone and reports a successful replacement', () => {
        fixture.componentInstance.destination = ' C:\\exports\\devenv ';
        fixture.componentInstance.replaceExisting = true;
        fixture.componentInstance.submit();

        const request = http.expectOne('http://localhost:3000/devenv/clone');
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({
            destination: 'C:\\exports\\devenv',
            replaceExisting: true,
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('mat-progress-bar').getAttribute('aria-label'))
            .toBe('Exporting DevEnv');
        expect(close).not.toHaveBeenCalled();
        request.flush({ data: { destination: 'C:\\exports\\devenv', replacedExisting: true } });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeNull();
        expect(snackbarOpen).toHaveBeenCalledWith(
            'Clone exported to C:\\exports\\devenv. Existing destination contents were replaced.',
            'Dismiss',
            { duration: 5000, panelClass: 'save-snackbar-success' },
        );
        expect(close).toHaveBeenCalledTimes(1);
    });

    it('keeps cleanup warnings visible after closing the successful export dialog', () => {
        fixture.componentInstance.destination = 'C:\\exports\\devenv';
        fixture.componentInstance.replaceExisting = true;
        fixture.componentInstance.submit();
        http.expectOne('http://localhost:3000/devenv/clone').flush({
            data: {
                destination: 'C:\\exports\\devenv',
                replacedExisting: true,
                warning: 'Previous destination could not be removed.',
            },
        });

        expect(close).toHaveBeenCalledTimes(1);
        expect(snackbarOpen).toHaveBeenCalledWith(
            expect.stringContaining('Previous destination could not be removed.'),
            'Dismiss',
            { duration: 0, panelClass: 'save-snackbar-error' },
        );
    });

    it('keeps failures open for retry and closes automatically when the retry succeeds', () => {
        fixture.componentInstance.destination = 'C:\\exports\\devenv';
        fixture.componentInstance.replaceExisting = true;
        fixture.componentInstance.submit();
        http.expectOne('http://localhost:3000/devenv/clone').flush(
            { error: { message: 'Destination is inside the source folder.' } },
            { status: 400, statusText: 'Bad Request' },
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
            .toContain('Destination is inside the source folder.');
        expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeNull();
        expect(close).not.toHaveBeenCalled();
        expect(snackbarOpen).not.toHaveBeenCalled();

        fixture.componentInstance.destination = 'C:\\exports\\devenv';
        fixture.componentInstance.submit();
        http.expectOne('http://localhost:3000/devenv/clone').flush({
            data: { destination: 'C:\\exports\\devenv', replacedExisting: false },
        });
        expect(close).toHaveBeenCalledTimes(1);
    });
});
