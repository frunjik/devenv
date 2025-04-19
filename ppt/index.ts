import { version } from './ppt';
import { PPTBase } from './core';
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
export const models: Record<string, PPTBase> = {};

// OrderedItems
allModels.forEach((model) => {
    models[model.id] = model;
});


export * from './core';
export const ppt = { version, models };
