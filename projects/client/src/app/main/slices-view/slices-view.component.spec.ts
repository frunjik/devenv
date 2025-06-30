import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlicesViewComponent } from './slices-view.component';

describe('SlicesViewComponent', () => {
  let component: SlicesViewComponent;
  let fixture: ComponentFixture<SlicesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlicesViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlicesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
