import { Component, input } from '@angular/core';

@Component({
    selector: 'app-dict-editor',
    imports: [],
    templateUrl: './dict-editor.component.html',
    styleUrl: './dict-editor.component.scss'
})
export class DictEditorComponent {
    dict = input({})
    get entries(): Array<any> {
        return Object.entries(this.dict());
    }
}
