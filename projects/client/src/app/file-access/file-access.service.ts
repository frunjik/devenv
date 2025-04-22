import { Injectable } from '@angular/core';
import { PPTFilenameAndContents, PPTFolderEntry, PPTResult } from '@ppt';
import { map, Observable } from 'rxjs';
import { BackendService } from '../backend.service';

@Injectable({
    providedIn: 'root'
})
export class FileAccessService {

    constructor(private _bs: BackendService) { }

    loadFolderEntries(fullpathname: string): Observable<PPTFolderEntry[]> {
        return this._bs
            .loadFolderEntries(fullpathname);
    }

    loadFile(fullpathfilename: string): Observable<PPTFilenameAndContents> {
        return this._bs
            .loadFile(fullpathfilename)
            .pipe(
                map(
                    (contents) => ({filename: fullpathfilename, contents}
                )
            )
        );
    }

    saveFile(fullpathfilename: string, contents: string): Observable<void> {
        return this._bs
            .saveFile(fullpathfilename, contents);
    }
}
