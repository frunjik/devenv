import { version } from './ppt';
import { PPTValue } from './core';
import { modelField, modelModel, modelList, modelItem, modelItemInspector, modelText } from './ppt-models';

export * from './core';
export * from './types';
export * from './helpers';
export * from './response';
export * from './services';

// --- generate after this ?

const allModels = [
    modelField,
    modelModel,
    modelList,
    modelItem,
    modelText,
    modelItemInspector
];

// KeyedItems
export const models: Record<string, PPTValue> = {};

// OrderedItems
allModels.forEach((model) => {
    models[model.id] = model;
});

// only export what can be shared between client and server
// export * from './services/file-system/file-system.service';

export const ppt = { version, models };
