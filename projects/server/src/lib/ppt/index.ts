import { version } from './ppt';
import { PPTValue } from '@ppt';

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

// only export what can be shared between client and server
// export * from './services/file-system/file-system.service';

export const ppt = { version, models };
