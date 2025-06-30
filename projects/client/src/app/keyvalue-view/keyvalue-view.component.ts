import { Component, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { PPTRowComponent } from '../ppt/row/row.component';
import { ValueViewComponent } from '../value-view/value-view.component';

export type Keyvalue<T> = [string, T];

@Component({
    selector: 'app-keyvalue-view',
    imports: [
        MatIconModule,
        MatDividerModule,
        MatGridListModule,
        PPTRowComponent,
        ValueViewComponent


    ],
    templateUrl: './keyvalue-view.component.html',
    styleUrl: './keyvalue-view.component.scss'
})
export class KeyvalueViewComponent {

    keyValue = input.required<Keyvalue<any>>()

    get key(): string {
        return this.keyValue()[0];
    }

    get value(): any {
        return this.keyValue()[1];
    }

}
