import { Injectable } from '@angular/core';
import { FileAccessService } from './file-access/file-access.service';

@Injectable({
    providedIn: 'root'
})
export class DevenvCommandsService {

    constructor(private _fs: FileAccessService) {
    }

    editFile(fullpathfilename: string) {
    }

    browseFolder(fullpathname: string) {
    }
}
