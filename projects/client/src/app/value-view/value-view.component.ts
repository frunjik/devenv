import { JsonPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
    selector: 'app-value-view',
    imports: [
        // JsonPipe
    ],
    templateUrl: './value-view.component.html',
    styleUrl: './value-view.component.scss'
})
export class ValueViewComponent {
    value = input({ a: 12 });

    get valueAsString(): string {
        const value = this.value();
        if (Array.isArray(value)) {
            return 'list: ' + value.length.toString();
        } else if (typeof value === 'object') {
            return 'dict: ' + Object.keys(value).map(k => k.toString()).join(',');
        } else if (value) {
            (value as any).toString();
        }
        return String(value);
    }
}
