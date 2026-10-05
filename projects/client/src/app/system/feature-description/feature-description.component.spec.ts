import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import type { PPTFeature } from '@ppt';
import { FeatureDescriptionComponent } from './feature-description.component';

describe('FeatureDescriptionComponent', () => {
    let fixture: ComponentFixture<FeatureDescriptionComponent>;
    let http: HttpTestingController;
    const host = 'http://localhost:3000/';
    const openFeature: PPTFeature = {
        id: '123e4567-e89b-42d3-a456-426614174000',
        priority: 'Low',
        status: 'Wished',
        description: 'Open feature',
    };

    beforeEach(async () => {
        (window as Window & { host?: string }).host = host;
        await TestBed.configureTestingModule({
            imports: [FeatureDescriptionComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(FeatureDescriptionComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        http.verify();
    });

    function flushInitialFeatures(features: PPTFeature[] = []): void {
        http.expectOne(`${host}features`).flush({ data: features });
        fixture.detectChanges();
    }

    it('shows the feature creation form and only an Open list', () => {
        expect(fixture.nativeElement.querySelector('textarea[aria-label="Feature description"]')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('#open-features-heading').textContent).toContain('Open features');
        expect(fixture.nativeElement.querySelectorAll('.open-features li')).toHaveLength(0);
        expect(fixture.nativeElement.querySelector('app-backlog')).toBeNull();
        expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeNull();
        flushInitialFeatures();
    });

    it('shows only Questions, Wished and Backlog features', () => {
        const records: PPTFeature[] = [
            { ...openFeature, status: 'Questions' },
            openFeature,
            { ...openFeature, status: 'Backlog' },
            { ...openFeature, id: '123e4567-e89b-42d3-a456-426614174001', status: 'Queued' },
            { ...openFeature, id: '123e4567-e89b-42d3-a456-426614174002', status: 'Done' },
        ];
        flushInitialFeatures(records);

        const rows = fixture.nativeElement.querySelectorAll('.open-feature');
        expect(rows).toHaveLength(3);
        expect(fixture.nativeElement.textContent).toContain('Open feature');
        expect(fixture.nativeElement.textContent).not.toContain('123e4567-e89b-42d3-a456-426614174001');
        expect(fixture.nativeElement.textContent).not.toContain('123e4567-e89b-42d3-a456-426614174002');
    });

    it('creates a trimmed feature and adds it to the Open list', () => {
        flushInitialFeatures();
        const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
        textarea.value = '  New   feature  ';
        textarea.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

        const request = http.expectOne(`${host}features`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ description: 'New   feature' });
        request.flush({ data: { ...openFeature, description: 'New feature' } });
        fixture.detectChanges();

        expect(fixture.componentInstance.description).toBe('');
        expect(fixture.nativeElement.textContent).toContain('New feature');
        expect(fixture.componentInstance.isSubmitting).toBe(false);
    });

    it('reports submission errors and allows retrying', () => {
        flushInitialFeatures();
        fixture.componentInstance.description = 'Will fail';
        fixture.componentInstance.submit();
        http.expectOne(`${host}features`).flush(
            { error: { message: 'Feature submission failed.' } },
            { status: 500, statusText: 'Server Error' },
        );
        fixture.detectChanges();

        expect(fixture.componentInstance.isSubmitting).toBe(false);
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
            .toContain('Http failure response');
    });

    it('does not submit blank descriptions or duplicate submissions', () => {
        flushInitialFeatures();
        fixture.componentInstance.submit();
        expect(fixture.componentInstance.isSubmitting).toBe(false);

        fixture.componentInstance.description = 'Feature';
        fixture.componentInstance.isSubmitting = true;
        fixture.componentInstance.submit();
        expect(fixture.componentInstance.isSubmitting).toBe(true);
        http.expectNone(`${host}features`);
    });

    it('shows feature-list errors and can recover after a refresh', () => {
        http.expectOne(`${host}features`).flush(
            { error: { message: 'Feature list unavailable.' } },
            { status: 500, statusText: 'Server Error' },
        );
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#feature-list-error').textContent)
            .toContain('Http failure response');

        fixture.componentInstance.refreshFeatures();
        flushInitialFeatures([openFeature]);
        expect(fixture.nativeElement.querySelectorAll('.open-feature')).toHaveLength(1);
        expect(fixture.componentInstance.featuresError).toBe('');
    });
});
