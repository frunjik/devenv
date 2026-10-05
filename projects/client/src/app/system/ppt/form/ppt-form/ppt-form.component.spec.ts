import { describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { PPTField } from '@ppt';

import { PPTFormComponent } from './ppt-form.component';

describe('PPTFormComponent', () => {
  let component: PPTFormComponent;
  let fixture: ComponentFixture<PPTFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PPTFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PPTFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('creates a form control initialized with the field name', () => {
    const field: PPTField = {
      id: 'title',
      type: 'string',
      name: 'Title',
    };

    expect(component.createFormField(field).value).toBe('Title');
  });
});
