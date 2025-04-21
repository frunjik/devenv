// export type PPTString = string;
// export type PPTNumber = number;

import { Signal } from "@angular/core";

export interface PPTTextModel {
    id: string;
    type: 'PPTText',
    value: string;
}

export interface PPTTextComponentModel {
    id: string;
    type: 'PPTTextComponent',
    text: PPTTextModel;
    input: Signal<string>;
    output: Signal<string>;
}
