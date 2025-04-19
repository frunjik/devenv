// import { PPTField, PPTModel } from './core';
import { models } from './models';
import { version } from './ppt';

// moved from ./core (for now - until i figure out how the import works)
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

// --- generate after this ?

export interface PPTItem {
    id: string;
    type: PPTModel | string;
    name: string;
    title?: string;
};

export interface PPTList {
    id: string;
    type: PPTModel | string;
    name: string;
    title?: string;
    items: PPTItem[];
};

export const ppt = { version, models };
