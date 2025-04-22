import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { BackendService } from './backend.service';
import { navLinks } from './app-nav-links';
import { MatButton } from '@angular/material/button';
import { DevenvCommandsService } from './devenv-commands.service';
import { browseFolder } from './devenv/devenv-actions';
import { Store } from '@ngrx/store';

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
        // private _cs: DevenvCommandsService
        // private _st: Store
    ) {

    }

    get host(): string {
        return this._bs.host;
    }

    editFile() {
        // this._cs.editFile();
    }
    
    browseFolder() {
        // this._st.dispatch(browseFolder({fullpathname: ''}))
    }

}
