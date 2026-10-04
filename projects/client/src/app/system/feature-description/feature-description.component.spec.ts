import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import type { ErrorRequestHandler } from 'express';
import { createApp } from '../../../../../server/src/public-api';
import { FeatureWorkService } from '../../feature-work.service';
import { FeatureDescriptionComponent } from './feature-description.component';

describe('FeatureDescriptionComponent', () => {
    let fixture: ComponentFixture<FeatureDescriptionComponent>;
    let root: string;
    let server: Server;
    let apiHost: string;
    const browserWindow = window as Window & { host?: string };

    beforeAll(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-feature-client-'));
        const app = createApp(root);
        const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
            response.status(500).json({ error: { message: 'Feature submission failed.' } });
        };
        app.use(handleError);
        server = createServer(app);
        await new Promise<void>(resolve => server.listen(0, resolve));
        const address = server.address();
        if (!address || typeof address === 'string') {
            throw new Error('Test server did not bind to a TCP port');
        }
        apiHost = `http://127.0.0.1:${address.port}/`;
    });

    beforeEach(async () => {
        await rm(join(root, '.features'), { recursive: true, force: true });
        browserWindow.host = apiHost;
        await TestBed.configureTestingModule({
            imports: [FeatureDescriptionComponent],
            providers: [provideHttpClient()],
        }).compileComponents();

        fixture = TestBed.createComponent(FeatureDescriptionComponent);
        fixture.detectChanges();
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
        await rm(root, { recursive: true, force: true });
    });

    it('shows a feature description form', () => {
        expect(fixture.nativeElement.querySelector('h1').textContent).toContain('New feature');
        expect(fixture.nativeElement.querySelector('textarea[aria-label="Feature description"]')).not.toBeNull();
    });

    it('shows an empty-state message when there are no open features', async () => {
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.open-features').textContent).toContain('No open features.');
    });

    it('shows saved features below the form', async () => {
        await fixture.whenStable();
        const content = '// [2026-10-04 22:45 +02:00] Add a saved feature\n// [2026-10-04 22:46 +02:00] Add another feature\n';
        await writeFile(join(root, '.features'), content);

        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        const rows = fixture.nativeElement.querySelectorAll('.open-features tr.mat-mdc-row');
        expect(Array.from<HTMLTableRowElement>(rows).map(row => ({
            id: row.querySelector('.mat-column-id')?.textContent.trim(),
            description: row.querySelector('.mat-column-description')?.textContent.trim(),
            title: row.querySelector('.mat-column-id')?.getAttribute('title'),
        })))
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: expect.stringMatching(/^[0-9a-f]{8}$/),
                    description: 'Add a saved feature',
                    title: expect.stringMatching(/^[0-9a-f-]{36}$/),
                }),
                expect.objectContaining({
                    id: expect.stringMatching(/^[0-9a-f]{8}$/),
                    description: 'Add another feature',
                    title: expect.stringMatching(/^[0-9a-f-]{36}$/),
                }),
            ]));
        expect(Array.from<HTMLTableRowElement>(rows).map(row =>
            (row.querySelector('.mat-column-status select') as HTMLSelectElement).value,
        )).toEqual(['Backlog', 'Backlog']);
        expect(fixture.nativeElement.querySelectorAll('.open-features tr.mat-mdc-row button'))
            .toHaveLength(4);
    });

    it('sorts features by ID, priority, status, and description from the table headers', async () => {
        await fixture.whenStable();
        const firstId = '223e4567-e89b-42d3-a456-426614174001';
        const secondId = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), [
            `// [2026-10-04 22:45 +02:00] [${firstId}] [Low] [Done] Zebra feature`,
            `// [2026-10-04 22:46 +02:00] [${secondId}] [High] [Backlog] Apple feature`,
            '',
        ].join('\n'));

        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        const firstCell = (column: string): string =>
            fixture.nativeElement.querySelector(`tr.mat-mdc-row .mat-column-${column}`).textContent.trim();
        const sortBy = (column: string): void => {
            fixture.nativeElement.querySelector(`th.mat-column-${column}`).click();
            fixture.detectChanges();
        };

        sortBy('id');
        expect(firstCell('id')).toBe('123e4567');
        sortBy('priority');
        const firstPriority: HTMLSelectElement =
            fixture.nativeElement.querySelector('tr.mat-mdc-row .mat-column-priority select');
        expect(firstPriority.value).toBe('High');
        sortBy('status');
        const firstStatus: HTMLSelectElement =
            fixture.nativeElement.querySelector('tr.mat-mdc-row .mat-column-status select');
        expect(firstStatus.value).toBe('Backlog');
        sortBy('description');
        expect(firstCell('description')).toBe('Apple feature');
    });

    it('marks a feature as started when its row action is clicked', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), `// [2026-10-04 22:45 +02:00] [${id}] Add a feature\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        fixture.nativeElement.querySelector('.feature-start-button').click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(TestBed.inject(FeatureWorkService).activeFeature).toEqual({
            id,
            description: 'Add a feature',
        });
        expect(fixture.nativeElement.querySelector('.feature-start-button').textContent.trim()).toBe('Started');
        expect(fixture.nativeElement.querySelector('.feature-start-button').getAttribute('aria-pressed')).toBe('true');
        expect((fixture.nativeElement.querySelector('.feature-status-select') as HTMLSelectElement).value)
            .toBe('In progress');
        fixture.nativeElement.querySelector('.feature-start-button').click();
        await fixture.whenStable();
        expect(TestBed.inject(FeatureWorkService).activeFeature?.id).toBe(id);
    });

    it('activates an already in-progress feature when its row action is clicked', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'),
            `// [2026-10-04 22:45 +02:00] [${id}] [Medium] [In progress] Continue this feature\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        fixture.nativeElement.querySelector('.feature-start-button').click();
        fixture.detectChanges();
        const statusSelector: HTMLSelectElement =
            fixture.nativeElement.querySelector('.feature-status-select');
        statusSelector.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(TestBed.inject(FeatureWorkService).activeFeature).toEqual({
            id,
            description: 'Continue this feature',
        });
    });

    it('marks a feature done, removes it from the list, and clears matching active work', async () => {
        await fixture.whenStable();
        const completedId = '123e4567-e89b-42d3-a456-426614174000';
        const remainingId = '123e4567-e89b-42d3-a456-426614174001';
        await writeFile(join(root, '.features'), [
            `// [2026-10-04 22:45 +02:00] [${completedId}] [High] Completed feature`,
            `// [2026-10-04 22:46 +02:00] [${remainingId}] [Medium] Remaining feature`,
            '',
        ].join('\n'));
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();
        const featureWork = TestBed.inject(FeatureWorkService);
        featureWork.start(completedId, 'Completed feature');

        const doneButton: HTMLButtonElement = fixture.nativeElement.querySelector(
            '[aria-label="Mark done: Completed feature"]',
        );
        doneButton.click();
        doneButton.click();
        await fixture.whenStable();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(featureWork.activeFeature).toBeNull();
        expect(await readFile(join(root, '.features'), 'utf8')).toContain('Remaining feature');
        expect(await readFile(join(root, '.features'), 'utf8')).not.toContain('Completed feature');
        expect(Array.from<HTMLTableRowElement>(
            fixture.nativeElement.querySelectorAll('.open-features tr.mat-mdc-row'),
        ).map(row => row.querySelector('.mat-column-description')?.textContent.trim()))
            .toEqual(['Remaining feature']);
        expect(fixture.nativeElement.querySelector('#feature-completion-error')).toBeNull();
    });

    it('retains the feature and reports errors when marking it done fails', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), `// [2026-10-04 22:45 +02:00] [${id}] [Medium] Keep this feature\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();
        await rm(join(root, '.features'));
        await mkdir(join(root, '.features'));

        const doneButton: HTMLButtonElement = fixture.nativeElement.querySelector('.feature-done-button');
        doneButton.click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('tr.mat-mdc-row .mat-column-description').textContent.trim())
            .toBe('Keep this feature');
        expect(fixture.nativeElement.querySelector('#feature-completion-error').textContent)
            .toContain('500');
        expect(fixture.componentInstance.completingFeatureIds.size).toBe(0);
    });

    it('holds the entered feature description in the form', async () => {
        const textarea: HTMLTextAreaElement =
            fixture.nativeElement.querySelector('textarea[aria-label="Feature description"]');

        textarea.value = 'Add a route for planning the next feature';
        textarea.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        expect(fixture.componentInstance.description).toBe('Add a route for planning the next feature');
    });

    it('submits the description and updates the feature list without a success message', async () => {
        const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
        textarea.value = 'Add a feature submission form';
        textarea.dispatchEvent(new Event('input'));
        await fixture.whenStable();
        fixture.detectChanges();

        fixture.nativeElement.querySelector('button').click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('#feature-submit-error')).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('Feature added.');
        expect(fixture.componentInstance.description).toBe('');
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect((fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement).value).toBe('');
        await expect(readFile(join(root, '.features'), 'utf8')).resolves.toMatch(
            /^\/\/ \[\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2}\] \[[0-9a-f-]{36}\] \[Medium\] \[Backlog\] Add a feature submission form\n$/,
        );
        expect(Array.from<HTMLTableRowElement>(
            fixture.nativeElement.querySelectorAll('.open-features tr.mat-mdc-row'),
        ).map(row => row.querySelector('.mat-column-description')?.textContent.trim()))
            .toEqual(['Add a feature submission form']);
    });

    it('submits the selected priority and resets it to Medium after success', async () => {
        const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
        const priority: HTMLSelectElement = fixture.nativeElement.querySelector(
            'select[aria-label="Feature priority"]',
        );
        priority.value = 'High';
        priority.dispatchEvent(new Event('change'));
        textarea.value = 'Prioritize this feature';
        textarea.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        fixture.nativeElement.querySelector('button[type="submit"]').click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(await readFile(join(root, '.features'), 'utf8')).toMatch(/\[High\] \[Backlog\] Prioritize this feature/);
        expect(fixture.componentInstance.priority).toBe('Medium');
        expect((fixture.nativeElement.querySelector('select[aria-label="Feature priority"]') as HTMLSelectElement).value)
            .toBe('Medium');
        expect(fixture.nativeElement.querySelector('.mat-column-priority select').value).toBe('High');
        expect((fixture.nativeElement.querySelector('.feature-status-select') as HTMLSelectElement).value)
            .toBe('Backlog');
    });

    it('submits and resets the selected feature status', async () => {
        const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
        const status: HTMLSelectElement = fixture.nativeElement.querySelector(
            'select[aria-label="Feature status"]',
        );
        status.value = 'In progress';
        status.dispatchEvent(new Event('change'));
        textarea.value = 'Start this feature immediately';
        textarea.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        fixture.nativeElement.querySelector('button[type="submit"]').click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(await readFile(join(root, '.features'), 'utf8'))
            .toMatch(/\[Medium\] \[In progress\] Start this feature immediately/);
        expect(fixture.componentInstance.status).toBe('Backlog');
        expect((fixture.nativeElement.querySelector('select[aria-label="Feature status"]') as HTMLSelectElement).value)
            .toBe('Backlog');
    });

    it('updates an open feature status through the public API', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), `// [2026-10-04 22:45 +02:00] [${id}] [High] Feature to track\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        const selector: HTMLSelectElement = fixture.nativeElement.querySelector('.feature-status-select');
        expect(selector.value).toBe('Backlog');
        const featureWork = TestBed.inject(FeatureWorkService);
        featureWork.start(id, 'Feature to track');
        selector.value = 'Done';
        selector.dispatchEvent(new Event('change'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(await readFile(join(root, '.features'), 'utf8'))
            .toContain('[High] [Done] Feature to track');
        expect((fixture.nativeElement.querySelector('.feature-status-select') as HTMLSelectElement).value)
            .toBe('Done');
        expect(fixture.nativeElement.querySelector('#feature-status-error')).toBeNull();
        expect(featureWork.activeFeature).toBeNull();
    });

    it('reports status update failures and restores the previous selection', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'),
            `// [2026-10-04 22:45 +02:00] [${id}] [Medium] [Backlog] Feature to track\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();
        await rm(join(root, '.features'));
        await mkdir(join(root, '.features'));

        const selector: HTMLSelectElement = fixture.nativeElement.querySelector('.feature-status-select');
        selector.value = 'Done';
        selector.dispatchEvent(new Event('change'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(selector.value).toBe('Backlog');
        expect(fixture.nativeElement.querySelector('#feature-status-error').textContent)
            .toContain('500');
    });

    it('does not activate a feature when its status cannot be updated from Start', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'),
            `// [2026-10-04 22:45 +02:00] [${id}] [Medium] [Backlog] Feature to start\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();
        await rm(join(root, '.features'));
        await mkdir(join(root, '.features'));

        fixture.nativeElement.querySelector('.feature-start-button').click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(TestBed.inject(FeatureWorkService).activeFeature).toBeNull();
        expect(fixture.nativeElement.querySelector('#feature-status-error').textContent)
            .toContain('500');
    });

    it('updates an open feature priority through the public API', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), `// [2026-10-04 22:45 +02:00] [${id}] Add a feature\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        const selector: HTMLSelectElement = fixture.nativeElement.querySelector('.mat-column-priority select');
        expect(selector.value).toBe('Medium');
        selector.value = 'Low';
        selector.dispatchEvent(new Event('change'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(await readFile(join(root, '.features'), 'utf8')).toContain('[Low] [Backlog] Add a feature');
        expect((fixture.nativeElement.querySelector('.mat-column-priority select') as HTMLSelectElement).value)
            .toBe('Low');
        expect(fixture.nativeElement.querySelector('#feature-priority-error')).toBeNull();
    });

    it('shows legacy feature priorities and descriptions without a timestamp', async () => {
        await fixture.whenStable();
        await writeFile(join(root, '.features'), '// Legacy feature\n');
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        const row: HTMLTableRowElement = fixture.nativeElement.querySelector('.open-features tr.mat-mdc-row');
        expect(row.querySelector('.mat-column-id')?.textContent.trim()).toMatch(/^[0-9a-f]{8}$/);
        expect(row.querySelector('.mat-column-description')?.textContent.trim()).toBe('Legacy feature');
        expect((row.querySelector('.mat-column-priority select') as HTMLSelectElement).value).toBe('Medium');
        expect((row.querySelector('.feature-status-select') as HTMLSelectElement).value).toBe('Backlog');
    });

    it('keeps malformed legacy feature text visible', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), `unstructured legacy text [${id}]\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        const row: HTMLTableRowElement = fixture.nativeElement.querySelector('.open-features tr.mat-mdc-row');
        expect(row.querySelector('.mat-column-description')?.textContent.trim())
            .toBe(`unstructured legacy text [${id}] [Medium] [Backlog]`);
        expect(row.querySelector('.mat-column-id')?.textContent.trim()).toBe('');
        row.querySelector<HTMLButtonElement>('.feature-start-button')!.click();
        expect(TestBed.inject(FeatureWorkService).activeFeature).toBeNull();
    });

    it('reports priority update failures and restores the previous selection', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), `// [2026-10-04 22:45 +02:00] [${id}] [Medium] Feature to prioritize\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();
        await writeFile(join(root, '.features'), '');

        const selector: HTMLSelectElement = fixture.nativeElement.querySelector('.mat-column-priority select');
        selector.value = 'High';
        selector.dispatchEvent(new Event('change'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(selector.value).toBe('Medium');
        expect(fixture.nativeElement.querySelector('#feature-priority-error').textContent)
            .toContain('404');
    });

    it('ignores invalid and unchanged priority selections', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'), `// [2026-10-04 22:45 +02:00] [${id}] [Medium] Feature\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        const selector: HTMLSelectElement = fixture.nativeElement.querySelector('.mat-column-priority select');
        selector.value = 'Invalid';
        selector.dispatchEvent(new Event('change'));
        selector.value = 'Medium';
        selector.dispatchEvent(new Event('change'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(await readFile(join(root, '.features'), 'utf8')).toContain('[Medium] [Backlog] Feature');
        expect(fixture.nativeElement.querySelector('#feature-priority-error')).toBeNull();
    });

    it('ignores invalid and unchanged status selections', async () => {
        await fixture.whenStable();
        const id = '123e4567-e89b-42d3-a456-426614174000';
        await writeFile(join(root, '.features'),
            `// [2026-10-04 22:45 +02:00] [${id}] [Medium] [Backlog] Feature\n`);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        const selector: HTMLSelectElement = fixture.nativeElement.querySelector('.feature-status-select');
        selector.value = 'Invalid';
        selector.dispatchEvent(new Event('change'));
        selector.value = 'Backlog';
        selector.dispatchEvent(new Event('change'));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(await readFile(join(root, '.features'), 'utf8')).toContain('[Backlog] Feature');
        expect(fixture.nativeElement.querySelector('#feature-status-error')).toBeNull();
    });

    it('paginates the open features table', async () => {
        await fixture.whenStable();
        await writeFile(join(root, '.features'), Array.from(
            { length: 7 },
            (_, index) => `// Feature ${index + 1}`,
        ).join('\n'));

        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.open-features tr.mat-mdc-row')).toHaveLength(5);
        expect(fixture.nativeElement.querySelector('mat-paginator').textContent).toContain('1 – 5 of 7');

        fixture.nativeElement.querySelector('.mat-mdc-paginator-navigation-next').click();
        fixture.detectChanges();

        const rows: HTMLTableRowElement[] = Array.from(
            fixture.nativeElement.querySelectorAll('.open-features tr.mat-mdc-row'),
        );
        expect(rows).toHaveLength(2);
        expect(rows.map(row => row.textContent)).toEqual(expect.arrayContaining([
            expect.stringContaining('Feature 6'),
            expect.stringContaining('Feature 7'),
        ]));
    });

    it('filters features by ID or description and resets to the first page', async () => {
        await fixture.whenStable();
        const content = Array.from({ length: 7 }, (_, index) =>
            `// [2026-10-04 22:45 +02:00] [123e4567-e89b-42d3-a456-42661417400${index}] Feature ${index + 1}`,
        ).join('\n');
        await writeFile(join(root, '.features'), content);
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        fixture.nativeElement.querySelector('.mat-mdc-paginator-navigation-next').click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('mat-paginator').textContent).toContain('6 – 7 of 7');

        const search: HTMLInputElement = fixture.nativeElement.querySelector('input[aria-label="Search features"]');
        search.value = 'FEATURE 2';
        search.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(fixture.componentInstance.featureSearch).toBe('FEATURE 2');
        expect(fixture.nativeElement.querySelector('mat-paginator').textContent).toContain('1 – 1 of 1');
        const rows: HTMLTableRowElement[] = Array.from(
            fixture.nativeElement.querySelectorAll('.open-features tr.mat-mdc-row'),
        );
        expect(rows).toHaveLength(1);
        expect(rows[0].querySelector('.mat-column-description')?.textContent.trim()).toBe('Feature 2');

        search.value = '123e4567';
        search.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelectorAll('.open-features tr.mat-mdc-row')).toHaveLength(5);
    });

    it('shows an empty state when no feature matches the search', async () => {
        await fixture.whenStable();
        await writeFile(join(root, '.features'), '// One feature');
        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        const search: HTMLInputElement = fixture.nativeElement.querySelector('input[aria-label="Search features"]');
        search.value = 'missing';
        search.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.open-features').textContent)
            .toContain('No features match your search.');
        expect(fixture.nativeElement.querySelectorAll('.open-features tr.mat-mdc-row')).toHaveLength(0);
    });

    it.each([
        ['Ctrl+S', 's'],
        ['Ctrl+Enter', 'Enter'],
    ])('submits the top-level form with %s', async (_shortcut, key) => {
        const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
        textarea.value = `Submit with ${key}`;
        textarea.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        const event = new KeyboardEvent('keydown', {
            key,
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });
        textarea.dispatchEvent(event);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
        expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('Feature added.');
        await expect(readFile(join(root, '.features'), 'utf8')).resolves.toMatch(
            new RegExp(`\\] \\[[0-9a-f-]{36}\\] \\[Medium\\] \\[Backlog\\] Submit with ${key}\\n$`),
        );
    });

    it('does not submit an empty description', async () => {
        fixture.componentInstance.description = ' \n ';

        fixture.componentInstance.submit();

        expect(fixture.componentInstance.isSubmitting).toBe(false);
        await expect(readFile(join(root, '.features'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it('prevents duplicate submissions while the backend request is pending', async () => {
        fixture.componentInstance.description = 'Add one feature entry';

        fixture.componentInstance.submit();
        fixture.componentInstance.submit();
        await fixture.whenStable();

        const contents = await readFile(join(root, '.features'), 'utf8');
        expect(contents.match(/Add one feature entry/g)).toHaveLength(1);
    });

    it('shows backend errors to the user', async () => {
        await mkdir(join(root, '.features'));
        const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
        textarea.value = 'This cannot be saved';
        textarea.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        fixture.componentInstance.submit();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('#feature-submit-error').textContent.trim()).not.toBe('');
        expect(fixture.componentInstance.isSubmitting).toBe(false);
        expect(fixture.componentInstance.description).toBe('This cannot be saved');
        fixture.detectChanges();
        expect((fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement).value)
            .toBe('This cannot be saved');
    });

    it('shows backend errors when loading the open feature list', async () => {
        await fixture.whenStable();
        await rm(join(root, '.features'), { force: true });
        await mkdir(join(root, '.features'));

        fixture.componentInstance.refreshFeatures();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('#feature-list-error').textContent.trim()).not.toBe('');
        expect(fixture.componentInstance.isLoadingFeatures).toBe(false);
    });
});
