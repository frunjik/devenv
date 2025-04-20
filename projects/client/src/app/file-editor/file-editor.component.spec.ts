import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileEditorComponent } from './file-editor.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BackendService } from '../backend.service';

describe('FileEditorComponent', () => {
    let component: FileEditorComponent;
    let fixture: ComponentFixture<FileEditorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FileEditorComponent,
                provideHttpClient(),
                provideHttpClientTesting(),            
            ],
            providers: [
                BackendService
            ]
            // declarations: [FileEditorComponent]
        });
        fixture = TestBed.createComponent(FileEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
