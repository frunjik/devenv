import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTTextComponent } from './text.component';

describe('TextComponent', () => {
    let component: PPTTextComponent;
    let fixture: ComponentFixture<PPTTextComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PPTTextComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PPTTextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
