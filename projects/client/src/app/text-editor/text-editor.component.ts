import { Component, input, Input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PPTRowComponent } from '../ppt/row/row.component';

export interface TextEditorOptions {
    theme: string;
    language: string;
};

@Component({
    selector: 'app-text-editor',
    templateUrl: './text-editor.component.html',
    styleUrls: ['./text-editor.component.scss'],
    standalone: true,
    imports: [
        // PPTRowComponent,
        FormsModule,
        MatButtonModule,
        MatToolbarModule,
        MonacoEditorModule
    ]
})
export class TextEditorComponent {

    @Input() text = '';

    options = input<TextEditorOptions>({ theme: 'vs-dark', language: 'ts' });

    cancel = output();
    commit = output<string>();

    onEditorInit(editorComponent: any) {
        // bind Ctrl-S ?
    }

}
