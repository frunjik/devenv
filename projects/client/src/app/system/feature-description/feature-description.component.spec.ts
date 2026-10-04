import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import type { ErrorRequestHandler } from 'express';
import { createApp } from '../../../../../server/src/public-api';
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

        const list = fixture.nativeElement.querySelector('.open-features ul');
        expect(Array.from(list.querySelectorAll('li')).map((item: HTMLLIElement) => item.textContent.trim()))
            .toEqual([
                '// [2026-10-04 22:45 +02:00] Add a saved feature',
                '// [2026-10-04 22:46 +02:00] Add another feature',
            ]);
    });

    it('holds the entered feature description in the form', async () => {
        const textarea: HTMLTextAreaElement =
            fixture.nativeElement.querySelector('textarea[aria-label="Feature description"]');

        textarea.value = 'Add a route for planning the next feature';
        textarea.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        expect(fixture.componentInstance.description).toBe('Add a route for planning the next feature');
    });

    it('submits the description to the backend and displays success feedback', async () => {
        const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
        textarea.value = 'Add a feature submission form';
        textarea.dispatchEvent(new Event('input'));
        await fixture.whenStable();
        fixture.detectChanges();

        fixture.nativeElement.querySelector('button').click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Feature added.');
        await expect(readFile(join(root, '.features'), 'utf8')).resolves.toMatch(
            /^\/\/ \[\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2}\] Add a feature submission form\n$/,
        );
        expect(Array.from(fixture.nativeElement.querySelectorAll('.open-features li'))
            .map((item: HTMLLIElement) => item.textContent.trim()))
            .toEqual([expect.stringMatching(/Add a feature submission form$/)]);
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
        fixture.componentInstance.description = 'This cannot be saved';

        fixture.componentInstance.submit();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('#feature-submit-error').textContent.trim()).not.toBe('');
        expect(fixture.componentInstance.isSubmitting).toBe(false);
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
