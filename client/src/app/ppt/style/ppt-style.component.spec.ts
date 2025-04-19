import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PptStyleComponent } from './ppt-style.component';

describe('PptStyleComponent', () => {
  let component: PptStyleComponent;
  let fixture: ComponentFixture<PptStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PptStyleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PptStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
