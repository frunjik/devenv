import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { firstValueFrom } from 'rxjs';
import { startServer } from '../../../../../server/src/public-api';
import { BackendService } from '../../backend.service';
import { FileEditorComponent } from './file-editor.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

describe('FileEditorComponent', () => {
    let component: FileEditorComponent;
    let fixture: ComponentFixture<FileEditorComponent>;
    let root: string;
    let server: Server;
    let apiHost: string;
    const browserWindow = window as Window & { host?: string };

    beforeAll(async () => {
        root = await mkdtemp(join(tmpdir(), 'devenv-file-editor-test-'));
        await writeFile(join(root, 'sample.txt'), 'initial');
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
            imports: [FileEditorComponent],
            providers: [
                provideHttpClient(),
                importProvidersFrom(MonacoEditorModule.forRoot())
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FileEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
        await rm(root, { recursive: true, force: true });
        delete browserWindow.host;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('trims the filename supplied by an edit event', () => {
        const target = document.createElement('div');
        target.contentEditable = 'true';
        target.innerText = '  sample.txt  ';
        const event = new Event('input');
        target.dispatchEvent(event);
        component.setFilename(event);

        expect(component.filename).toBe('sample.txt');
    });

    it('loads the selected file when the load button is clicked', async () => {
        component.filename = 'sample.txt';
        fixture.detectChanges();
        fixture.nativeElement.querySelectorAll('button')[0].click();
        await fixture.whenStable();

        expect(component.fileContent).toBe('initial');
    });

    it('saves the editor contents when the save button is clicked', async () => {
        component.filename = 'sample.txt';
        component.fileContent = 'saved from editor';
        fixture.detectChanges();
        fixture.nativeElement.querySelectorAll('button')[1].click();
        await fixture.whenStable();

        await expect(firstValueFrom(TestBed.inject(BackendService).loadFile('sample.txt')))
            .resolves.toBe('saved from editor');
    });

    it('saves when Ctrl+S is pressed in the filename input', async () => {
        component.filename = 'sample.txt';
        component.fileContent = 'saved with control shortcut';
        const event = new KeyboardEvent('keydown', {
            key: 's',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });
        fixture.nativeElement.querySelector('input').dispatchEvent(event);
        await fixture.whenStable();

        expect(event.defaultPrevented).toBe(true);
        await expect(firstValueFrom(TestBed.inject(BackendService).loadFile('sample.txt')))
            .resolves.toBe('saved with control shortcut');
    });

    it('saves when Cmd+S is pressed in the filename input', async () => {
        component.filename = 'sample.txt';
        component.fileContent = 'saved with command shortcut';
        const event = new KeyboardEvent('keydown', {
            key: 'S',
            metaKey: true,
            bubbles: true,
            cancelable: true,
        });
        fixture.nativeElement.querySelector('input').dispatchEvent(event);
        await fixture.whenStable();

        expect(event.defaultPrevented).toBe(true);
        await expect(firstValueFrom(TestBed.inject(BackendService).loadFile('sample.txt')))
            .resolves.toBe('saved with command shortcut');
    });

    it('does not save for a different keyboard shortcut', async () => {
        component.filename = 'sample.txt';
        const event = new KeyboardEvent('keydown', {
            key: 'x',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });
        fixture.nativeElement.querySelector('input').dispatchEvent(event);
        await fixture.whenStable();

        expect(event.defaultPrevented).toBe(false);
        await expect(firstValueFrom(TestBed.inject(BackendService).loadFile('sample.txt')))
            .resolves.toBe('saved with command shortcut');
    });
});
