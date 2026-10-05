// export type PPTString = string;
// export type PPTNumber = number;

import { Signal } from "@angular/core";

export type FeaturePriority = 'High' | 'Medium' | 'Low';

export type FeatureStatus = 'Questions' | 'Backlog' | 'In progress' | 'Committed' | 'Done' | 'Aborted' | 'Denied';

export interface PPTFeature {
    id: string;
    description: string;
    priority: FeaturePriority;
    status: FeatureStatus;
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
