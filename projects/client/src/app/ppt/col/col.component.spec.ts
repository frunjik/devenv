import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTColComponent } from './col.component';

describe('PPTColComponent', () => {
  let component: PPTColComponent;
  let fixture: ComponentFixture<PPTColComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PPTColComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PPTColComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
