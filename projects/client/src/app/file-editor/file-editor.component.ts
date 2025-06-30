import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DevendService } from '../devenv.service';

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

    constructor(private devendService: DevendService) {}

    setFilename(event: any) {
        this.filename = event.target.innerText.trim();
    }

    loadFile() {
        this.devendService
            .loadFile(this.filename)
            .subscribe({
                next: (data) => { this.fileContent = data }
            });
    }

    saveFile() {
        this.devendService
            .saveFile(this.filename, this.fileContent)
            .subscribe({
                next: (data) => { ; }
            });
    }

    onEditorInit(editorComponent: any) {
        // bind Ctrl-S ?
    }

}
