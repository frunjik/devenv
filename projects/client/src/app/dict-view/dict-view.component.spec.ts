import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DictViewComponent } from './dict-view.component';

describe('DictViewComponent', () => {
  let component: DictViewComponent;
  let fixture: ComponentFixture<DictViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DictViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DictViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
