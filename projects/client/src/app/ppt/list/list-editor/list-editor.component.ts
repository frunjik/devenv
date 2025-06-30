import { Component, input, output } from '@angular/core';
import { PPTListOfItems } from '@ppt';
import { PPTListComponent } from "../list/list.component";
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'ppt-list-editor',
    imports: [
        MatToolbarModule,
        PPTListComponent],
    templateUrl: './list-editor.component.html',
    styleUrl: './list-editor.component.scss'
})
export class PPTListEditorComponent {
    list = input.required<PPTListOfItems>();
    commit = output();
    cancel = output();
}
