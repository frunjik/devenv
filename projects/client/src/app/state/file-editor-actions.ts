import { createAction, createActionGroup, props } from '@ngrx/store';
import { PPTFolderEntry } from '@ppt';

export const editFile = createAction(
    '[Edit File] Edit',
    props<{ fullpathfilename: string; }>()
);

export const browseFolder = createAction(
    '[Browse Folder] Browse',
    props<{ fullpathname: string; }>()
);

export const FileEditorActions = createActionGroup({
    source: 'FileEditor',
    events: {
        'Load File': props<{ fullpathfilename: string }>(),
        'Save File': props<{ fullpathfilename: string; contents: string }>(),
    },
});

export const FileSystemActions = createActionGroup({
    source: 'FileSystem',
    events: {
        'Retrieved FolderEntry List': props<{ entries: ReadonlyArray<PPTFolderEntry> }>(),
        'Retrieved File': props<{ entries: ReadonlyArray<PPTFolderEntry> }>(),
        'Persisted File': props<{ success: undefined }>(),
    },
});

export const FolderBrowserActions = createActionGroup({
    source: 'FolderBrowser',
    events: {
        'Browse Folder': props<{ fullpathname: ReadonlyArray<string> }>(),
    },
});
