import { version } from './ppt';
import { PPTValue } from './core';
import { modelField, modelModel, modelList, modelItem, modelItemInspector, modelText, modelPatch } from './ppt-models';

export * from './core';
export * from './models';

export * from './response';
export * from './services';
export * from './ppt-models';

export const modelsList = [
    modelField,
    modelModel,
    modelPatch,
    modelList,
    modelItem,
    modelText,
    modelItemInspector
];

// keyed
export const modelsDict: Record<string, PPTValue> = {};

// index
modelsList.forEach((model) => {
    modelsDict[model.id] = model;
});

export const ppt = { version, modelsDict, modelsList };
