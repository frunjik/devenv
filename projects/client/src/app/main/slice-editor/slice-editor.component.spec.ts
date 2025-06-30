import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliceEditorComponent } from './slice-editor.component';

describe('SliceEditorComponent', () => {
  let component: SliceEditorComponent;
  let fixture: ComponentFixture<SliceEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliceEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliceEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
