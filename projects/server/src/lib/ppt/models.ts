import { PPTField, PPTModel } from './core';
// TODO: Generate
// everyting after this from its own descriptions below

const idField: PPTField = {
    id: '___PPTField.id',
    type: 'string',
    name: 'Unique ID',
};

const nameField: PPTField = {
    id: 'PPTField.name',
    type: 'string',
    name: 'Name',
};

const typeField: PPTField = {
    id: 'PPTField.type',
    type: 'string',
    name: 'Type',
};

const tileField: PPTField = {
    id: 'PPTField.title',
    type: 'string',
    name: 'Title',
};

const fieldsField: PPTField = {
    id: 'PPTField.fields',
    type: 'PPTField[]',
    name: 'Fields',
};

// const extendsField: PPTField = {
//     id: 'PPTField.extends',
//     type: 'PPTTExtend',
//     name: 'Extends',
// };

export const modelModel: PPTModel = {
    id: 'PPTModel',
    name: 'Basic Model',
    type: 'Model',
    // tite: '',
    fields: [
        idField,
        nameField,
        typeField,
        tileField,
        fieldsField
    ]
}

export const modelField: PPTModel = {
    id: 'PPTField',
    name: 'Basic Field',
    type: 'Field',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
    ]
}

export const modelList: PPTModel = {
    id: 'PPTList',
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

export const modelItem: PPTModel = {
    id: 'PPTItem',
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
    id: 'PPTItemInspector',
    name: 'Basic Item Inspector',
    type: 'Inspector',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
    ]
}
