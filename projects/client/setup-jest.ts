import { deserialize, serialize } from 'node:v8';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// jsdom does not provide structuredClone, which the in-process server's ticket store uses.
globalThis.structuredClone ??= <T>(value: T): T => deserialize(serialize(value));
