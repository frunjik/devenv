import { Component, computed, input, Signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup } from '@angular/forms';
import { ppt, PPTValue, PPTField, PPTModel } from '@ppt';
import { PPTFormFieldComponent } from '../ppt-form-field/ppt-form-field.component';
import { PPTFormModule } from '../../../ppt-form.module';
import { MatButtonModule } from '@angular/material/button';

type PPTKeyedItems = Record<string, PPTValue>;
type PPTOrderedItems = Array<PPTValue>;

const pptIdentity = (o:any) => o;

function pptConvertOrderedToKeyed(values: PPTOrderedItems, f: Function = pptIdentity): PPTKeyedItems {
    const keyed: Record<string, PPTValue> = {};
    values.forEach((item) => {
        keyed[item.id] = f(item);
    });
    return keyed;
}

// function pptConvertOrderedToNamed(values: PPTOrderedItems, f: Function = pptIdentity): PPTKeyedItems {
//     const keyed: Record<string, PPTValue> = {};
//     values.forEach((item) => {
//         keyed[item.name] = f(item);
//     });
//     return keyed;
// }

// function pptConvertKeyedToOrdered(values: PPTKeyedItems, f: Function = pptIdentity): PPTValue[] {
//     return pptKeys(values).map((key) => f(values[key]));
// }

// function pptMap(items: PPTValue[], f: Function) {
//     return items.map(f as any);
// }

// function pptKeys(items: PPTKeyedItems): string[] {
//     return Object.keys(items);
// }

function createAngularFormControl(field: PPTField) {
    return new FormControl();
}

@Component({
    selector: 'ppt-form',
    templateUrl: './ppt-form.component.html',
    styleUrl: './ppt-form.component.scss',
    imports: [
        MatButtonModule,
        MatInputModule, 
        MatSelectModule,
        PPTFormModule,
        PPTFormFieldComponent,
    ],
})
export class PPTFormComponent {

    // make input
    model = input<PPTModel>(ppt.models['PPTModel'] as PPTModel);
    form: Signal<FormGroup> = computed(() => this.createFormGroup(this.model(), this.model().fields));

    createFormGroup(model: PPTModel, fields: PPTField[]): FormGroup {
        const f: any = pptConvertOrderedToKeyed(fields, createAngularFormControl);

        console.log(f);

        return new FormGroup(f);
    }

    // createFormControls(xfields: PPTField[]) {
    //     const fields: any = {};
    //     xfields.forEach((field) => {
    //         fields[field.id] = this.createFormField(field);
    //     });
    //     return new FormGroup(fields);
    // }

    // createFormControl(_field: PPTField) {
    //     return new FormControl();
    // }
}
