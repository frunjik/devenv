import { createAction, props } from '@ngrx/store';

export const editFile = createAction(
    '[Edit File] Edit',
    props<{ fullpathfilename: string; }>()
);

export const browseFolder = createAction(
    '[Browse Folder] Browse',
    props<{ fullpathname: string; }>()
);
