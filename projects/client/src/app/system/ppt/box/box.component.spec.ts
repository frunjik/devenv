import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTBoxComponent } from './box.component';

describe('PPTBoxComponent', () => {
    let component: PPTBoxComponent;
    let fixture: ComponentFixture<PPTBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PPTBoxComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PPTBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
