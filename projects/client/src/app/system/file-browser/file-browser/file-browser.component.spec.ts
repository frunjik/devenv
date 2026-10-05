import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { TestBed } from '@angular/core/testing';
import { startServer } from '../../../../../../server/src/public-api';
import { FileBrowserComponent } from './file-browser.component';

describe('FileBrowserComponent', () => {
    let root: string;
    let server: Server;
    let apiHost: string;
    let harness: RouterTestingHarness;
    let component: FileBrowserComponent;
    const browserWindow = window as Window & { host?: string };

    beforeAll(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-file-browser-test-'));
        await mkdir(join(root, 'sub'));
        await writeFile(join(root, 'sample.txt'), 'initial');
        await writeFile(join(root, 'sub', 'inside.txt'), 'nested');
        server = await startServer(root, 0);
        const address = server.address();
        if (!address || typeof address === 'string') {
            throw new Error('Test server did not bind to a TCP port');
        }
        apiHost = `http://127.0.0.1:${address.port}/`;
    });

    beforeEach(async () => {
        browserWindow.host = apiHost;
        await TestBed.configureTestingModule({
            imports: [FileBrowserComponent],
            providers: [
                provideHttpClient(),
                provideRouter([{ path: '', component: FileBrowserComponent }]),
                importProvidersFrom(MonacoEditorModule.forRoot()),
            ],
        }).compileComponents();

        harness = await RouterTestingHarness.create();
        component = await harness.navigateByUrl('/?path=.', FileBrowserComponent);
        await harness.fixture.whenStable();
        harness.detectChanges();
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
        await rm(root, { recursive: true, force: true });
        delete browserWindow.host;
    });

    async function navigate(url: string): Promise<void> {
        component = await harness.navigateByUrl(url, FileBrowserComponent);
        await harness.fixture.whenStable();
        harness.detectChanges();
    }

    it('loads folders and files and navigates through entries and breadcrumbs', async () => {
        expect(component.pathname()).toBe('.');
        expect(component.folderNames).toEqual(['.']);
        expect(component.folderEntries.map(entry => entry.filename)).toEqual(
            expect.arrayContaining(['sample.txt', 'sub']),
        );
        expect(component.filteredEntries).toBe(component.folderEntries);

        component.searchTextChange('SAMPLE');
        expect(component.filteredEntries.map(entry => entry.filename)).toEqual(['sample.txt']);

        component.searchTextChange('');
        const sampleFile = component.folderEntries.find(entry => entry.filename === 'sample.txt');
        expect(sampleFile).toBeDefined();
        component.clickFileOrFolder(sampleFile!);
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(component.filename()).toBe('./sample.txt');
        expect(component.fileContent).toBe('initial');

        const subFolder = component.folderEntries.find(entry => entry.filename === 'sub');
        expect(subFolder).toBeDefined();
        component.clickFileOrFolder(subFolder!);
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(component.pathname()).toBe('./sub');
        expect(component.folderNames).toEqual(['.', 'sub']);
        expect(component.folderEntries.map(entry => entry.filename)).toEqual(['inside.txt']);

        component.clickFileOrFolder(component.folderEntries[0]);
        await harness.fixture.whenStable();
        harness.detectChanges();
        expect(component.fileContent).toBe('nested');

        component.searchTextChange('nested');
        component.clickPath(0);
        await harness.fixture.whenStable();
        harness.detectChanges();
        expect(component.filterText).toBe('');
        expect(component.pathname()).toBe('.');
        expect(component.filename()).toBe('');

        await navigate('/');
        expect(component.pathname()).toBe('');

        component.clickPath(0);
        await harness.fixture.whenStable();
        harness.detectChanges();
    });

    it('shows file and folder failures and clears the file error when selection is removed', async () => {
        await navigate('/?path=missing&file=missing.txt');

        expect(component.folderLoadError).not.toBe('');
        expect(component.fileLoadError).not.toBe('');
        expect(Array.from(harness.routeNativeElement?.querySelectorAll('[role="alert"]') ?? []))
            .toHaveLength(2);

        await navigate('/?path=.');

        expect(component.fileLoadError).toBe('');
        expect(component.filename()).toBe('');
    });
});
