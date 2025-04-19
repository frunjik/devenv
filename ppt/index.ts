import { version } from './ppt';
import { PPTValue } from './core';
import { modelField, modelModel, modelList, modelItem, modelItemInspector } from './models';

// --- generate after this ?

const allModels = [
    modelField,
    modelModel,
    modelList,
    modelItem,
    modelItemInspector
];

// KeyedItems
export const models: Record<string, PPTValue> = {};

// OrderedItems
allModels.forEach((model) => {
    models[model.id] = model;
});


export * from './core';
export * from './services/file-system/file-system.service';

export const ppt = { version, models };
