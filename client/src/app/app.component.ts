import { Component, signal, WritableSignal } from '@angular/core';
import { FileBrowserComponent } from './file-browser/file-browser/file-browser.component';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        MatToolbar,
        MatButtonModule,
        RouterOutlet,
        // FileEditorComponent,
        // FileBrowserComponent,
    ]
})
export class AppComponent {
    title = 'Devenv';

    count: WritableSignal<number> = signal(0);

    create() {
    }
}
