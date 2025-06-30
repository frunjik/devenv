import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadmodelViewComponent } from './readmodel-view.component';

describe('ReadmodelViewComponent', () => {
  let component: ReadmodelViewComponent;
  let fixture: ComponentFixture<ReadmodelViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadmodelViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadmodelViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
