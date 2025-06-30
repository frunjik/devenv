import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyvalueViewComponent } from './keyvalue-view.component';

describe('KeyvalueViewComponent', () => {
  let component: KeyvalueViewComponent;
  let fixture: ComponentFixture<KeyvalueViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyvalueViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyvalueViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
