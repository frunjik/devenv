import { Injectable } from '@angular/core';
import { PPTFilenameAndContents, PPTFolderEntry, PPTResult } from '@ppt';
import { map, Observable } from 'rxjs';
import { BackendService } from '../backend.service';

@Injectable({
    providedIn: 'root'
})
export class FileAccessService {

    constructor(private _bs: BackendService) { }

    loadFolderEntries(fullpathname: string): Observable<ReadonlyArray<PPTFolderEntry>> {
        return this._bs
            .loadFolderEntries(fullpathname);
    }

    loadFile(fullpathfilename: string): Observable<string> {
        return this._bs
            .loadFile(fullpathfilename);
    }

    saveFile(fullpathfilename: string, contents: string): Observable<void> {
        return this._bs
            .saveFile(fullpathfilename, contents);
    }
}
