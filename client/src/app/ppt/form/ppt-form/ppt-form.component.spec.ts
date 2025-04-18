import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
