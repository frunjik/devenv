import { Injectable, InjectionToken, inject, signal } from '@angular/core';

export interface MetaLayerStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export const META_LAYER_STORAGE = new InjectionToken<MetaLayerStorage>('META_LAYER_STORAGE', {
    providedIn: 'root',
    factory: () => localStorage,
});

const STORAGE_KEY = 'meta-layer-enabled';

@Injectable({ providedIn: 'root' })
export class MetaLayerService {
    private readonly storage = inject(META_LAYER_STORAGE);
    private readonly state = signal(this.storage.getItem(STORAGE_KEY) === 'true');

    readonly enabled = this.state.asReadonly();

    toggle(): void {
        const next = !this.state();
        this.state.set(next);
        this.storage.setItem(STORAGE_KEY, String(next));
    }
}
