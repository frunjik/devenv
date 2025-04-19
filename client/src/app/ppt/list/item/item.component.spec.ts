import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTItemComponent } from './item.component';

describe('PPTItemComponent', () => {
  let component: PPTItemComponent;
  let fixture: ComponentFixture<PPTItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PPTItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PPTItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
