import { Component, input } from '@angular/core';
import { SliceViewComponent } from '../slice-view/slice-view.component';
import { EMSlice } from '@shared';
import { JsonPipe } from '@angular/common';
import { PPTDict } from '@ppt';

@Component({
    selector: 'em-slices-view',
    imports: [
        // JsonPipe,
        SliceViewComponent
    ],
    templateUrl: './slices-view.component.html',
    styleUrl: './slices-view.component.scss'
})
export class SlicesViewComponent {
    slicesDict = input.required<PPTDict<EMSlice>>();
    get slicesList(): EMSlice[] {
        return Object.values(this.slicesDict() as any);
    }
}
