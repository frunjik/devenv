import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliceViewComponent } from './slice-view.component';

describe('SliceViewComponent', () => {
  let component: SliceViewComponent;
  let fixture: ComponentFixture<SliceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliceViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
