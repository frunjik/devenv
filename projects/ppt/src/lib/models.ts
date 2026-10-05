// export type PPTString = string;
// export type PPTNumber = number;

import { Signal } from "@angular/core";

export type FeaturePriority = 'High' | 'Medium' | 'Low';

export type PPTFeatureStatus = 'Questions' | 'Wished' | 'Backlog' | 'Queued' | 'Committed' | 'InProgress' | 'Delivered' | 'Done' | 'Aborted' | 'Denied' | 'Archived' ;

export interface PPTFeature {
    id: string;
    description: string;
    status: PPTFeatureStatus;
    priority: FeaturePriority;
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
