import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { provideStore, StoreModule } from '@ngrx/store';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { folderEntriesReducer } from './state/folder-entries.reducers';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        importProvidersFrom(
            StoreModule.forRoot({ folderEntries: folderEntriesReducer }),
            MonacoEditorModule.forRoot()
        ),
        provideHttpClient(),
        provideRouter(routes),
        provideStore({
            router: routerReducer,
        }),
        provideRouterStore()
    ]
};
