import { createActionGroup, props } from '@ngrx/store';
import { PPTFolderEntry } from '@ppt';

export const FileSystemActions = createActionGroup({
    source: 'FileSystem',
    events: {
        'Retrieved FolderEntry List': props<{ folderEntries: ReadonlyArray<PPTFolderEntry> }>(),
        // 'Retrieved File': props<{ contents: string }>(),
        // 'Persisted File': props<{ result: void }>(),
        // 'Deleted File': props<{ result: void }>(),
    },
});
