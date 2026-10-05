import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { MetaLayerToggleComponent } from './meta-layer-toggle.component';
import { META_LAYER_STORAGE } from './meta-layer.service';

describe('MetaLayerToggleComponent', () => {
    let fixture: ComponentFixture<MetaLayerToggleComponent>;

    function button(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('button');
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MetaLayerToggleComponent],
            providers: [{
                provide: META_LAYER_STORAGE,
                useValue: { getItem: () => null, setItem: () => undefined },
            }],
        });
        fixture = TestBed.createComponent(MetaLayerToggleComponent);
        fixture.detectChanges();
    });

    it('offers to show the meta layer while it is hidden', () => {
        expect(button().getAttribute('aria-pressed')).toBe('false');
        expect(button().getAttribute('aria-label')).toBe('Show meta layer');
    });

    it('switches the meta layer on and off', () => {
        button().click();
        fixture.detectChanges();

        expect(button().getAttribute('aria-pressed')).toBe('true');
        expect(button().getAttribute('aria-label')).toBe('Hide meta layer');

        button().click();
        fixture.detectChanges();

        expect(button().getAttribute('aria-pressed')).toBe('false');
    });
});
