import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileEditorComponent } from './file-editor.component';

describe('FileEditorComponent', () => {
    let component: FileEditorComponent;
    let fixture: ComponentFixture<FileEditorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FileEditorComponent]
        });
        fixture = TestBed.createComponent(FileEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
