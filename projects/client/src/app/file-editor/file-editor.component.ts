import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { BackendService } from '../backend.service';

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
export class FileEditorComponent {

    @Input()
    fileContent     = '';

    @Input()
    filename        = 'web/angular-express/client/tsconfig.json';

    editorOptions   = { theme: 'vs-dark', language: 'ts' };

    constructor(private backendService: BackendService) {}

    setFilename(event: any) {
        this.filename = event.target.innerText.trim();
    }

    loadFile() {
        this.backendService
            .loadFile(this.filename)
            .subscribe({
                next: (data) => { this.fileContent = data }
            });
    }

    saveFile() {
        this.backendService
            .saveFile(this.filename, this.fileContent)
            .subscribe({
                next: (data) => { ; }
            });
    }
}
