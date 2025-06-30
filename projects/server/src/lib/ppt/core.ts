import { PPTItem, PPTValue } from "@ppt";

export interface PPTListOfItems extends PPTValue {
    name: string;
    title?: string;
    items: PPTItem[];
};
