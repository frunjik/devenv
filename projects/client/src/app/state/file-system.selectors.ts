import { createFeatureSelector } from '@ngrx/store';
import { PPTFolderEntry } from '@ppt';

export const selectBooks = createFeatureSelector<ReadonlyArray<PPTFolderEntry>>('folderEntries');
