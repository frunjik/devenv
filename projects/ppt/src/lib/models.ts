// export type PPTString = string;
// export type PPTNumber = number;

import { Signal } from "@angular/core";

export interface PPTFeature {
    id: string;
    description: string;
    status: 'Questions' | 'Wished' | 'Backlog' | 'Queued' | 'Committed'
        | 'InProgress' | 'Delivered' | 'Done' | 'Aborted' | 'Denied' | 'Archived';
    priority: 'High' | 'Medium' | 'Low';
    createdAt?: string;
    deliveredDate?: string;
}

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
