import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { SystemPlanConcern } from '@shared';
import { SystemPlanComponent } from './system-plan.component';

const concerns: SystemPlanConcern[] = [
    {
        id: 'SC-001',
        title: 'Distinguish input from ticket',
        kind: 'Domain',
        status: 'Validated',
        dependsOn: [],
        summary: 'Clarify the difference between raw input and a Problem Ticket.',
    },
    {
        id: 'SC-002',
        title: 'Preserve source provenance',
        kind: 'Behavior',
        status: 'In progress',
        dependsOn: ['SC-001'],
        summary: 'Keep each interpretation traceable to its source.',
    },
    {
        id: 'SC-003',
        title: 'Build the converted-items list',
        kind: 'Implementation',
        status: 'Ready',
        dependsOn: ['SC-001', 'SC-002'],
        summary: 'Implement the accepted-notes list.',
    },
];

describe('SystemPlanComponent', () => {
    let fixture: ComponentFixture<SystemPlanComponent>;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SystemPlanComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(SystemPlanComponent);
        fixture.detectChanges();
    });

    afterEach(() => httpTesting.verify());

    it('loads live concerns and derives plan counts and progress', () => {
        const request = httpTesting.expectOne('http://localhost:3000/system-plan');
        expect(request.request.method).toBe('GET');
        request.flush({ data: concerns });
        fixture.detectChanges();

        const text = fixture.nativeElement.textContent as string;
        expect(text).toContain('System plan');
        expect(text).toContain('1 validated');
        expect(text).toContain('1 in progress');
        expect(text).toContain('1 ready');
        expect(text).toContain('Preserve source provenance');
        expect(fixture.nativeElement.querySelector('progress').value).toBe(1);
        expect(fixture.nativeElement.querySelector('progress').max).toBe(3);
        expect(fixture.nativeElement.querySelector('header a').getAttribute('href'))
            .toBe('/problem-inquiry');
    });

    it('shows live prerequisites and explains the data source', () => {
        httpTesting.expectOne('http://localhost:3000/system-plan').flush({ data: concerns });
        fixture.detectChanges();

        const text = fixture.nativeElement.textContent as string;
        expect(text).toContain('Prerequisites');
        expect(text).toContain('SC-001, SC-002');
        expect(text).toContain('Live data from');
        expect(text).toContain('design/problem-inquiry-system/concerns.md');
        expect(text).not.toContain('manually synchronized');
    });

    it('renders concerns as a list without imposing ordered-list numbering', () => {
        httpTesting.expectOne('http://localhost:3000/system-plan').flush({ data: concerns });
        fixture.detectChanges();

        const list = fixture.nativeElement.querySelector('.concern-list') as HTMLElement;
        const identifiers = fixture.nativeElement.querySelectorAll('.concern-id');
        expect(list.tagName).toBe('UL');
        expect(fixture.nativeElement.querySelector('ol.concern-list')).toBeNull();
        expect(Array.from(identifiers).map((identifier: HTMLElement) => identifier.textContent?.trim()))
            .toEqual(['SC-001', 'SC-002', 'SC-003']);
        expect(fixture.nativeElement.querySelectorAll('.concern-card')).toHaveLength(3);
    });

    it('shows loading and empty-register states', () => {
        expect(fixture.nativeElement.textContent).toContain('Loading plan progress…');
        expect(fixture.nativeElement.textContent).toContain('Loading system concerns…');
        httpTesting.expectOne('http://localhost:3000/system-plan').flush({ data: [] });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('No system concerns are registered.');
        expect(fixture.nativeElement.querySelector('.concern-list')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('0 concerns');
    });

    it('shows a clear error when the plan endpoint fails', () => {
        httpTesting.expectOne('http://localhost:3000/system-plan')
            .flush('Unavailable', { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not load the system plan.');
        expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    });
});
