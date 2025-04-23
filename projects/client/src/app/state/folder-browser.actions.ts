import { createActionGroup, props } from '@ngrx/store';

export const FolderBrowserActions = createActionGroup({
    source: 'FolderBrowser',
    events: {
        // 'Delete File': props<{ fullpathfilename: string; contents: string }>(),
        // 'Delete Folder': props<{ fullpathname: string; contents: string }>(),
        'Get FolderEntries': props<{ fullpathname: string }>(),
    },
});

// export const FileEditorActions = createActionGroup({
//     source: 'FileEditor',
//     events: {
//         'Load File': props<{ fullpathfilename: string }>(),
//         'Save File': props<{ fullpathfilename: string; contents: string }>(),
//         'Delete File': props<{ fullpathfilename: string; contents: string }>(),
//         'Get FolderEntries': props<{ fullpathfilename: string; contents: string }>(),
//     },
// });
