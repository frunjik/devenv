import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementViewComponent } from './element-view.component';

describe('ElementViewComponent', () => {
    let component: ElementViewComponent;
    let fixture: ComponentFixture<ElementViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ElementViewComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ElementViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
