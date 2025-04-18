import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTFormFieldComponent } from './ppt-form-field.component';

describe('PPTFormFieldComponent', () => {
  let component: PPTFormFieldComponent;
  let fixture: ComponentFixture<PPTFormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PPTFormFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PPTFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
