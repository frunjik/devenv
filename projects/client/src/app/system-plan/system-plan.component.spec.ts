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
        userAcceptance: 'Pending',
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
    {
        id: 'SC-004',
        title: 'Review design',
        kind: 'Design',
        status: 'Validated',
        dependsOn: [],
        summary: 'Review the proposed design.',
        userAcceptance: 'Accepted',
    },
    {
        id: 'SC-005',
        title: 'Review alternative',
        kind: 'Design',
        status: 'Validated',
        dependsOn: [],
        summary: 'Record the alternative for reconsideration.',
        userAcceptance: 'Rejected',
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
        expect(text).toContain('3 validated');
        expect(text).toContain('1 in progress');
        expect(text).toContain('1 ready');
        expect(text).toContain('Preserve source provenance');
        expect(text).toContain('User acceptance');
        expect(text).toContain('Pending');
        expect(text).toContain('Accepted');
        expect(text).toContain('Rejected');
        expect(fixture.nativeElement.querySelector('progress').value).toBe(3);
        expect(fixture.nativeElement.querySelector('progress').max).toBe(5);
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
            .toEqual(['SC-001', 'SC-002', 'SC-003', 'SC-004', 'SC-005']);
        expect(fixture.nativeElement.querySelectorAll('.concern-card')).toHaveLength(5);
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

    it.each([
        [' sc-002 ', ['SC-002']],
        ['DISTINGUISH INPUT', ['SC-001']],
        ['accepted-notes', ['SC-003']],
        ['review', ['SC-004', 'SC-005']],
        ['   ', ['SC-001', 'SC-002', 'SC-003', 'SC-004', 'SC-005']],
    ])('searches IDs, titles, and descriptions for %s without changing plan totals', (query, expected) => {
        httpTesting.expectOne('http://localhost:3000/system-plan').flush({ data: concerns });
        fixture.detectChanges();

        const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
        expect(input).not.toBeNull();
        expect(fixture.nativeElement.querySelector('label[for="concern-search"]').textContent)
            .toContain('Search concerns');
        input.value = query;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        const identifiers = Array.from(
            fixture.nativeElement.querySelectorAll('.concern-id') as NodeListOf<HTMLElement>,
        ).map(element => element.textContent?.trim());
        expect(identifiers).toEqual(expected);
        expect(fixture.nativeElement.querySelector('progress').value).toBe(3);
        expect(fixture.nativeElement.querySelector('progress').max).toBe(5);
        expect(fixture.nativeElement.querySelector('.concern-total').textContent).toContain('5 concerns');
    });

    it.each(['not present', 'Validated', 'Behavior', 'Pending'])(
        'shows no matching concerns for %s and restores the list when cleared',
        query => {
            httpTesting.expectOne('http://localhost:3000/system-plan').flush({ data: concerns });
            fixture.detectChanges();
            const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
            expect(input).not.toBeNull();
            input.value = query;
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            expect(fixture.nativeElement.textContent).toContain('No matching system concerns.');
            expect(fixture.nativeElement.querySelector('.concern-list')).toBeNull();

            input.value = '';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelectorAll('.concern-card')).toHaveLength(5);
            expect(fixture.nativeElement.textContent).not.toContain('No matching system concerns.');
        },
    );

    it('shows a clear error when the plan endpoint fails', () => {
        httpTesting.expectOne('http://localhost:3000/system-plan')
            .flush('Unavailable', { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not load the system plan.');
        expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    });
});
