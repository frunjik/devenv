export interface PPTModel {
    id: string;
    name: string;
    title?: string;
    fields: PPTField[];
};

export interface PPTField {
    id: string;
    type: PPTModel | string;
    name: string;
    title?: string;
};

// TODO: Generate - everyting after this with the description above

const idField: PPTField = {
    id: 'PPTField.id',
    type: 'ID',
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

// freeze
export const modelModel: PPTModel = {
    id: 'PPTModel',
    name: 'Basic Model',
    fields: [
        idField,
        nameField,
        tileField,
        fieldsField
    ]
}

export const modeField: PPTModel = {
    id: 'PPTField',
    name: 'Basic Field',
    fields: [
        idField,
        typeField,
        nameField,
        tileField,
    ]
}
