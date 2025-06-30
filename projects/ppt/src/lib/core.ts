// export type PPTString = string;
// export type PPTNumber = number;
export type PPTType = string;

export interface PPTValue {
    id: string;
    type?: PPTModel | PPTType;

    // higher up ...
    // toJson?: () => JSON<T>; // should?
    // fromJson<T>?: (j: JSON) => T; // should?
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
