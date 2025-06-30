import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandViewComponent } from './command-view.component';

describe('CommandViewComponent', () => {
  let component: CommandViewComponent;
  let fixture: ComponentFixture<CommandViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
