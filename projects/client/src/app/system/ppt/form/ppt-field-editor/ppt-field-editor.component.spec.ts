import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { PPTField, PPTModel } from '@shared';
import { PPTFieldEditorComponent } from './ppt-field-editor.component';

describe('PPTFieldEditorComponent', () => {
    let fixture: ComponentFixture<PPTFieldEditorComponent>;
    let component: PPTFieldEditorComponent;

    function createComponent(field: PPTField): void {
        fixture = TestBed.createComponent(PPTFieldEditorComponent);
        fixture.componentRef.setInput('field', field);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PPTFieldEditorComponent],
        }).compileComponents();
    });

    it('initializes form values from the field and emits edited string-type data', () => {
        createComponent({ id: 'field-name', type: 'string', name: 'Name', title: 'Display name' });
        const saved: PPTField[] = [];
        component.fieldSaved.subscribe(field => saved.push(field));

        component.form.setValue({
            id: 'field-title',
            type: 'number',
            name: 'Title',
            title: 'Display title',
        });
        component.save();

        expect(saved).toEqual([{
            id: 'field-title',
            type: 'number',
            name: 'Title',
            title: 'Display title',
        }]);
    });

    it('omits an empty optional title', () => {
        createComponent({ id: 'field-name', type: 'string', name: 'Name', title: 'Old title' });
        const saved: PPTField[] = [];
        component.fieldSaved.subscribe(field => saved.push(field));
        component.form.controls.title.setValue('');

        component.save();

        expect(saved[0]).not.toHaveProperty('title');
    });

    it('preserves and parses a model-valued type', () => {
        const model: PPTModel = {
            id: 'PPTModel',
            type: 'Model',
            name: 'Model',
            fields: [],
        };
        createComponent({ id: 'field-model', type: model, name: 'Model' });
        const saved: PPTField[] = [];
        component.fieldSaved.subscribe(field => saved.push(field));

        component.save();

        expect(saved[0].type).toEqual(model);
        component.form.controls.type.setValue(JSON.stringify({ ...model, name: 'Updated model' }));
        component.save();
        expect(saved[1].type).toEqual({ ...model, name: 'Updated model' });
    });

    it('reports invalid JSON for model-valued types without emitting', () => {
        createComponent({
            id: 'field-model',
            type: { id: 'PPTModel', type: 'Model', name: 'Model', fields: [] },
            name: 'Model',
        });
        const saved: PPTField[] = [];
        component.fieldSaved.subscribe(field => saved.push(field));
        component.form.controls.type.setValue('{invalid');

        component.save();
        fixture.detectChanges();

        expect(component.typeError).toBe('Type must contain valid JSON for a model.');
        expect(saved).toEqual([]);
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
            .toContain('valid JSON');
    });

    it('does not emit when required controls are invalid', () => {
        createComponent({ id: 'field-name', type: 'string', name: 'Name' });
        const saved: PPTField[] = [];
        component.fieldSaved.subscribe(field => saved.push(field));
        component.form.controls.name.setValue('');

        component.save();

        expect(component.form.controls.name.touched).toBe(true);
        expect(saved).toEqual([]);
    });

    it('emits the cancel output when cancel is requested', () => {
        createComponent({ id: 'field-name', type: 'string', name: 'Name' });
        const emit = jest.spyOn(component.cancelRequested, 'emit');

        component.requestCancel();

        expect(emit).toHaveBeenCalledTimes(1);
    });

    it('reports a model type that cannot be serialized', () => {
        const modelWithToJson = {
            id: 'PPTModel',
            type: 'Model',
            name: 'Model',
            fields: [],
            toJSON: () => undefined,
        };
        const model: PPTModel = modelWithToJson;
        fixture = TestBed.createComponent(PPTFieldEditorComponent);
        fixture.componentRef.setInput('field', { id: 'field-model', type: model, name: 'Model' });

        expect(() => fixture.detectChanges()).toThrow('PPTField type could not be serialized.');
    });
});
