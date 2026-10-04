import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaiiComponent } from './metaii.component';

describe('MetaiiComponent', () => {
  let component: MetaiiComponent;
  let fixture: ComponentFixture<MetaiiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetaiiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetaiiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
