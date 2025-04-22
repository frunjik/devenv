import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { BackendService } from './backend.service';
import { navLinks } from './app-nav-links';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MatToolbarModule, MatButton],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'DevEnv';
    navLinks = navLinks;

    constructor(
        private _bs: BackendService,
    ) {

    }

    get host(): string {
        return this._bs.host;
    }

    editFile() {
    }
    
    browseFolder() {
    }

}
