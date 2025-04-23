import { createReducer, on } from '@ngrx/store';
import { FolderEntriesActions } from './folder-entries.actions';

export const initialState: ReadonlyArray<string> = [];

export const collectionReducer = createReducer(
    initialState,
    on(FolderEntriesActions.deleteFile, (state, { fullpathfilename }) =>
        state.filter((id) => id !== fullpathfilename)
    ),
);