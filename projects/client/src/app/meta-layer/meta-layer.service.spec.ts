import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { META_LAYER_STORAGE, MetaLayerService, MetaLayerStorage } from './meta-layer.service';

class FakeStorage implements MetaLayerStorage {
    readonly values = new Map<string, string>();

    getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string): void {
        this.values.set(key, value);
    }
}

describe('MetaLayerService', () => {
    let storage: FakeStorage;

    function createService(): MetaLayerService {
        TestBed.configureTestingModule({
            providers: [{ provide: META_LAYER_STORAGE, useValue: storage }],
        });
        return TestBed.inject(MetaLayerService);
    }

    beforeEach(() => {
        storage = new FakeStorage();
    });

    it('uses browser localStorage unless storage is overridden', () => {
        expect(TestBed.inject(META_LAYER_STORAGE)).toBe(localStorage);
    });

    it('is hidden by default', () => {
        expect(createService().enabled()).toBe(false);
    });

    it('toggles on and off and remembers the choice', () => {
        const service = createService();

        service.toggle();
        expect(service.enabled()).toBe(true);
        expect(storage.getItem('meta-layer-enabled')).toBe('true');

        service.toggle();
        expect(service.enabled()).toBe(false);
        expect(storage.getItem('meta-layer-enabled')).toBe('false');
    });

    it('restores an enabled layer from storage', () => {
        storage.setItem('meta-layer-enabled', 'true');

        expect(createService().enabled()).toBe(true);
    });

    it('treats any other stored value as hidden', () => {
        storage.setItem('meta-layer-enabled', 'maybe');

        expect(createService().enabled()).toBe(false);
    });
});
