import {type PPTField, type PPTModel} from '@ppt';

export const idField: PPTField = {
    id: 'PPTField',
    type: 'string',
    name: 'Field',
};

export const nameField: PPTField = {
    id: 'PPTName',
    type: 'string',
    name: 'Name',
};

export const typeField: PPTField = {
    id: 'PPTType',
    type: 'string',
    name: 'Type',
};

export const textField: PPTField = {
    id: 'PPTText',
    type: 'string',
    name: 'Text',
};

export const tileField: PPTField = {
    id: 'PPTTile',
    type: 'string',
    name: 'Title',
};

export const fieldsField: PPTField = {
    id: 'PPTFields',
    type: 'PPTField[]',
    name: 'Fields',
};

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

export const models: PPTModel[] = [
    modelModel,
    modelField
];
