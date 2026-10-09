import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-navigation-toolbar',
    standalone: true,
    imports: [MatButtonModule, MatToolbarModule, MatMenuModule, RouterLink],
    templateUrl: './navigation-toolbar.component.html',
    styleUrl: './navigation-toolbar.component.scss',
})
export class NavigationToolbarComponent {
    @Input() host = '';
    @Input() isCommitting = false;
    @Output() readonly commitRequested = new EventEmitter<void>();
    @Output() readonly cloneRequested = new EventEmitter<void>();
}
