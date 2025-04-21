import { PPTField, PPTModel } from './core';
// TODO: Generate
// everyting after this from its own descriptions below

const idField: PPTField = {
    id: 'PPTField',
    type: 'string',
    name: 'Field',
};

const nameField: PPTField = {
    id: 'PPTName',
    type: 'string',
    name: 'Name',
};

const typeField: PPTField = {
    id: 'PPTType',
    type: 'string',
    name: 'Type',
};

const textField: PPTField = {
    id: 'PPTText',
    type: 'string',
    name: 'Text',
};

const tileField: PPTField = {
    id: 'PPTTile',
    type: 'string',
    name: 'Title',
};

const fieldsField: PPTField = {
    id: 'PPTFields',
    type: 'PPTField[]',
    name: 'Fields',
};

// const extendsField: PPTField = {
//     id: 'PPTField_extends',
//     type: 'PPTTExtend',
//     name: 'Extends',
// };

export const modelModel: PPTModel = {
    id: 'PPTModel',
    name: 'Basic Model',
    type: 'Model',
    title: 'A Description of a Thing',
    fields: [
        idField,
        nameField,
        typeField,
        tileField,
        fieldsField
    ]
}

export const modelField: PPTModel = {
    id: 'PPTFieldModel',
    name: 'Basic Field',
    type: 'Field',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
    ]
}

export const modelText: PPTModel = {
    id: 'PPTextModel',
    name: 'Basic Text',
    type: 'Text',
    fields: [
        idField,
        typeField,
        nameField,
        // tileField,
        textField
    ]
}

export const modelList: PPTModel = {
    id: 'PPTListModel',
    name: 'Basic List',
    type: 'List',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
        // content
    ]
}

export const modelInput: PPTModel = {
    id: 'PPTInputModel',
    name: 'Basic Input',
    type: 'Input',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
    ]
}

export const modelOutput: PPTModel = {
    id: 'PPTOutputModel',
    name: 'Basic Output',
    type: 'Output',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
        // items
    ]
}

export const modelInputs: PPTModel = {
    id: 'PPTInputsModel',
    name: 'Basic Inputs',
    type: 'Inputs',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
        {
            id: 'PPTInputs',
            type: 'PPTModelInput[]',
            name: 'Inputs',
        }
    ]
}

export const modelOutputs: PPTModel = {
    id: 'PPTOutputsModel',
    name: 'Basic Outputs',
    type: 'Output',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
        {
            id: 'PPTOutputs',
            type: 'PPTModelOutput[]',
            name: 'Outputs',
        }
    ]
}

export const modelItem: PPTModel = {
    id: 'PPTItemModel',
    name: 'Basic Item',
    type: 'Item',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
        // content
    ]
}

export const modelItemInspector: PPTModel = {
    id: 'PPTInspectorModel',
    name: 'Basic Item Inspector',
    type: 'Inspector',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
    ]
}

export const modelComponent: PPTModel = {
    id: 'PPTComponentModel',
    name: 'Basic Components',
    type: 'Component',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
    ]
}
