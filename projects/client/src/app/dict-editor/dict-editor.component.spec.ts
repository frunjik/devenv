import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DictEditorComponent } from './dict-editor.component';

describe('DictEditorComponent', () => {
  let component: DictEditorComponent;
  let fixture: ComponentFixture<DictEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DictEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DictEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
