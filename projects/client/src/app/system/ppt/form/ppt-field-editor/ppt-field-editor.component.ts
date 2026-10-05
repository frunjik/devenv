import { Component, OnChanges, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { PPTField } from '@shared';

@Component({
    selector: 'ppt-field-editor',
    standalone: true,
    imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
    templateUrl: './ppt-field-editor.component.html',
    styleUrl: './ppt-field-editor.component.scss',
})
export class PPTFieldEditorComponent implements OnChanges {
    field = input.required<PPTField>();
    fieldSaved = output<PPTField>();
    cancelRequested = output<void>();

    form!: FormGroup<{
        id: FormControl<string>;
        type: FormControl<string>;
        name: FormControl<string>;
        title: FormControl<string>;
    }>;
    typeError = '';

    private typeIsModel = false;

    ngOnChanges(): void {
        const field = this.field();
        this.typeIsModel = typeof field.type !== 'string';
        const type = typeof field.type === 'string' ? field.type : JSON.stringify(field.type, null, 2);
        if (type === undefined) {
            throw new Error('PPTField type could not be serialized.');
        }

        this.form = new FormGroup({
            id: new FormControl(field.id, { nonNullable: true, validators: [Validators.required] }),
            type: new FormControl(type, { nonNullable: true, validators: [Validators.required] }),
            name: new FormControl(field.name, { nonNullable: true, validators: [Validators.required] }),
            title: new FormControl(field.title ?? '', { nonNullable: true }),
        });
    }

    save(): void {
        this.typeError = '';
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const value = this.form.getRawValue();
        let type: PPTField['type'] = value.type;
        if (this.typeIsModel) {
            try {
                type = JSON.parse(value.type);
            } catch {
                this.typeError = 'Type must contain valid JSON for a model.';
                return;
            }
        }

        const field: PPTField = {
            id: value.id,
            type,
            name: value.name,
            ...(value.title ? { title: value.title } : {}),
        };
        this.fieldSaved.emit(field);
    }

    requestCancel(): void {
        this.cancelRequested.emit();
    }
}
