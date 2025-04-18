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
