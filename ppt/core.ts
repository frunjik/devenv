export type PPTType = string;

export interface PPTBase {
    id: string;
    type: PPTModel | PPTType;
}

// description
export interface PPTField extends PPTBase {
    name: string;
    title?: string;
};

export interface PPTModel extends PPTBase {
    name: string;
    title?: string;
    fields: PPTField[];
};

// // --- generate after this ?

// instance
export interface PPTItem extends PPTBase {
    name: string;
    title?: string;
};

export interface PPTList extends PPTBase {
    name: string;
    title?: string;
    items: PPTItem[];
};
