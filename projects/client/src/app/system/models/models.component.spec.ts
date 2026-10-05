import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ppt } from '@ppt';
import { ModelsComponent } from './models.component';

describe('ModelsComponent', () => {
    let fixture: ComponentFixture<ModelsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ModelsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ModelsComponent);
        fixture.detectChanges();
    });

    it('renders the runtime PPT model registry as formatted text', () => {
        const definition = fixture.nativeElement.querySelector('pre[aria-label="PPT model definitions"]');

        expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('PPT models');
        expect(definition.textContent.trim()).toBe(JSON.stringify(ppt.models, null, 2));
        expect(definition.textContent).toContain('"PPTModel"');
        expect(definition.textContent).toContain('"PPTFieldModel"');
    });

});
