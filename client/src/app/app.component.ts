import { Component } from '@angular/core';
import { FileBrowserComponent } from './file-browser/file-browser/file-browser.component';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        RouterOutlet,
        // FileEditorComponent,
        FileBrowserComponent,
        MatButtonModule
    ]
})
export class AppComponent {
    title = 'Devenv';
}
