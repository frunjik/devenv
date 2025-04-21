import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PPTServerComponent } from './server.component';

describe('MetaiiComponent', () => {
    let component: PPTServerComponent;
    let fixture: ComponentFixture<PPTServerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PPTServerComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PPTServerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
