import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { METRIC_METHOD_STORAGE, MetricMethodService, MetricMethodStorage } from './metric-method.service';

class FakeStorage implements MetricMethodStorage {
    readonly values = new Map<string, string>();

    getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string): void {
        this.values.set(key, value);
    }
}

describe('MetricMethodService', () => {
    let storage: FakeStorage;

    function createService(): MetricMethodService {
        TestBed.configureTestingModule({
            providers: [{ provide: METRIC_METHOD_STORAGE, useValue: storage }],
        });
        return TestBed.inject(MetricMethodService);
    }

    beforeEach(() => {
        storage = new FakeStorage();
    });

    it('uses browser localStorage unless storage is overridden', () => {
        expect(TestBed.inject(METRIC_METHOD_STORAGE)).toBe(localStorage);
    });

    it('defaults to impact times urgency', () => {
        expect(createService().method()).toBe('impact-urgency');
    });

    it('remembers a chosen method', () => {
        const service = createService();

        service.setMethod('wsjf');

        expect(service.method()).toBe('wsjf');
        expect(storage.getItem('metric-method')).toBe('wsjf');
    });

    it('restores a previously chosen method from storage', () => {
        storage.setItem('metric-method', 'wsjf');

        expect(createService().method()).toBe('wsjf');
    });

    it('treats an unrecognized stored value as the default', () => {
        storage.setItem('metric-method', 'not-a-method');

        expect(createService().method()).toBe('impact-urgency');
    });
});
