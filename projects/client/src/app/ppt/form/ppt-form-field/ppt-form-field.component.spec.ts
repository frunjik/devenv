import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTFormFieldComponent } from './ppt-form-field.component';
import { FormGroup } from '@angular/forms';

describe('PPTFormFieldComponent', () => {
    let component: PPTFormFieldComponent;
    let fixture: ComponentFixture<PPTFormFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PPTFormFieldComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PPTFormFieldComponent);

        fixture.componentRef.setInput('form', new FormGroup({}));
        fixture.componentRef.setInput('field', {});

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
