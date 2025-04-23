import { createAction, createActionGroup, props } from '@ngrx/store';
import { PPTFolderEntry, PPTResult } from '@ppt';

export const FileEditorActions = createActionGroup({
    source: 'FileEditor',
    events: {
        'Load File': props<{ fullpathfilename: string }>(),
        'Save File': props<{ fullpathfilename: string; contents: string }>(),
        // 'Delete File': props<{ fullpathfilename: string; contents: string }>(),
        // 'Get FolderEntries': props<{ fullpathfilename: string; contents: string }>(),
    },
});
