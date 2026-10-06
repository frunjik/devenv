import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { METRIC_METHODS, MetricMethod } from './ticket-metrics';

export interface MetricMethodStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export const METRIC_METHOD_STORAGE = new InjectionToken<MetricMethodStorage>('METRIC_METHOD_STORAGE', {
    providedIn: 'root',
    factory: () => localStorage,
});

const STORAGE_KEY = 'metric-method';
const DEFAULT_METHOD: MetricMethod = 'impact-urgency';

function isMetricMethod(value: string | null): value is MetricMethod {
    return METRIC_METHODS.some(method => method.id === value);
}

@Injectable({ providedIn: 'root' })
export class MetricMethodService {
    private readonly storage = inject(METRIC_METHOD_STORAGE);
    private readonly state = signal<MetricMethod>(toMetricMethod(this.storage.getItem(STORAGE_KEY)));

    readonly method = this.state.asReadonly();

    setMethod(method: MetricMethod): void {
        this.state.set(method);
        this.storage.setItem(STORAGE_KEY, method);
    }
}

function toMetricMethod(stored: string | null): MetricMethod {
    return isMetricMethod(stored) ? stored : DEFAULT_METHOD;
}
