import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { DevEnvCloneDialogComponent } from './devenv-clone-dialog.component';

describe('DevEnvCloneDialogComponent', () => {
    let fixture: ComponentFixture<DevEnvCloneDialogComponent>;
    let http: HttpTestingController;
    let close: jest.MockedFunction<MatDialogRef<DevEnvCloneDialogComponent>['close']>;

    beforeEach(async () => {
        close = jest.fn<MatDialogRef<DevEnvCloneDialogComponent>['close']>();
        await TestBed.configureTestingModule({
            imports: [DevEnvCloneDialogComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: MatDialogRef, useValue: { close } },
            ],
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
        request.flush({ data: { destination: 'C:\\exports\\devenv', replacedExisting: true } });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="status"]').textContent)
            .toContain('Clone exported to C:\\exports\\devenv');
        expect(fixture.nativeElement.textContent).toContain('Existing destination contents were replaced.');
        expect(close).not.toHaveBeenCalled();
    });

    it('reports export failures explicitly and can close after success', () => {
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

        fixture.componentInstance.destination = 'C:\\exports\\devenv';
        fixture.componentInstance.submit();
        http.expectOne('http://localhost:3000/devenv/clone').flush({
            data: { destination: 'C:\\exports\\devenv', replacedExisting: false },
        });
        fixture.componentInstance.close();
        expect(close).toHaveBeenCalled();
    });
});
