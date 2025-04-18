// using app.module.ts
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// import { AppModule } from './app/app.module';
// platformBrowserDynamic().bootstrapModule(AppModule)
//     .catch(err => console.error(err));

// standalone components (does not use app.module.ts)
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            // FormsModule,
            // ReactiveFormsModule,
            // MatFormFieldModule, 

            BrowserModule,
            MatFormFieldModule,
            MatDialogModule,
            AppRoutingModule,
            MonacoEditorModule.forRoot()
        ),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
}).catch((err) => console.error(err));
