import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

export const appConfig: ApplicationConfig = {
    providers: [


        importProvidersFrom(
        //     // FormsModule,
        //     // ReactiveFormsModule,
        //     // MatFormFieldModule, 

        //     BrowserModule,
        //     MatFormFieldModule,
        //     MatDialogModule,
        //     AppRoutingModule,
            MonacoEditorModule.forRoot()
        ),

        provideZoneChangeDetection({ eventCoalescing: true }),
        provideHttpClient(),        
        provideRouter(routes)
    ]
};
