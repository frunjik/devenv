import { createAction, createActionGroup, props } from '@ngrx/store';
import { PPTFolderEntry, PPTResult } from '@ppt';

// export const editFile = createAction(
//     '[Edit File] Edit',
//     props<{ fullpathfilename: string; }>()
// );

// export const browseFolder = createAction(
//     '[Browse Folder] Browse',
//     props<{ fullpathname: string; }>()
// );

export const FolderEntriesActions = createActionGroup({
    source: 'FolderEntries',
    events: {
        'Delete File': props<{ fullpathfilename: string }>(),
    },
});

