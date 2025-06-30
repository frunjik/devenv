import { type PPTValue } from "./core";

// instance
export interface PPTItem extends PPTValue {
    name: string;
    title?: string;
};

export interface PPTListOfItems extends PPTValue {
    name: string;
    title?: string;
    items: PPTItem[];
};

// Readonly (ReadModel)
export type PPTList<T> = ReadonlyArray<T>;
export type PPTDict<T> = Record<string, T>;

export interface PPTState<M,D> {
    readonly meta: M,
    readonly data: D,
}
