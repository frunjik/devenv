import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTListComponent } from './list.component';

describe('PPTListComponent', () => {
  let component: PPTListComponent;
  let fixture: ComponentFixture<PPTListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PPTListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PPTListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
