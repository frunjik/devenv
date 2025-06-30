import { Component, input, output } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { exampleItems, exampleItemColumns } from '../data';
import { PPTItem } from '@ppt';

export interface PPTItemDataSource {
    ds: MatTableDataSource<PPTItem>;
    columns: string[];
}

@Component({
    selector: 'app-table-view',
    imports: [MatTableModule],
    templateUrl: './table-view.component.html',
    styleUrl: './table-view.component.scss'
})
export class TableViewComponent {

    itemDataSource = input<PPTItemDataSource>({
        ds: new MatTableDataSource(exampleItems),
        columns: exampleItemColumns
    })

    clickRow = output<PPTItem>();

    get ds(): MatTableDataSource<PPTItem> {
        return this.itemDataSource().ds;
    }

    get columns(): string[] {
        return this.itemDataSource().columns;
    }
}
