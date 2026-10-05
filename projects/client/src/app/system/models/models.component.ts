import { Component, OnInit, inject } from '@angular/core';
import { ppt } from '@ppt';
import type { PPTField, PPTModel, PPTValue } from '@shared';
import { BackendService } from '../../backend.service';
import { PPTFieldEditorComponent } from '../ppt/form/ppt-field-editor/ppt-field-editor.component';

interface FieldOption {
    key: string;
    modelId: string;
    fieldIndex: number;
    label: string;
    field: PPTField;
}

function isPPTModel(value: PPTValue): value is PPTModel {
    return 'fields' in value && Array.isArray(value.fields) && 'name' in value;
}

@Component({
    selector: 'app-models',
    standalone: true,
    imports: [PPTFieldEditorComponent],
    templateUrl: './models.component.html',
    styleUrl: './models.component.scss',
})
export class ModelsComponent implements OnInit {
    private readonly backend = inject(BackendService);
    private readonly models: Record<string, PPTValue> = Object.fromEntries(
        Object.entries(ppt.models).map(([key, value]) => [
            key,
            isPPTModel(value) ? { ...value, fields: value.fields.map(field => ({ ...field })) } : value,
        ]),
    );
    readonly fieldOptions: FieldOption[] = Object.values(this.models).flatMap(model => {
        if (!isPPTModel(model)) {
            return [];
        }
        return model.fields.map((field, fieldIndex) => ({
            key: `${model.id}:${fieldIndex}`,
            modelId: model.id,
            fieldIndex,
            label: `${model.name}: ${field.name}`,
            field,
        }));
    });
    selectedField: PPTField | null = null;
    selectedFieldKey = '';
    modelText = JSON.stringify(this.models, null, 2);
    knownPPTFields: PPTField[] = [];
    isLoadingKnownPPTFields = true;
    knownPPTFieldsError = '';

    constructor() {
        const firstField = this.fieldOptions[0];
        if (firstField) {
            this.selectField(firstField.key);
        }
    }

    ngOnInit(): void {
        this.backend.getPPTFields().subscribe({
            next: fields => {
                this.knownPPTFields = fields;
                this.isLoadingKnownPPTFields = false;
            },
            error: (error: Error) => {
                this.knownPPTFieldsError = error.message;
                this.isLoadingKnownPPTFields = false;
            },
        });
    }

    fieldTypeLabel(field: PPTField): string {
        return typeof field.type === 'string' ? field.type : field.type.name;
    }

    selectField(key: string): void {
        const option = this.fieldOptions.find(candidate => candidate.key === key);
        if (!option) {
            return;
        }
        this.selectedFieldKey = option.key;
        this.selectedField = { ...option.field };
    }

    saveField(field: PPTField): void {
        const option = this.fieldOptions.find(candidate => candidate.key === this.selectedFieldKey);
        const model = option ? this.models[option.modelId] : undefined;
        if (!option || !model || !isPPTModel(model)) {
            return;
        }
        const updatedField = { ...field };
        model.fields[option.fieldIndex] = updatedField;
        option.field = updatedField;
        option.label = `${model.name}: ${updatedField.name}`;
        this.selectedField = { ...updatedField };
        this.modelText = JSON.stringify(this.models, null, 2);
    }

    cancelField(): void {
        this.selectField(this.selectedFieldKey);
    }
}
