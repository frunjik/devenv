import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';

import { ppt, PPTItem, PPTList } from '@ppt';
import { PPTItemComponent } from './ppt/list/item/item.component';
import { PPTListComponent } from './ppt/list/list/list.component';
import { PPTListEditorComponent } from "./ppt/list/list-editor/list-editor.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
    MatToolbar,
    MatButtonModule,
    // RouterOutlet,
    PPTListComponent,
    PPTListEditorComponent
]
})
export class AppComponent {
    id = 1;
    
    title = 'Devenv';

    model = ppt.models['PPTField'];

    // items: PPTItem[] = [];
    list: PPTList = {
        id: '1',
        type: 'list',
        name: 'new list',
        items: []
    };

    editing = signal(false);

    // field: PPTField = {
    //     id: 'test',
    //     type: 'test',
    //     name: 'test'
    // }

    // count: WritableSignal<number> = signal(0);

    edit() {
        this.editing.set(true);
    }

    insertItem() {
        const id = this.createId();
        this.list.items.push(this.createItem(`item${id}}`, `item${id}`));
    }

    insertList() {
        const id = this.createId();
        this.list.items.push(this.createList(`list${id}}`, `list${id}`));
    }

    createId(): number {
        this.id += 1;
        return this.id;
    }

    createList(id: string, name: string): PPTList {
        return {
            id: id,
            type: 'list',
            name: name,
            items: []
        }        
    }

    createItem(id: string, name: string): PPTItem {
        return {
            id: id,
            type: 'item',
            name: name,
        }        
    }

    commit() {
        this.editing.set(false);
    }
    
    cancel() {
        this.editing.set(false);
    }
}
