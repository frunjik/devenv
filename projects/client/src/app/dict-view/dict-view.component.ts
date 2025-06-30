import { Component, input } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import { ValueViewComponent } from '../value-view/value-view.component';
import { PPTRowComponent } from '../ppt/row/row.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { KeyvalueViewComponent } from '../keyvalue-view/keyvalue-view.component';

@Component({
    selector: 'app-dict-view',
    imports: [
        MatIconModule,
        MatDividerModule,
        MatGridListModule,
        // PPTRowComponent,

        KeyvalueViewComponent,
        // ValueViewComponent
    ],
    templateUrl: './dict-view.component.html',
    styleUrl: './dict-view.component.scss'
})
export class DictViewComponent {
    dict = input({})
    get entries(): Array<any> {
        return Object.entries(this.dict());
    }
}
