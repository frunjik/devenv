import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PPTJSComponent } from './js.component';

describe('PPTJSComponent', () => {
    let fixture: ComponentFixture<PPTJSComponent>;
    let component: PPTJSComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PPTJSComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PPTJSComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('creates the workspace form with input and output controls', () => {
        expect(component.form.controls.input).toBe(component.inputControl);
        expect(component.form.controls.output).toBe(component.outputControl);
        expect(component.inputControl.value).toContain('pipe([1, 2, 3');
    });

    it('evaluates the input expression and stores the result in the output control', () => {
        component.inputControl.setValue('pipe([1, 2, 3], [map(n => n * 2)])');

        component.compile();

        expect(component.outputControl.value).toEqual([2, 4, 6]);
    });

    it('stores evaluation errors in the output control', () => {
        component.inputControl.setValue('(() => { throw new Error("evaluation failed"); })()');

        component.compile();

        expect(component.outputControl.value).toBeInstanceOf(Error);
        expect(component.outputControl.value.message).toBe('evaluation failed');
    });

    it('handles a null input value using the empty-expression fallback', () => {
        component.inputControl.setValue(null);

        component.compile();

        expect(component.outputControl.value).toBeInstanceOf(SyntaxError);
    });

    it('clears the output control', () => {
        component.outputControl.setValue('previous result');

        component.clear();

        expect(component.outputControl.value).toBe('');
    });
});
