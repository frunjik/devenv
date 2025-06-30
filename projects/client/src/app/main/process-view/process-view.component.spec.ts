import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessViewComponent } from './process-view.component';

describe('ProcessViewComponent', () => {
  let component: ProcessViewComponent;
  let fixture: ComponentFixture<ProcessViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
