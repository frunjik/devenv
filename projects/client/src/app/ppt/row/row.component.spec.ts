import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTRowComponent } from './row.component';

describe('PPTRowComponent', () => {
  let component: PPTRowComponent;
  let fixture: ComponentFixture<PPTRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PPTRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PPTRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
