import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { BackendService } from './backend.service';

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
    
    constructor(public bs: BackendService) {
    }

    get host(): string {
        return this.bs.host;
    }
}
