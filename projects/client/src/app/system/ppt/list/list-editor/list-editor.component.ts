import { Component, input, output } from '@angular/core';
import { PPTList } from '@ppt';
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
    list = input.required<PPTList>();
    commit = output();
    cancel = output();
}
