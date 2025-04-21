import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { BackendService } from './backend.service';

interface NavLink {
    name: string;
    url: string;
}

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MatToolbarModule],
    // providers: [

    // ]
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'DevEnv';

    navLinks: NavLink[] = [
        {
            name: 'Home',
            url: '/',
        },
        {
            name: 'Browse',
            url: '/ppt/browse',
        },
        {
            name: 'JS',
            url: '/ppt/js',
        },
        {
            name: 'Server',
            url: '/ppt/server',
        },
        {
            name: 'MetaII',
            url: '/ppt/metaii',
        }
    ]
    
    constructor(public bs: BackendService) {
    }

    get host(): string {
        return this.bs.host;
    }
}
