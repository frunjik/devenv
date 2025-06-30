import { Component, input } from '@angular/core';
import { TextEditorComponent } from '../text-editor/text-editor.component';

@Component({
    selector: 'app-object-editor',
    imports: [
        TextEditorComponent
    ],
    templateUrl: './object-editor.component.html',
    styleUrl: './object-editor.component.scss'
})
export class ObjectEditorComponent {
    object = input<Object>({});

    text(): string {
        return JSON.stringify(
            this.object(),
            null,
            4
        )
    }

    submitText(text: string) {}
}
