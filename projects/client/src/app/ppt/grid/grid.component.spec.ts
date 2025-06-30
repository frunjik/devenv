import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTGridComponent } from './grid.component';

describe('GridComponent', () => {
    let component: PPTGridComponent;
    let fixture: ComponentFixture<PPTGridComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PPTGridComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PPTGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
