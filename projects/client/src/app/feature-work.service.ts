import { Injectable } from '@angular/core';

export interface ActiveFeature {
    id: string;
    description: string;
}

@Injectable({ providedIn: 'root' })
export class FeatureWorkService {
    activeFeature: ActiveFeature | null = null;

    start(id: string, description: string): void {
        this.activeFeature = { id, description };
    }

    complete(id: string): void {
        if (this.activeFeature?.id === id) {
            this.activeFeature = null;
        }
    }
}
