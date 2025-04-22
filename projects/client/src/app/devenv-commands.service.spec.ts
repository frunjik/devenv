import { TestBed } from '@angular/core/testing';

import { DevenvCommandsService } from './devenv-commands.service';

describe('DevenvCommandsService', () => {
    let service: DevenvCommandsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DevenvCommandsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
