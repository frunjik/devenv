import { type EMElement } from "@shared";
import { PPTEventStore } from "../ppt-eventstore";
import { applyPatches, Patch } from "immer";

const increaseAge = (draft: any) => {
    draft['age'] = 1 + (draft['age'] ?? 0);
}

export const topicMeta = 'meta';

export class PPTManager {
    private _id = 0;
    private _store = PPTEventStore.current();

    private nextId(): string {
        this._id += 1;
        return this._id.toString();
    }

    restore(): Promise<any> {
        return this._store.restore().then(() => {
            return this._store.getState();
        })
    }

    postCommand(command: EMElement): EMElement {
        this._store.produce(
            increaseAge,
        );

        return {
            id: this.nextId(),
            type: 'event',
            name: command?.name ?? '*COMMAND*'
        };    

    }

    postPatches(patches: Patch[]): EMElement {
        this._store.produce(
            (draft) => {
                increaseAge(draft);
                draft[topicMeta] = applyPatches(draft[topicMeta] ?? {}, patches)
            },
        );

        return {
            id: this.nextId(),
            type: 'event',
            name: '*EVENT*'
        };    

    }

    private static _current: PPTManager;

    static current(): PPTManager {
        if (!this._current) {
            this._current = new PPTManager();
        }
        return this._current;
    }

}
