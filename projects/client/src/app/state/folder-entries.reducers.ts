import { createReducer, on } from '@ngrx/store';

import { FileSystemActions } from './file-system.actions';
import { PPTFolderEntry } from '@ppt';

export const initialState: ReadonlyArray<PPTFolderEntry> = [];

export const folderEntriesReducer = createReducer(
    initialState,
    on(FileSystemActions.retrievedFolderEntryList, (_state, { folderEntries }) => folderEntries)
);
