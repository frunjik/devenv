import { PPTField, PPTModel } from './core';
// TODO: Generate
// everyting after this from its own descriptions below

const idField: PPTField = {
    id: 'PPTIDField',
    type: 'string',
    name: 'id',
};

const nameField: PPTField = {
    id: 'PPTNameField',
    type: 'string',
    name: 'name',
};

const typeField: PPTField = {
    id: 'PPTTypeField',
    type: 'string',
    name: 'type',
};

const tileField: PPTField = {
    id: 'PPTTitleField',
    type: 'string',
    name: 'title',
};

const fieldsField: PPTField = {
    id: 'PPTFieldsField',
    type: 'PPTField[]',
    name: 'fields',
};

// const extendsField: PPTField = {
//     id: 'PPTField.extends',
//     type: 'PPTTExtend',
//     name: 'Extends',
// };

export const modelModel: PPTModel = {
    id: 'PPTModel',
    name: 'model',
    type: 'Model',
    title: 'Basic Model',
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
    name: 'field',
    type: 'Bacic Field',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
    ]
}

export const modelList: PPTModel = {
    id: 'PPTList',
    name: 'list',
    type: 'List',
    title: 'Basic List',
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
    name: 'item',
    type: 'Item',
    title: 'Basic Item',
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
    name: 'inspector',
    type: 'Inspector',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
    ]
}
