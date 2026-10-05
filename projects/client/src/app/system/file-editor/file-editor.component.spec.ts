import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import type { editor, IKeyboardEvent } from 'monaco-editor';
import { firstValueFrom, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { startServer } from '../../../../../server/src/public-api';
import { BackendService } from '../../backend.service';
import { FileEditorComponent } from './file-editor.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

function createEditorStub() {
    let onKeyDown: ((event: IKeyboardEvent) => void) | undefined;
    let disposed = false;
    const instance = {
        onKeyDown: (listener: (event: IKeyboardEvent) => void) => {
            onKeyDown = listener;
            return {
                dispose: () => {
                    disposed = true;
                },
            };
        },
    } as unknown as editor.IStandaloneCodeEditor;

    return {
        instance,
        emitKeyDown: (browserEvent: KeyboardEvent) => {
            onKeyDown?.({ browserEvent } as IKeyboardEvent);
        },
        isDisposed: () => disposed,
    };
}

describe('FileEditorComponent', () => {
    let component: FileEditorComponent;
    let fixture: ComponentFixture<FileEditorComponent>;
    let root: string;
    let server: Server;
    let apiHost: string;
    let snackbarOpen: jest.MockedFunction<MatSnackBar['open']>;
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
        snackbarOpen = jest.fn() as jest.MockedFunction<MatSnackBar['open']>;
        await TestBed.configureTestingModule({
            imports: [FileEditorComponent],
            providers: [
                provideHttpClient(),
                importProvidersFrom(MonacoEditorModule.forRoot())
            ]
        })
            .overrideComponent(FileEditorComponent, {
                add: { providers: [{ provide: MatSnackBar, useValue: { open: snackbarOpen } }] },
            })
            .compileComponents();

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

    it('shows a failure snackbar when loading fails', async () => {
        component.filename = 'missing.txt';

        component.loadFile();
        await fixture.whenStable();

        expect(snackbarOpen).toHaveBeenCalledWith('Unable to load file.', 'Dismiss', {
            duration: 5000,
            panelClass: 'save-snackbar-error',
        });
    });

    it('shows a success snackbar when the save button succeeds', () => {
        component.filename = 'sample.txt';
        component.fileContent = 'saved from editor';
        const saveFile = jest.spyOn(TestBed.inject(BackendService), 'saveFile').mockReturnValue(of('OK'));
        fixture.detectChanges();
        fixture.nativeElement.querySelectorAll('button')[1].click();

        expect(saveFile).toHaveBeenCalledWith('sample.txt', 'saved from editor');
        expect(snackbarOpen).toHaveBeenCalledWith('File saved.', 'Dismiss', {
            duration: 5000,
            panelClass: 'save-snackbar-success',
        });
    });

    it('shows a failure snackbar when saving fails', () => {
        jest.spyOn(TestBed.inject(BackendService), 'saveFile').mockReturnValue(of(''));

        component.saveFile();

        expect(snackbarOpen).toHaveBeenCalledWith('Unable to save file.', 'Dismiss', {
            duration: 5000,
            panelClass: 'save-snackbar-error',
        });
    });

    it('shows a failure snackbar when the save request errors', async () => {
        component.filename = 'missing/file.txt';
        component.fileContent = 'unsaved';

        component.saveFile();
        await fixture.whenStable();

        expect(snackbarOpen).toHaveBeenCalledWith('Unable to save file.', 'Dismiss', {
            duration: 5000,
            panelClass: 'save-snackbar-error',
        });
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

    it('saves when Ctrl+S is pressed in the initialized editor', async () => {
        component.filename = 'sample.txt';
        component.fileContent = 'saved from editor shortcut';
        const editorStub = createEditorStub();
        component.onEditorInit(editorStub.instance);
        const event = new KeyboardEvent('keydown', {
            key: 's',
            ctrlKey: true,
            cancelable: true,
        });
        editorStub.emitKeyDown(event);
        await fixture.whenStable();

        expect(event.defaultPrevented).toBe(true);
        await expect(firstValueFrom(TestBed.inject(BackendService).loadFile('sample.txt')))
            .resolves.toBe('saved from editor shortcut');
    });

    it('disposes the editor key handler when destroyed', () => {
        const editorStub = createEditorStub();
        component.onEditorInit(editorStub.instance);
        fixture.destroy();

        expect(editorStub.isDisposed()).toBe(true);
    });

});
