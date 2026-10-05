export type PPTType = string;

export interface PPTValue {
    id: string;
    type: PPTModel | PPTType;
}

// description
export interface PPTField extends PPTValue {
    name: string;
    title?: string;
};

export interface PPTModel extends PPTValue {
    name: string;
    title?: string;
    fields: PPTField[];
};

export interface PPTItem extends PPTValue {
    name: string;
    title?: string;
};

export interface PPTList extends PPTValue {
    name: string;
    title?: string;
    items: PPTItem[];
};
