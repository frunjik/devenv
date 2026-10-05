import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ppt } from '@ppt';
import { ModelsComponent } from './models.component';
import { PPTFieldEditorComponent } from '../ppt/form/ppt-field-editor/ppt-field-editor.component';

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

    it('selects a field and resets the editor to that field', () => {
        const component = fixture.componentInstance;
        const nextField = component.fieldOptions[1];
        const selector = fixture.nativeElement.querySelector('#ppt-field-selection') as HTMLSelectElement;

        selector.value = nextField.key;
        selector.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        const editor = fixture.debugElement.query(By.directive(PPTFieldEditorComponent))
            .componentInstance as PPTFieldEditorComponent;
        expect(component.selectedField).toEqual(nextField.field);
        expect(editor.form.getRawValue().id).toBe(nextField.field.id);
        expect(editor.form.getRawValue().name).toBe(nextField.field.name);
    });

    it('saves field edits to the page model text without mutating the PPT registry', () => {
        const component = fixture.componentInstance;
        const option = component.fieldOptions[0];
        const original = ppt.models[option.modelId];
        const editor = fixture.debugElement.query(By.directive(PPTFieldEditorComponent))
            .componentInstance as PPTFieldEditorComponent;
        editor.form.controls.name.setValue('Locally edited field');

        editor.save();
        fixture.detectChanges();

        expect(component.modelText).toContain('"name": "Locally edited field"');
        expect(ppt.models[option.modelId]).toBe(original);
        expect(JSON.stringify(original)).not.toContain('Locally edited field');
    });

    it('restores the saved in-memory field when editing is cancelled', () => {
        const editor = fixture.debugElement.query(By.directive(PPTFieldEditorComponent))
            .componentInstance as PPTFieldEditorComponent;
        const savedName = editor.form.controls.name.value;
        editor.form.controls.name.setValue('Unsaved name');

        editor.requestCancel();
        fixture.detectChanges();

        expect(editor.form.controls.name.value).toBe(savedName);
    });

    it('ignores unknown field selections without changing the active selection', () => {
        const component = fixture.componentInstance;
        const selectedKey = component.selectedFieldKey;

        component.selectField('missing-field');

        expect(component.selectedFieldKey).toBe(selectedKey);
    });

    it('ignores save events when no field is selected', () => {
        const component = fixture.componentInstance;
        const originalText = component.modelText;
        component.selectedFieldKey = '';

        component.saveField({ id: 'unknown', type: 'string', name: 'Unknown' });

        expect(component.modelText).toBe(originalText);
    });

    it('skips registry values that are not PPT models', () => {
        const key = 'non-model-test-entry';
        ppt.models[key] = { id: key, type: 'string' };

        try {
            const component = new ModelsComponent();

            expect(component.fieldOptions.some(option => option.modelId === key)).toBe(false);
        } finally {
            delete ppt.models[key];
        }
    });

});
