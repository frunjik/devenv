import { Component, input } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

export interface PPTTile {
    color: string;
    cols: number;
    rows: number;
    label: string;
}

@Component({
    selector: 'ppt-grid',
    imports: [MatGridListModule],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.scss'
})
export class PPTGridComponent {
    tiles = input<PPTTile[]>([
        { label: 'One 1', cols: 3, rows: 1, color: 'lightblue' },
        { label: 'Two', cols: 1, rows: 2, color: 'lightgreen' },
        { label: 'Three', cols: 1, rows: 1, color: 'lightpink' },
        { label: 'Four', cols: 2, rows: 1, color: '#DDBDF1' },
    ]);
}
