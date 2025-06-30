import { JsonPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
    selector: 'app-value-editor',
    imports: [
        JsonPipe
    ],
    templateUrl: './value-editor.component.html',
    styleUrl: './value-editor.component.scss'
})
export class ValueEditorComponent {
    value = input({a:12});
}
