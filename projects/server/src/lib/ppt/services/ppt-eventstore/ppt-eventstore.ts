import { produce, applyPatches, enablePatches, type Patch } from "immer"
import { PPTFileSystem } from "../file-system/file-system";

enablePatches()

export interface Transaction {
    changes: Patch[],
    inverse: Patch[],
}

const state = {};

const FILENAMES = {
    state: 'data/state.data',
    changes: 'data/changes.data',
    inverse: 'data/inverse.data'
};

export class PPTEventStore {

    private _state: any = state;
    private _changes: Patch[] = [];
    private _inverse: Patch[] = [];

    private _fs = new PPTFileSystem();

    getState(): any {
        return this._state;
    }

    getChanges(): Patch[] {
        return this._changes;
    }

    getInverse(): Patch[] {
        return this._inverse.splice(0).reverse();
    }

    produce(
        recipe: (x: any) => any
    ): Transaction {
        const t = this.create(recipe);
        this.commit(t);
        return t;
    }

    create(
        recipe: (x: any) => any
    ): Transaction {

        const changes: Patch[] = [];
        const inverse: Patch[] = [];

        produce(
            this.getState(),
            recipe,
            // The third argument to produce is a callback to which the patches will be fed
            (patches, inversePatches) => {
                changes.push(...patches)
                inverse.push(...inversePatches)
            }
        );

        return { changes, inverse }
    }

    commit(t: Transaction) {
        // TODO: Async ...
        this.persistChanges(t.changes, t.inverse);
        this._changes.push(...t.changes);
        this._inverse.push(...t.inverse);
        this.apply(t.changes);
        this.persistState();
    }

    apply(changes: Patch[]) {
        this._state = applyPatches(this.getState(), changes);
    }

    persistChanges(changes: Patch[], inverse: Patch[]) {
        return Promise.all([
            this._fs.appendFile(FILENAMES.changes, JSON.stringify(changes)),
            this._fs.appendFile(FILENAMES.inverse, JSON.stringify(inverse))
        ]);
    }

    persistState() {
        return this._fs.writeFile(FILENAMES.state, JSON.stringify(this.getState(), null, 4));
    }

    restore() {
        return this._fs.readFile(FILENAMES.state).then(
            state => {
                this._state = JSON.parse(state);
                return this.deleteHistory();
            }
        );
    }

    clearHistory() {
        this.persistState().then(() => {
            return this.deleteHistory();
        });
    }

    private static _current: PPTEventStore;

    private deleteHistory() {
        return Promise.all([
            this._fs.deleteFile(FILENAMES.changes).catch(() => {}),
            this._fs.deleteFile(FILENAMES.inverse).catch(() => {})
        ]);
    }

    static current(): PPTEventStore {
        if (!this._current) {
            this._current = new PPTEventStore();
        }
        return this._current;
    }

}
