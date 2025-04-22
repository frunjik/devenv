import { TestBed } from '@angular/core/testing';

import { FileAccessService } from './file-access.service';

describe('FileAccessService', () => {
  let service: FileAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
