import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileEditorComponent } from './file-editor.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

describe('FileEditorComponent', () => {
    let component: FileEditorComponent;
    let fixture: ComponentFixture<FileEditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FileEditorComponent],
            providers: [
                provideHttpClient(),
                importProvidersFrom(MonacoEditorModule.forRoot())
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FileEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
