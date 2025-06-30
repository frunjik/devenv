import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyvalueEditorComponent } from './keyvalue-editor.component';

describe('KeyvalueEditorComponent', () => {
  let component: KeyvalueEditorComponent;
  let fixture: ComponentFixture<KeyvalueEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyvalueEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyvalueEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
