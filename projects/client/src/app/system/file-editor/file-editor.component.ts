import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { BackendService } from '../../backend.service';
import type { editor } from 'monaco-editor';

@Component({
    selector: 'app-file-editor',
    templateUrl: './file-editor.component.html',
    styleUrls: ['./file-editor.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        MatButtonModule,
        MatToolbarModule,
        MonacoEditorModule
    ]
})
export class FileEditorComponent implements OnDestroy {

    @Input()
    fileContent     = '';

    @Input()
    filename        = 'web/angular-express/client/tsconfig.json';

    editorOptions   = { theme: 'vs-dark', language: 'ts' };
    private _saveKeybinding?: { dispose(): void };

    constructor(private _backendService: BackendService) {}

    setFilename(event: any) {
        this.filename = event.target.innerText.trim();
    }

    loadFile() {
        this._backendService
            .loadFile(this.filename)
            .subscribe({
                next: (data) => { this.fileContent = data }
            });
    }

    saveFile() {
        this._backendService
            .saveFile(this.filename, this.fileContent)
            .subscribe({
                next: (data) => { ; }
            });
    }

    onEditorInit(editorInstance: editor.IStandaloneCodeEditor) {
        this._saveKeybinding = editorInstance.onKeyDown((event) => {
            if ((event.ctrlKey || event.metaKey) && event.browserEvent.key.toLowerCase() === 's') {
                event.preventDefault();
                event.stopPropagation();
                this.saveFile();
            }
        });
    }

    ngOnDestroy() {
        this._saveKeybinding?.dispose();
    }

}
