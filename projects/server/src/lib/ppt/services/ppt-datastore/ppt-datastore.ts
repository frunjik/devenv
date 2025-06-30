import { type PPTModel } from "@ppt";
import { type EMSlice } from "@shared";
// import { slices } from "./ppt-slices.data";
import { models } from "./ppt-models.data";
import { PPTEventStore } from "../ppt-eventstore";
import { topicMeta } from "../ppt-manager";

export class PPTDataStore {

    getModels(): PPTModel[] {
        return models;
    }

    getSlices(): EMSlice[] {
        // return slices;
        return Object.values(PPTEventStore.current().getState()[topicMeta]['slices']) as EMSlice[];
    }

    private static _current: PPTDataStore;

    static current(): PPTDataStore {
        if (!this._current) {
            this._current = new PPTDataStore();
        }
        return this._current;
    }
}
