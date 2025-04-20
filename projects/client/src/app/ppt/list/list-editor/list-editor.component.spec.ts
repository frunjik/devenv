import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTListEditorComponent } from './list-editor.component';

describe('PPTListEditorComponent', () => {
  let component: PPTListEditorComponent;
  let fixture: ComponentFixture<PPTListEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PPTListEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PPTListEditorComponent);

    fixture.componentRef.setInput('list', {
        items: []
    });

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
