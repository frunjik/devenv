import { TestBed } from '@angular/core/testing';

import { BackendService } from './backend.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('BackendService', () => {
  let service: BackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            provideHttpClient(),
            provideHttpClientTesting(),            
        ]
    });
    service = TestBed.inject(BackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
