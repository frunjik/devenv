import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ppt } from '@ppt';
import type { PPTField } from '@shared';
import { LoggerService } from '../../logger.service';
import { PPTFieldEditorComponent } from '../ppt/form/ppt-field-editor/ppt-field-editor.component';
import { ModelsComponent } from './models.component';

describe('ModelsComponent', () => {
    let fixture: ComponentFixture<ModelsComponent>;
    let http: HttpTestingController;

    function createComponent(): void {
        fixture = TestBed.createComponent(ModelsComponent);
        fixture.detectChanges();
    }

    function respondWithFields(fields: PPTField[] = []): void {
        http.expectOne('http://localhost:3000/ppt/fields').flush({ data: fields });
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ModelsComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: LoggerService,
                    useValue: { error: (_message: string, _error: Error) => undefined },
                },
            ],
        });
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('renders the runtime PPT model registry as formatted text', () => {
        createComponent();
        respondWithFields();
        const definition = fixture.nativeElement.querySelector('pre[aria-label="PPT model definitions"]');

        expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('PPT models');
        expect(definition.textContent.trim()).toBe(JSON.stringify(ppt.models, null, 2));
        expect(definition.textContent).toContain('"PPTModel"');
        expect(definition.textContent).toContain('"PPTFieldModel"');
    });

    it('selects a field and resets the editor to that field', () => {
        createComponent();
        respondWithFields();
        const component = fixture.componentInstance;
        const nextField = component.fieldOptions[1];
        const selector = fixture.nativeElement.querySelector(
            'select[aria-label="Select a PPT field"]',
        ) as HTMLSelectElement;

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
        createComponent();
        respondWithFields();
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
        createComponent();
        respondWithFields();
        const editor = fixture.debugElement.query(By.directive(PPTFieldEditorComponent))
            .componentInstance as PPTFieldEditorComponent;
        const savedName = editor.form.controls.name.value;
        editor.form.controls.name.setValue('Unsaved name');

        editor.requestCancel();
        fixture.detectChanges();

        expect(editor.form.controls.name.value).toBe(savedName);
    });

    it('ignores unknown field selections without changing the active selection', () => {
        createComponent();
        respondWithFields();
        const component = fixture.componentInstance;
        const selectedKey = component.selectedFieldKey;

        component.selectField('missing-field');

        expect(component.selectedFieldKey).toBe(selectedKey);
    });

    it('ignores save events when no field is selected', () => {
        createComponent();
        respondWithFields();
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
            createComponent();
            respondWithFields();
            expect(fixture.componentInstance.fieldOptions.some(option => option.modelId === key)).toBe(false);
        } finally {
            delete ppt.models[key];
        }
    });

    it('renders fields returned by the server, including model-valued types', () => {
        createComponent();
        const fields: PPTField[] = [
            { id: 'name', type: 'string', name: 'Name', title: 'Display name' },
            {
                id: 'model',
                type: { id: 'PPTModel', type: 'Model', name: 'Model', fields: [] },
                name: 'Model definition',
            },
        ];

        respondWithFields(fields);

        const list = fixture.nativeElement.querySelector('[aria-label="Known PPT fields"]');
        expect(list.textContent).toContain('Name');
        expect(list.textContent).toContain('name');
        expect(list.textContent).toContain('string');
        expect(list.textContent).toContain('Display name');
        expect(list.textContent).toContain('Model definition');
        expect(list.textContent).toContain('Model');
    });

    it('shows an empty state when the server has no known fields', () => {
        createComponent();
        respondWithFields();

        expect(fixture.nativeElement.textContent).toContain('No known PPT fields.');
    });

    it('shows a loading state while requesting known fields', () => {
        createComponent();

        expect(fixture.nativeElement.textContent).toContain('Loading known PPT fields…');
        respondWithFields();
    });

    it('surfaces server errors when known fields cannot be loaded', () => {
        createComponent();
        http.expectOne('http://localhost:3000/ppt/fields')
            .flush({ error: { message: 'Unavailable' } }, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
            .toContain('Could not load known PPT fields');
        expect(fixture.componentInstance.knownPPTFieldsError).toContain('500 Server Error');
    });
});
