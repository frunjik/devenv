import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { TestBed } from '@angular/core/testing';
import { FileBrowserComponent } from './file-browser.component';

describe('FileBrowserComponent', () => {
    let http: HttpTestingController;
    let harness: RouterTestingHarness;
    let component: FileBrowserComponent;
    const browserWindow = window as Window & { host?: string };

    beforeEach(async () => {
        browserWindow.host = 'http://localhost:3000/';
        await TestBed.configureTestingModule({
            imports: [FileBrowserComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([{ path: '', component: FileBrowserComponent }]),
                importProvidersFrom(MonacoEditorModule.forRoot()),
            ],
        }).compileComponents();

        harness = await RouterTestingHarness.create();
        http = TestBed.inject(HttpTestingController);
        component = await harness.navigateByUrl('/?path=.', FileBrowserComponent);
        flushRequests();
        await harness.fixture.whenStable();
        harness.detectChanges();
    });

    afterEach(() => {
        http.verify();
        delete browserWindow.host;
    });

    function flushRequests(): void {
        for (const request of http.match(() => true)) {
            expect(request.request.method).toBe('GET');
            const url = new URL(request.request.url);
            const path = url.searchParams.get('path');
            if (path?.startsWith('missing')) {
                request.flush({ error: { message: 'Not found' } }, { status: 404, statusText: 'Not Found' });
            } else if (url.pathname === '/folders') {
                request.flush({ data: path === './sub'
                    ? [{ filename: 'inside.txt', isFolder: false }]
                    : [{ filename: 'sample.txt', isFolder: false }, { filename: 'sub', isFolder: true }] });
            } else {
                expect(url.pathname).toBe('/files');
                expect(['./sample.txt', './sub/inside.txt']).toContain(path);
                request.flush({ data: path === './sample.txt' ? 'initial' : 'nested' });
            }
        }
    }

    async function navigate(url: string): Promise<void> {
        component = await harness.navigateByUrl(url, FileBrowserComponent);
        flushRequests();
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
        flushRequests();
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(component.filename()).toBe('./sample.txt');
        expect(component.fileContent).toBe('initial');

        const subFolder = component.folderEntries.find(entry => entry.filename === 'sub');
        expect(subFolder).toBeDefined();
        component.clickFileOrFolder(subFolder!);
        await harness.fixture.whenStable();
        flushRequests();
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(component.pathname()).toBe('./sub');
        expect(component.folderNames).toEqual(['.', 'sub']);
        expect(component.folderEntries.map(entry => entry.filename)).toEqual(['inside.txt']);

        component.clickFileOrFolder(component.folderEntries[0]);
        await harness.fixture.whenStable();
        flushRequests();
        await harness.fixture.whenStable();
        harness.detectChanges();
        expect(component.fileContent).toBe('nested');

        component.searchTextChange('nested');
        component.clickPath(0);
        await harness.fixture.whenStable();
        flushRequests();
        await harness.fixture.whenStable();
        harness.detectChanges();
        expect(component.filterText).toBe('');
        expect(component.pathname()).toBe('.');
        expect(component.filename()).toBe('');

        await navigate('/');
        expect(component.pathname()).toBe('');

        component.clickPath(0);
        await harness.fixture.whenStable();
        flushRequests();
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
